import Phaser from 'phaser';

export class FloatingNumberPool {
  private readonly pool: Phaser.GameObjects.Text[] = [];

  constructor(private readonly scene: Phaser.Scene) {}

  pop(x: number, y: number, amount: string, color = '#f0c45f'): void {
    const text = this.pool.pop() ?? this.scene.add.text(x, y, '', { fontSize: '20px', color, fontStyle: 'bold' });
    text.setText(amount).setPosition(x, y).setAlpha(1).setActive(true).setVisible(true);
    this.scene.tweens.add({
      targets: text,
      y: y - 60,
      alpha: 0,
      duration: 650,
      ease: 'Cubic.Out',
      onComplete: () => {
        text.setVisible(false).setActive(false);
        this.pool.push(text);
      },
    });
  }
}
