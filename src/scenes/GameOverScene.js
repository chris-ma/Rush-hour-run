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

    this.add.rectangle(cx, HEIGHT / 2, WIDTH, HEIGHT, 0x000000, 0.85);

    const reasonColor = this.reason === 'COLLISION!' ? '#ff4444' : '#ffaa22';
    this.add.text(cx, 200, this.reason, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '26px',
      color: reasonColor,
      stroke: '#000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    const sub = this.reason === 'COLLISION!'
      ? 'YOU GOT BUMPED!'
      : 'YOU MISSED YOUR SHIFT!';
    this.add.text(cx, 252, sub, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#888880',
    }).setOrigin(0.5);

    this.add.text(cx, 330, `REACHED LEVEL ${this.level}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '13px',
      color: '#cccccc',
      stroke: '#000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.add.text(cx, 366, `BEST: LEVEL ${highest}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#66aaff',
    }).setOrigin(0.5);

    // Buttons handled by the DOM layer — no Phaser input needed
    const self = this;
    window.RHRui.showGameOver(
      function () {                                    // retry
        window.RHRui.hide();
        self.scene.start('Game', { level: 1 });
      },
      function () {                                    // menu
        window.RHRui.hide();
        self.scene.start('Menu');
      }
    );
  }
}
