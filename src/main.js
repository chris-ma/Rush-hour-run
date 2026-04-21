window.RHR = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game-root',       // explicit parent so Phaser owns coordinate space
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
  scene: [BootScene, MenuScene, GameScene, GameOverScene],
});
