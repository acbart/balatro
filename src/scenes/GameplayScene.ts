import Phaser from 'phaser';
import consumables from '../data/consumables.json';
import { DeckManager } from '../managers/deckManager';
import type { Card } from '../models/card';
import type { RunState } from '../models/run';
import { ModifierEngine } from '../engines/modifierEngine';
import { ScoringEngine } from '../engines/scoringEngine';
import { CardView } from '../ui/CardView';
import { FloatingNumberPool } from '../ui/FloatingNumberPool';
import { HandBanner } from '../ui/HandBanner';
import { RunStatsPanel } from '../ui/RunStatsPanel';
import { Tooltip } from '../ui/Tooltip';
import { modifierDefinitions, createRun } from '../systems/runFactory';
import { SeededRng } from '../systems/rng';
import { saveRun } from '../systems/saveSystem';
import { EventBus } from '../systems/eventBus';
import { AudioEngine } from '../systems/audioEngine';

interface GameplayData {
  seed?: string;
  fresh?: boolean;
  state?: RunState;
}

export class GameplayScene extends Phaser.Scene {
  private state!: RunState;
  private rng!: SeededRng;
  private deckManager!: DeckManager;
  private modifierEngine!: ModifierEngine;
  private scoringEngine!: ScoringEngine;
  private readonly handViews: CardView[] = [];
  private selected = new Set<string>();
  private readonly drawnCards: Card[] = [];
  private playZone!: Phaser.GameObjects.Rectangle;
  private stats!: RunStatsPanel;
  private floaters!: FloatingNumberPool;
  private handBanner!: HandBanner;
  private eventBus = new EventBus();
  private tooltip!: Tooltip;
  private particles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private audio = new AudioEngine();

  constructor() {
    super('Gameplay');
  }

  create(data: GameplayData): void {
    this.state = data.state ?? createRun(data.seed ?? `${Date.now()}`);
    this.rng = new SeededRng(`${this.state.seed}:${this.state.ante}:${this.state.round}`);
    this.deckManager = new DeckManager(this.rng);
    this.modifierEngine = new ModifierEngine(this.state.modifiers);
    this.scoringEngine = new ScoringEngine(this.modifierEngine);
    const startAdjustments = this.modifierEngine.applyRoundStart({
      currency: this.state.currency,
      blindTarget: this.state.blindTarget,
    });
    this.state.currency = startAdjustments.currency;
    this.state.blindTarget = startAdjustments.blindTarget;

    this.drawBoard();
    this.drawButtons();
    this.bindInput();
    this.drawHand();
    this.refreshStats();

    this.eventBus.on('score', (amount: number) => this.floaters.pop(this.scale.width / 2, 230, `+${amount}`));
    this.eventBus.on('round-end', () => saveRun(this.state));
    this.audio.playAmbient(1);
  }

  private bindInput(): void {
    this.input.on('drag', (_pointer: Phaser.Input.Pointer, obj: Phaser.GameObjects.GameObject, dragX: number, dragY: number) => {
      const cardView = obj as CardView;
      cardView.x = dragX;
      cardView.y = dragY;
    });

    this.input.on('dragend', (_pointer: Phaser.Input.Pointer, obj: Phaser.GameObjects.GameObject) => {
      const cardView = obj as CardView;
      const dropped = Phaser.Geom.Rectangle.ContainsPoint(this.playZone.getBounds(), new Phaser.Geom.Point(cardView.x, cardView.y));
      if (dropped) {
        this.selected.add(cardView.card.id);
        cardView.setSelected(true);
        this.alignSelectedCards();
      } else {
        this.selected.delete(cardView.card.id);
        this.layoutHand();
      }
    });
  }

  private drawBoard(): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x0b0d15).setAlpha(0.7);
    this.add.rectangle(width / 2, height - 150, width * 0.85, 180, 0x0f1524, 0.75).setStrokeStyle(2, 0xae8e4a);
    this.playZone = this.add.rectangle(width / 2, height / 2 + 10, 460, 160, 0x1c273f, 0.4).setStrokeStyle(2, 0x5de2d4);
    this.add.text(width / 2, this.playZone.y - 20, 'DROP UP TO 5 CARDS TO SCORE', { fontSize: '18px', color: '#7adfd6' }).setOrigin(0.5);
    this.stats = new RunStatsPanel(this);
    this.floaters = new FloatingNumberPool(this);
    this.handBanner = new HandBanner(this);
    this.tooltip = new Tooltip(this);
    this.particles = this.add.particles(0, 0, 'spark', { lifespan: 300, scale: { start: 0.25, end: 0 }, speed: { min: 40, max: 170 } });
  }

  private drawButtons(): void {
    const makeBtn = (x: number, y: number, label: string, onPress: () => void): void => {
      const text = this.add
        .text(x, y, label, { fontSize: '20px', color: '#f7e0af', backgroundColor: '#1e283e', padding: { x: 10, y: 6 } })
        .setInteractive();
      text.on('pointerup', onPress);
      text.on('pointerover', () => text.setScale(1.05));
      text.on('pointerout', () => text.setScale(1));
    };

    makeBtn(30, this.scale.height - 50, 'SCORE HAND', () => this.scoreSelection());
    makeBtn(190, this.scale.height - 50, 'DISCARD', () => this.discardSelection());
    makeBtn(300, this.scale.height - 50, 'DECK', () => this.showDeckViewer());
    makeBtn(380, this.scale.height - 50, 'SAVE', () => saveRun(this.state));
  }

  private drawHand(): void {
    this.handViews.forEach((view) => view.destroy());
    this.handViews.length = 0;
    this.selected.clear();
    this.drawnCards.length = 0;

    const drawResult = this.deckManager.draw(this.state.drawPile, 8, this.state.discardPile);
    this.state.drawPile = drawResult.drawPile;
    this.drawnCards.push(...drawResult.cards);

    drawResult.cards.forEach((card, idx) => {
      const x = 130 + idx * 95;
      const y = this.scale.height - 150;
      const view = new CardView(this, x, y, card);
      this.input.setDraggable(view);
      this.handViews.push(view);

      view.on('pointerover', () => this.tooltip.show(view.x + 60, view.y - 85, `${card.rank} of ${card.suit}`));
      view.on('pointerout', () => this.tooltip.hide());
      view.on('pointerdown', () => this.audio.playCard());
    });

    this.layoutHand();
  }

  private alignSelectedCards(): void {
    const selectedViews = this.handViews.filter((view) => this.selected.has(view.card.id)).slice(0, 5);
    selectedViews.forEach((view, index) => {
      view.setSelected(true);
      this.tweens.add({ targets: view, x: this.playZone.x - 160 + index * 80, y: this.playZone.y + 20, duration: 160 });
    });

    const unselected = this.handViews.filter((view) => !this.selected.has(view.card.id));
    unselected.forEach((view, index) => {
      view.setSelected(false);
      this.tweens.add({ targets: view, x: 130 + index * 95, y: this.scale.height - 150, duration: 160 });
    });
  }

  private layoutHand(): void {
    this.handViews.forEach((view, index) => {
      view.setSelected(this.selected.has(view.card.id));
      this.tweens.add({ targets: view, x: 130 + index * 95, y: this.scale.height - 150, duration: 120 });
    });
  }

  private getSelectedCards(): Card[] {
    return this.drawnCards.filter((card) => this.selected.has(card.id)).slice(0, 5);
  }

  private scoreSelection(): void {
    if (this.state.handsRemaining <= 0) return;

    const cards = this.getSelectedCards();
    const output = this.scoringEngine.score(cards, this.state.discardsRemaining, this.state.streak, this.state.currency);

    this.state.handsRemaining -= 1;
    this.state.score += output.total;
    this.state.streak += 1;
    this.handBanner.show(output.handName);

    this.eventBus.emit('score', output.total);
    this.audio.playChipTick(output.multiplier);
    this.cameras.main.shake(150, Math.min(0.008, output.multiplier / 800));
    this.particles.explode(14, this.scale.width / 2, 260);

    cards.forEach((card) => this.state.discardPile.push(card));
    this.drawnCards.forEach((card) => {
      if (!cards.find((chosen) => chosen.id === card.id)) this.state.discardPile.push(card);
    });

    this.refreshStats();
    this.evaluateRoundState();
    this.drawHand();
  }

  private discardSelection(): void {
    if (this.state.discardsRemaining <= 0) return;
    const cards = this.getSelectedCards();
    if (cards.length === 0) return;

    this.state.discardsRemaining -= 1;
    cards.forEach((card) => this.state.discardPile.push(card));
    this.drawnCards.forEach((card) => {
      if (!cards.find((selected) => selected.id === card.id)) this.state.drawPile.push(card);
    });
    this.state.drawPile = this.deckManager.createShuffledDeck().filter((card) => this.state.drawPile.some((d) => d.id === card.id));
    this.state.streak = 0;

    this.refreshStats();
    this.drawHand();
  }

  private evaluateRoundState(): void {
    if (this.state.score >= this.state.blindTarget) {
      const reward = Math.floor(this.state.blindTarget / 11) + this.state.handsRemaining * 6;
      this.state.currency += reward;
      this.eventBus.emit('round-end', reward);
      this.scene.start('Shop', { state: this.state, reward, definitions: modifierDefinitions, consumables });
      return;
    }

    if (this.state.handsRemaining <= 0) {
      this.scene.start('GameOver', { score: this.state.score, ante: this.state.ante });
    }
  }

  private showDeckViewer(): void {
    const panel = this.add.rectangle(this.scale.width - 180, this.scale.height / 2, 320, 340, 0x11182b, 0.95).setStrokeStyle(1, 0xd9b36f);
    const text = this.add
      .text(panel.x - 145, panel.y - 145, `Deck: ${this.state.drawPile.length + this.state.discardPile.length}\nDiscard: ${this.state.discardPile.length}\nModifiers: ${this.modifierEngine.getModifiers().length}`, {
        color: '#f8e7bd',
        fontSize: '16px',
      })
      .setDepth(3000);
    this.time.delayedCall(1800, () => {
      panel.destroy();
      text.destroy();
    });
  }

  private refreshStats(): void {
    this.stats.render({
      score: this.state.score,
      target: this.state.blindTarget,
      currency: this.state.currency,
      hands: this.state.handsRemaining,
      discards: this.state.discardsRemaining,
      ante: this.state.ante,
      round: this.state.round,
    });
  }
}
