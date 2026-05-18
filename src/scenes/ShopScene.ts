import Phaser from 'phaser';
import type { ConsumableDefinition } from '../models/consumable';
import type { ModifierDefinition } from '../models/modifier';
import type { RunState } from '../models/run';
import { nextRound } from '../systems/runFactory';
import { SeededRng } from '../systems/rng';
import { saveRun } from '../systems/saveSystem';
import { generateShopOffers, type ShopOffer } from '../systems/shopGenerator';

interface ShopData {
  state: RunState;
  reward: number;
  definitions: ModifierDefinition[];
  consumables: ConsumableDefinition[];
}

export class ShopScene extends Phaser.Scene {
  private state!: RunState;
  private offers: ShopOffer[] = [];
  private defs!: ModifierDefinition[];
  private consumables!: ConsumableDefinition[];
  private header!: Phaser.GameObjects.Text;

  constructor() {
    super('Shop');
  }

  create(data: ShopData): void {
    this.state = data.state;
    this.defs = data.definitions;
    this.consumables = data.consumables;
    this.state.currency += Math.floor(this.state.currency * 0.2); // interest economy

    this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0x0e111a);
    this.header = this.add.text(30, 26, '', { color: '#f6ddb0', fontSize: '24px' });

    this.add
      .text(30, this.scale.height - 60, 'REROLL ($2)', { color: '#8be6de', fontSize: '22px', backgroundColor: '#1f2f40', padding: { x: 8, y: 6 } })
      .setInteractive()
      .on('pointerup', () => {
        if (this.state.currency >= 2) {
          this.state.currency -= 2;
          this.renderOffers();
        }
      });

    this.add
      .text(220, this.scale.height - 60, 'NEXT BLIND', { color: '#ffd57d', fontSize: '22px', backgroundColor: '#27311f', padding: { x: 8, y: 6 } })
      .setInteractive()
      .on('pointerup', () => {
        const next = nextRound(this.state);
        saveRun(next);
        this.scene.start('Gameplay', { state: next, fresh: false });
      });

    this.renderOffers();
  }

  private renderOffers(): void {
    this.children.getAll().forEach((obj) => {
      if (obj.name === 'offer') obj.destroy();
    });

    const rng = new SeededRng(`${this.state.seed}:shop:${this.state.ante}:${this.state.round}:${this.state.currency}`);
    this.offers = generateShopOffers(rng, this.defs, this.consumables);
    this.header.setText(`Shop • Balance $${this.state.currency}`);

    this.offers.forEach((offer, index) => {
      const y = 130 + index * 110;
      const box = this.add.rectangle(this.scale.width / 2, y, 900, 90, 0x141d2d, 0.95).setStrokeStyle(2, 0xd4b16f);
      box.name = 'offer';
      const text = this.add
        .text(box.x - 430, y - 30, `${offer.name} [$${offer.cost}]\n${offer.description}`, { color: '#f4e2bc', fontSize: '18px' })
        .setInteractive();
      text.name = 'offer';
      text.on('pointerup', () => this.purchase(offer));
    });
  }

  private purchase(offer: ShopOffer): void {
    if (this.state.currency < offer.cost) return;
    this.state.currency -= offer.cost;
    if (offer.type === 'modifier') {
      const definition = this.defs.find((d) => d.id === offer.payloadId);
      if (definition) this.state.modifiers.push({ ...definition, stackCount: 1 });
    }
    if (offer.type === 'consumable') {
      if (offer.payloadId.includes('planet')) this.state.handsRemaining += 1;
      if (offer.payloadId.includes('mirror')) this.state.discardsRemaining += 1;
      if (offer.payloadId.includes('gold')) this.state.currency += 8;
    }
    this.renderOffers();
  }
}
