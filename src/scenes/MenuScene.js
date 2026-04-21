class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }

  create() {
    const { WIDTH, HEIGHT, LS_KEY } = C;
    const cx = WIDTH / 2;
    const highest = parseInt(localStorage.getItem(LS_KEY) || '0', 10);

    // Background — dark asphalt fill
    this.add.rectangle(cx, HEIGHT / 2, WIDTH, HEIGHT, 0x1e1e22);

    // Street stripes (decorative)
    const g = this.add.graphics();
    g.fillStyle(0x333338);
    for (let y = 0; y < HEIGHT; y += 60) {
      g.fillRect(0, y, WIDTH, 28);
    }

    // Vignette overlay
    const vig = this.add.graphics();
    vig.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.7, 0.7, 0, 0);
    vig.fillRect(0, 0, WIDTH, HEIGHT);

    // Title
    this.add.text(cx, 180, 'RUSH', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '40px',
      color: '#eecc44',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(cx, 228, 'HOUR', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '40px',
      color: '#eecc44',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(cx, 276, 'RUN', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '40px',
      color: '#ee4444',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    // Tagline
    this.add.text(cx, 330, "DON'T BE LATE", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#888880',
    }).setOrigin(0.5);

    // Highest level
    if (highest > 0) {
      this.add.text(cx, 390, `BEST: LEVEL ${highest}`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '11px',
        color: '#66aaff',
      }).setOrigin(0.5);
    }

    // Accept the first deliberate tap anywhere on screen.
    // The 300 ms guard ignores any phantom touch that fires when
    // the scene activates (common on iOS/Android).
    let started = false;
    const readyAt = this.time.now + 300;
    this.input.on('pointerdown', () => {
      if (started || this.time.now < readyAt) return;
      started = true;
      this.scene.start('Game', { level: 1 });
    });

    // Play button (visual indicator — the whole screen is tappable)
    const btn = this.add.text(cx, 490, '[ TAP TO PLAY ]', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Blink
    this.tweens.add({
      targets: btn,
      alpha: 0.2,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Controls hint
    this.add.text(cx, 580, 'DRAG TO MOVE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#555550',
    }).setOrigin(0.5);

    this.add.text(cx, 600, 'WASD ON DESKTOP', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#555550',
    }).setOrigin(0.5);
  }
}
