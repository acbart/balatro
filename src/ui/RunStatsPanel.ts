import Phaser from 'phaser';

interface Stats {
  score: number;
  target: number;
  currency: number;
  hands: number;
  discards: number;
  ante: number;
  round: number;
}

export class RunStatsPanel {
  private readonly text: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.text = scene.add.text(20, 20, '', { fontSize: '18px', color: '#f5dfac' }).setDepth(1100);
  }

  render(stats: Stats): void {
    this.text.setText([
      `Ante ${stats.ante} • Round ${stats.round}`,
      `Score ${stats.score} / ${stats.target}`,
      `Hands ${stats.hands} • Discards ${stats.discards}`,
      `Currency $${stats.currency}`,
    ]);
  }
}
