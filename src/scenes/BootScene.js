class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  create() {
    this._makePlayer();
    this._makeNPC('npc_a', 0x3a5faa);   // blue — Straight Walker
    this._makeNPC('npc_b', 0xaa3333);   // red  — Pacer
    this._makeNPC('npc_c', 0x8faa22);   // green — Wanderer
    this._makeMarker('marker_a', 0x00c83c, 0.35, 0x22ee66);
    this._makeMarker('marker_b', 0x2878ff, 0.35, 0x44aaff);
    // Sit idle — HTML menu (index.html) drives the first scene transition
  }

  // 16×16 top-down person drawn with Phaser Graphics then baked to a texture
  _makePlayer() {
    const g = this.add.graphics();

    g.fillStyle(0x334466);   // suit body
    g.fillRect(5, 6, 6, 6);

    g.fillStyle(0xf0c07a);   // head
    g.fillRect(6, 2, 4, 4);

    g.fillStyle(0x222233);   // legs
    g.fillRect(5, 12, 2, 3);
    g.fillRect(9, 12, 2, 3);

    g.fillStyle(0x111111);   // shoes
    g.fillRect(5, 15, 2, 1);
    g.fillRect(9, 15, 2, 1);

    g.fillStyle(0x8b6420);   // briefcase
    g.fillRect(11, 7, 3, 3);
    g.fillStyle(0xaa8833);   // handle
    g.fillRect(12, 6, 1, 1);

    g.generateTexture('player', 16, 16);
    g.destroy();
  }

  _makeNPC(key, bodyColor) {
    const g = this.add.graphics();

    g.fillStyle(bodyColor);
    g.fillRect(5, 6, 6, 6);

    g.fillStyle(0xf0c07a);
    g.fillRect(6, 2, 4, 4);

    g.fillStyle(0x222233);
    g.fillRect(5, 12, 2, 3);
    g.fillRect(9, 12, 2, 3);

    g.fillStyle(0x111111);
    g.fillRect(5, 15, 2, 1);
    g.fillRect(9, 15, 2, 1);

    g.generateTexture(key, 16, 16);
    g.destroy();
  }

  // 48×48 semi-transparent zone marker
  _makeMarker(key, fillColor, fillAlpha, strokeColor) {
    const g = this.add.graphics();

    g.fillStyle(fillColor, fillAlpha);
    g.fillRect(0, 0, 48, 48);

    g.lineStyle(2, strokeColor, 1);
    g.strokeRect(1, 1, 46, 46);

    const tick = 8;
    [[0, 0], [40, 0], [0, 40], [40, 40]].forEach(([x, y]) => {
      g.strokeRect(x + 1, y + 1, tick, tick);
    });

    g.generateTexture(key, 48, 48);
    g.destroy();
  }
}
