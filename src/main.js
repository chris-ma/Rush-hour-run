new Phaser.Game({
  type: Phaser.AUTO,
  width: C.WIDTH,
  height: C.HEIGHT,
  pixelArt: true,
  backgroundColor: '#111114',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, MenuScene, GameScene, GameOverScene],
});
