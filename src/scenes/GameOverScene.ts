import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  create(data: { score: number; ante: number }): void {
    const { width, height } = this.scale;
    this.add.text(width / 2, height / 2 - 60, 'RUN OVER', { fontSize: '48px', color: '#ff8a9d' }).setOrigin(0.5);
    this.add
      .text(width / 2, height / 2, `Final Score ${data.score}\nReached Ante ${data.ante}`, { fontSize: '24px', color: '#f2ddac', align: 'center' })
      .setOrigin(0.5);
    this.add
      .text(width / 2, height / 2 + 90, 'Return to Menu', { fontSize: '22px', color: '#8de5dc' })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerup', () => this.scene.start('MainMenu'));
  }
}
