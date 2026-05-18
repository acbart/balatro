import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    this.cameras.main.setBackgroundColor(0x090b12);
    const gfx = this.add.graphics();
    gfx.fillStyle(0xffde86, 1);
    gfx.fillCircle(4, 4, 4);
    gfx.generateTexture('spark', 8, 8);
    gfx.destroy();
    this.scene.start('MainMenu');
  }
}
