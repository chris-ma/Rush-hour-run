class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOver'); }

  init(data) {
    this.reason = data.reason || 'GAME OVER';
    this.level  = data.level  || 1;
  }

  create() {
    const { WIDTH, HEIGHT, LS_KEY } = C;
    const cx      = WIDTH / 2;
    const highest = parseInt(localStorage.getItem(LS_KEY) || '0', 10);

    // Dark overlay
    this.add.rectangle(cx, HEIGHT / 2, WIDTH, HEIGHT, 0x000000, 0.82);

    // Reason
    const reasonColor = this.reason === 'COLLISION!' ? '#ff4444' : '#ffaa22';
    this.add.text(cx, 200, this.reason, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '26px',
      color: reasonColor,
      stroke: '#000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    // Sub-message
    const sub = this.reason === 'COLLISION!'
      ? 'YOU GOT BUMPED!'
      : 'YOU MISSED YOUR SHIFT!';
    this.add.text(cx, 248, sub, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#888880',
    }).setOrigin(0.5);

    // Level reached
    this.add.text(cx, 320, `REACHED LEVEL ${this.level}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '13px',
      color: '#cccccc',
      stroke: '#000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Highest level
    this.add.text(cx, 356, `BEST: LEVEL ${highest}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#66aaff',
    }).setOrigin(0.5);

    // Retry button
    const retry = this._makeBtn(cx, 460, '[ RETRY ]', '#ffffff');
    retry.on('pointerdown', () => this.scene.start('Game', { level: 1 }));

    // Menu button
    const menu = this._makeBtn(cx, 520, '[ MENU ]', '#aaaaaa');
    menu.on('pointerdown', () => this.scene.start('Menu'));
  }

  _makeBtn(x, y, label, color) {
    const btn = this.add.text(x, y, label, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '16px',
      color,
      stroke: '#000',
      strokeThickness: 4,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover',  () => btn.setAlpha(0.7));
    btn.on('pointerout',   () => btn.setAlpha(1.0));
    return btn;
  }
}
