import Phaser from 'phaser';
import { loadRun } from '../systems/saveSystem';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenu');
  }

  create(): void {
    const { width, height } = this.scale;
    this.add.text(width / 2, 120, 'BALATRO // ROGUELIKE POKER', { fontSize: '42px', color: '#ffd36b' }).setOrigin(0.5);

    const start = this.add.text(width / 2, height / 2, 'NEW RUN', { fontSize: '30px', color: '#f4deb0' }).setOrigin(0.5).setInteractive();
    const resume = this.add
      .text(width / 2, height / 2 + 70, 'RESUME', { fontSize: '24px', color: '#9be9e3' })
      .setOrigin(0.5)
      .setInteractive();

    start.on('pointerup', () => {
      const seed = new URLSearchParams(window.location.search).get('seed') ?? `${Date.now()}`;
      this.scene.start('Gameplay', { seed, fresh: true });
    });

    resume.on('pointerup', () => {
      const saved = loadRun();
      if (saved) this.scene.start('Gameplay', { state: saved, fresh: false });
    });
  }
}
