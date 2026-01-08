import Phaser from 'phaser';

export class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
  }

  create() {
    this.add.text(640, 360, 'Main Game Scene', { 
      fontSize: '32px', 
      color: '#fff' 
    }).setOrigin(0.5);

    // 返回按鈕
    const backBtn = this.add.text(20, 20, 'BACK', { 
      fontSize: '20px', 
      color: '#fff',
      backgroundColor: '#444',
      padding: { x: 10, y: 5 }
    })
    .setInteractive({ useHandCursor: true });

    backBtn.on('pointerdown', () => {
      this.scene.start('StartScene');
    });
  }

  update() {
    // 遊戲主迴圈
  }
}
