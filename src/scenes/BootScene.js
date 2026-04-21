class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  create() {
    this._makePlayer();
    this._makeNPC('npc_a', '#3a5faa');   // blue — Straight Walker
    this._makeNPC('npc_b', '#aa3333');   // red  — Pacer
    this._makeNPC('npc_c', '#8faa22');   // green — Wanderer
    this._makeMarker('marker_a', 'rgba(0,200,60,0.35)', '#22ee66');
    this._makeMarker('marker_b', 'rgba(40,120,255,0.35)', '#44aaff');
    this.scene.start('Menu');
  }

  // 16×16 top-down person, pixel-art style
  _makePlayer() {
    const t = this.textures.createCanvas('player', 16, 16);
    const c = t.getContext();

    // Suit body
    c.fillStyle = '#334466';
    c.fillRect(5, 6, 6, 6);

    // Head
    c.fillStyle = '#f0c07a';
    c.fillRect(6, 2, 4, 4);

    // Legs
    c.fillStyle = '#222233';
    c.fillRect(5, 12, 2, 3);
    c.fillRect(9, 12, 2, 3);

    // Shoes
    c.fillStyle = '#111111';
    c.fillRect(5, 15, 2, 1);
    c.fillRect(9, 15, 2, 1);

    // Briefcase (right side)
    c.fillStyle = '#8B6420';
    c.fillRect(11, 7, 3, 3);
    c.fillStyle = '#aa8833';
    c.fillRect(12, 6, 1, 1); // handle

    t.refresh();
  }

  _makeNPC(key, bodyColor) {
    const t = this.textures.createCanvas(key, 16, 16);
    const c = t.getContext();

    c.fillStyle = bodyColor;
    c.fillRect(5, 6, 6, 6);

    c.fillStyle = '#f0c07a';
    c.fillRect(6, 2, 4, 4);

    c.fillStyle = '#222233';
    c.fillRect(5, 12, 2, 3);
    c.fillRect(9, 12, 2, 3);

    c.fillStyle = '#111111';
    c.fillRect(5, 15, 2, 1);
    c.fillRect(9, 15, 2, 1);

    t.refresh();
  }

  // 48×48 semi-transparent zone marker
  _makeMarker(key, fill, stroke) {
    const t = this.textures.createCanvas(key, 48, 48);
    const c = t.getContext();
    c.fillStyle = fill;
    c.fillRect(0, 0, 48, 48);
    c.strokeStyle = stroke;
    c.lineWidth = 2;
    c.strokeRect(1, 1, 46, 46);
    // Corner ticks
    const tick = 8;
    c.lineWidth = 3;
    [[0,0],[40,0],[0,40],[40,40]].forEach(([x,y]) => {
      c.strokeRect(x + 1, y + 1, tick, tick);
    });
    t.refresh();
  }
}
