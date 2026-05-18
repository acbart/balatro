import Phaser from 'phaser';

export class HandBanner {
  private readonly label: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.label = scene.add
      .text(scene.scale.width / 2, 60, '', { fontSize: '36px', color: '#ffd76a', fontStyle: 'bold' })
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(1200);
  }

  show(name: string): void {
    this.label.setText(name).setScale(0.7).setAlpha(1);
    this.label.scene.tweens.add({
      targets: this.label,
      scale: 1.15,
      yoyo: true,
      duration: 220,
      repeat: 1,
    });
  }
}
