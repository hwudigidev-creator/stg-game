import Phaser from 'phaser';

export class StartScene extends Phaser.Scene {
  constructor() {
    super('StartScene');
  }

  preload() {
    // 這裡未來會放置進度條
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading...',
      style: {
        font: '20px monospace',
        color: '#ffffff'
      }
    });
    loadingText.setOrigin(0.5, 0.5);

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2, 320, 50);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 + 10, 300 * value, 300);
    });

    this.load.on('complete', () => {
      loadingText.destroy();
      progressBar.destroy();
      progressBox.destroy();
    });

    // 佔位資源載入 (如果有)
    // this.load.image('logo', 'images/logo.png');
  }

  create() {
    this.add.text(640, 300, 'STG Game', { 
      fontSize: '64px', 
      color: '#fff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    const startBtn = this.add.text(640, 450, 'START GAME', { 
      fontSize: '32px', 
      color: '#0f0',
      fontFamily: 'Arial',
      backgroundColor: '#222',
      padding: { x: 20, y: 10 }
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });

    startBtn.on('pointerdown', () => {
      this.scene.start('MainScene');
    });

    // 版本號
    this.add.text(1270, 710, 'v' + __APP_VERSION__, { 
      fontSize: '16px', 
      color: '#888'
    }).setOrigin(1, 1);
  }
}
