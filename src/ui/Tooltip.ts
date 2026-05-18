import Phaser from 'phaser';

export class Tooltip {
  private readonly box: Phaser.GameObjects.Container;
  private readonly text: Phaser.GameObjects.Text;

  constructor(private readonly scene: Phaser.Scene) {
    const bg = scene.add.rectangle(0, 0, 260, 70, 0x10131f, 0.9).setStrokeStyle(1, 0xd7b56d);
    this.text = scene.add.text(-120, -26, '', { color: '#f4deb0', fontSize: '14px', wordWrap: { width: 240 } });
    this.box = scene.add.container(0, 0, [bg, this.text]).setVisible(false).setDepth(2000);
  }

  show(x: number, y: number, label: string): void {
    this.text.setText(label);
    this.box.setPosition(x, y).setVisible(true);
  }

  hide(): void {
    this.box.setVisible(false);
  }
}
