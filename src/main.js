// MenuScene removed — menu is pure HTML (see index.html)
// Phaser only handles game rendering and joystick input
window.RHR = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game-root',
  width: C.WIDTH,
  height: C.HEIGHT,
  pixelArt: true,
  backgroundColor: '#111114',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  input: {
    activePointers: 3,
  },
  scene: [BootScene, GameScene, GameOverScene],
});
