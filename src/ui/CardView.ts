import Phaser from 'phaser';
import type { Card } from '../models/card';

export class CardView extends Phaser.GameObjects.Container {
  public readonly card: Card;
  private readonly bg: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number, card: Card) {
    super(scene, x, y);
    this.card = card;
    this.bg = scene.add.rectangle(0, 0, 80, 110, 0x182030, 0.95).setStrokeStyle(2, 0xd8af60);
    const rank = scene.add.text(-28, -42, `${card.rank}`, { fontSize: '24px', color: '#fff1c7', fontStyle: 'bold' });
    const suit = scene.add.text(-30, 6, card.suit[0], { fontSize: '30px', color: '#ff6a8a' });
    this.add([this.bg, rank, suit]);
    this.setSize(80, 110);
    this.setInteractive({ draggable: true, useHandCursor: true });
    scene.add.existing(this);
  }

  setSelected(selected: boolean): void {
    this.bg.setStrokeStyle(3, selected ? 0x52f4f4 : 0xd8af60);
  }
}
