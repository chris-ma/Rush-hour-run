class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  // ─── init ──────────────────────────────────────────────────────────────────

  init(data) {
    this.currentLevel = data.level || 1;
    this.playing      = false;
    this.ended        = false;
    this.npcs         = [];

    // Joystick state
    this.joyActive    = false;
    this.joyPtrId     = null;
    this.joyOrigin    = { x: 0, y: 0 };
    this.joyVector    = { x: 0, y: 0 };

    this.timeLeft     = 0;
    this.timerEvent   = null;
  }

  // ─── create ────────────────────────────────────────────────────────────────

  create() {
    this._drawBackground();
    this._createMarkers();
    this._createPlayer();
    this._spawnNPCs();
    this._createHUD();
    this._createJoystick();
    this._setupKeyboard();
    this._showCountdown();
  }

  // ─── background ────────────────────────────────────────────────────────────

  _drawBackground() {
    const { WIDTH, PLAY_H, HEIGHT, JOY_ZONE_Y,
            COL_ASPHALT, COL_PAVEMENT, COL_KERB, COL_MARKING, COL_JOY_ZONE } = C;
    const g = this.add.graphics();

    // Pavement strips (left & right)
    g.fillStyle(COL_PAVEMENT);
    g.fillRect(0, 0, 72, PLAY_H);
    g.fillRect(WIDTH - 72, 0, 72, PLAY_H);

    // Asphalt road (centre)
    g.fillStyle(COL_ASPHALT);
    g.fillRect(72, 0, WIDTH - 144, PLAY_H);

    // Kerb edges
    g.fillStyle(COL_KERB);
    g.fillRect(68, 0, 4, PLAY_H);
    g.fillRect(WIDTH - 72, 0, 4, PLAY_H);

    // Centre road dashes
    g.fillStyle(COL_MARKING);
    for (let y = 0; y < PLAY_H; y += 48) {
      g.fillRect(WIDTH / 2 - 2, y, 4, 24);
    }

    // Pavement cracks (decorative)
    g.lineStyle(1, 0x4a4a44);
    const rng = new Phaser.Math.RandomDataGenerator(['rhr-cracks']);
    for (let i = 0; i < 12; i++) {
      const cx = rng.between(4, 60);
      const cy = rng.between(10, PLAY_H - 10);
      g.strokeLine(cx, cy, cx + rng.between(-10, 10), cy + rng.between(-10, 10));
    }
    for (let i = 0; i < 12; i++) {
      const cx = rng.between(WIDTH - 68, WIDTH - 4);
      const cy = rng.between(10, PLAY_H - 10);
      g.strokeLine(cx, cy, cx + rng.between(-10, 10), cy + rng.between(-10, 10));
    }

    // Joystick zone
    g.fillStyle(COL_JOY_ZONE);
    g.fillRect(0, JOY_ZONE_Y, WIDTH, HEIGHT - JOY_ZONE_Y);

    // Separator line
    g.lineStyle(2, 0x3a3a40);
    g.strokeLine(0, JOY_ZONE_Y, WIDTH, JOY_ZONE_Y);

    // "MOVE" label in joystick zone
    this.add.text(WIDTH / 2, JOY_ZONE_Y + 24, 'DRAG HERE TO MOVE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#333338',
    }).setOrigin(0.5);
  }

  // ─── markers ───────────────────────────────────────────────────────────────

  _createMarkers() {
    const { PA, PB } = C;

    // Point A — home
    const mA = this.add.image(PA.x, PA.y, 'marker_a').setDepth(0);
    this.add.text(PA.x, PA.y - 1, 'HOME', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#22ee66',
      stroke: '#000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(1);

    // Point B — office
    const mB = this.add.image(PB.x, PB.y, 'marker_b').setDepth(0);
    this.add.text(PB.x, PB.y - 1, 'WORK', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#44aaff',
      stroke: '#000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(1);

    // Pulse tween on goal marker
    this.tweens.add({
      targets: mB,
      alpha: 0.5,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  // ─── player ────────────────────────────────────────────────────────────────

  _createPlayer() {
    this.player = this.add.image(C.PA.x, C.PA.y, 'player')
      .setScale(C.SPRITE_SCALE)
      .setDepth(5);
  }

  // ─── NPC spawning ──────────────────────────────────────────────────────────

  _spawnNPCs() {
    const count = C.NPC_COUNT_BASE + (this.currentLevel - 1) * C.NPC_COUNT_PER_LEVEL;
    const speed = C.NPC_SPEED_BASE   + (this.currentLevel - 1) * C.NPC_SPEED_PER_LEVEL;

    for (let i = 0; i < count; i++) {
      const pos  = this._safeSpawnPos();
      const type = this._randomType();
      const key  = type === 'A' ? 'npc_a' : type === 'B' ? 'npc_b' : 'npc_c';

      const npc = this.add.image(pos.x, pos.y, key)
        .setScale(C.SPRITE_SCALE)
        .setDepth(4);

      const variation = 1 + (Math.random() * 2 - 1) * C.NPC_SPEED_VAR;
      npc.npcType  = type;
      npc.speed    = speed * variation;
      npc.changeTimer = 0;

      const angle = Math.random() * Math.PI * 2;

      if (type === 'B') {
        // Pacer — single axis only
        if (Math.random() < 0.5) {
          npc.vx = (Math.random() < 0.5 ? 1 : -1) * npc.speed;
          npc.vy = 0;
        } else {
          npc.vx = 0;
          npc.vy = (Math.random() < 0.5 ? 1 : -1) * npc.speed;
        }
      } else {
        npc.vx = Math.cos(angle) * npc.speed;
        npc.vy = Math.sin(angle) * npc.speed;
        if (type === 'C') {
          npc.changeTimer = 1500 + Math.random() * 2000;
        }
      }

      this.npcs.push(npc);
    }
  }

  _randomType() {
    const r = Math.random();
    if (r < 0.5) return 'A';
    if (r < 0.8) return 'B';
    return 'C';
  }

  _safeSpawnPos() {
    let x, y, attempts = 0;
    const { WIDTH, PLAY_H, PA, PB, SPAWN_SAFE_A, SPAWN_SAFE_B, NPC_R, SPRITE_SCALE } = C;
    const margin = NPC_R * SPRITE_SCALE;

    do {
      x = Phaser.Math.Between(margin + 72, WIDTH - margin - 72);
      y = Phaser.Math.Between(margin + 10, PLAY_H - margin - 10);
      attempts++;
    } while (
      attempts < 80 &&
      (this._dist2(x, y, PA.x, PA.y) < SPAWN_SAFE_A ** 2 ||
       this._dist2(x, y, PB.x, PB.y) < SPAWN_SAFE_B ** 2 ||
       this.npcs.some(n => this._dist2(x, y, n.x, n.y) < (NPC_R * 2 * SPRITE_SCALE) ** 2))
    );
    return { x, y };
  }

  // ─── HUD ───────────────────────────────────────────────────────────────────

  _createHUD() {
    const { WIDTH, TIMER_BASE, TIMER_DEC, TIMER_MIN } = C;
    this.timeLeft = Math.max(TIMER_MIN, TIMER_BASE - (this.currentLevel - 1) * TIMER_DEC);

    // Level label
    this.add.text(10, 10, `LEVEL ${this.currentLevel}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#eecc44',
      stroke: '#000',
      strokeThickness: 3,
    }).setDepth(10);

    // Timer
    this.timerText = this.add.text(WIDTH - 10, 10, this._fmtTime(this.timeLeft), {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#000',
      strokeThickness: 4,
    }).setOrigin(1, 0).setDepth(10);
  }

  _fmtTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  }

  _updateTimerDisplay() {
    const urgent = this.timeLeft <= C.TIMER_URGENT;
    this.timerText.setText(this._fmtTime(this.timeLeft));
    this.timerText.setColor(urgent ? '#ff3333' : '#ffffff');

    if (urgent && !this._urgentTween) {
      this._urgentTween = this.tweens.add({
        targets: this.timerText,
        scaleX: 1.15,
        scaleY: 1.15,
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  // ─── virtual joystick ──────────────────────────────────────────────────────

  _createJoystick() {
    this.joyBaseGfx = this.add.graphics().setDepth(20);
    this.joyKnobGfx = this.add.graphics().setDepth(21);
    this._hideJoystick();

    this.input.on('pointerdown', this._onPointerDown, this);
    this.input.on('pointermove', this._onPointerMove, this);
    this.input.on('pointerup',   this._onPointerUp,   this);
    this.input.on('pointerupoutside', this._onPointerUp, this);
  }

  _onPointerDown(ptr) {
    if (this.joyPtrId !== null) return;     // already tracking one finger
    if (ptr.y < C.JOY_ZONE_Y) return;       // only activate in joystick zone
    this.joyActive  = true;
    this.joyPtrId   = ptr.id;
    this.joyOrigin  = { x: ptr.x, y: ptr.y };
    this._drawJoystick(ptr.x, ptr.y, ptr.x, ptr.y);
  }

  _onPointerMove(ptr) {
    if (!this.joyActive || ptr.id !== this.joyPtrId) return;
    const dx   = ptr.x - this.joyOrigin.x;
    const dy   = ptr.y - this.joyOrigin.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const clamped = Math.min(dist, C.JOY_MAX);
    const angle   = Math.atan2(dy, dx);

    const kx = this.joyOrigin.x + Math.cos(angle) * clamped;
    const ky = this.joyOrigin.y + Math.sin(angle) * clamped;
    this._drawJoystick(this.joyOrigin.x, this.joyOrigin.y, kx, ky);

    if (dist > C.JOY_DEAD) {
      const norm = clamped / C.JOY_MAX;
      this.joyVector = { x: Math.cos(angle) * norm, y: Math.sin(angle) * norm };
    } else {
      this.joyVector = { x: 0, y: 0 };
    }
  }

  _onPointerUp(ptr) {
    if (ptr.id !== this.joyPtrId) return;
    this.joyActive  = false;
    this.joyPtrId   = null;
    this.joyVector  = { x: 0, y: 0 };
    this._hideJoystick();
  }

  _drawJoystick(bx, by, kx, ky) {
    const { JOY_BASE_R, JOY_KNOB_R } = C;

    this.joyBaseGfx.clear();
    this.joyBaseGfx.fillStyle(0x888888, 0.35);
    this.joyBaseGfx.fillCircle(bx, by, JOY_BASE_R);
    this.joyBaseGfx.lineStyle(2, 0xaaaaaa, 0.7);
    this.joyBaseGfx.strokeCircle(bx, by, JOY_BASE_R);

    this.joyKnobGfx.clear();
    this.joyKnobGfx.fillStyle(0xdddddd, 0.85);
    this.joyKnobGfx.fillCircle(kx, ky, JOY_KNOB_R);
  }

  _hideJoystick() {
    this.joyBaseGfx.clear();
    this.joyKnobGfx.clear();
  }

  // ─── keyboard ──────────────────────────────────────────────────────────────

  _setupKeyboard() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd    = this.input.keyboard.addKeys({
      up:    Phaser.Input.Keyboard.KeyCodes.W,
      down:  Phaser.Input.Keyboard.KeyCodes.S,
      left:  Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
  }

  _inputVector() {
    // Joystick takes priority
    if (this.joyActive && (this.joyVector.x !== 0 || this.joyVector.y !== 0)) {
      return { ...this.joyVector };
    }

    let kx = 0, ky = 0;
    if (this.cursors.left.isDown  || this.wasd.left.isDown)  kx -= 1;
    if (this.cursors.right.isDown || this.wasd.right.isDown) kx += 1;
    if (this.cursors.up.isDown    || this.wasd.up.isDown)    ky -= 1;
    if (this.cursors.down.isDown  || this.wasd.down.isDown)  ky += 1;

    // Normalise diagonal
    if (kx !== 0 && ky !== 0) {
      const inv = 1 / Math.SQRT2;
      kx *= inv;
      ky *= inv;
    }
    return { x: kx, y: ky };
  }

  // ─── countdown ─────────────────────────────────────────────────────────────

  _showCountdown() {
    const { WIDTH, PLAY_H } = C;
    const cx = WIDTH / 2;
    const cy = PLAY_H / 2;
    const steps = ['3', '2', '1', 'GO!'];
    let i = 0;

    const txt = this.add.text(cx, cy, steps[0], {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '72px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 8,
    }).setOrigin(0.5).setDepth(30);

    const advance = () => {
      i++;
      if (i < steps.length) {
        txt.setText(steps[i]);
        this.time.delayedCall(i === steps.length - 1 ? 500 : 800, advance);
      } else {
        txt.destroy();
        this._startGame();
      }
    };

    this.time.delayedCall(800, advance);
  }

  _startGame() {
    this.playing = true;

    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this._tickTimer,
      callbackScope: this,
      loop: true,
    });
  }

  _tickTimer() {
    if (!this.playing) return;
    this.timeLeft--;
    this._updateTimerDisplay();
    if (this.timeLeft <= 0) {
      this._endGame(false, 'TOO LATE!');
    }
  }

  // ─── update loop ───────────────────────────────────────────────────────────

  update(_, delta) {
    if (!this.playing || this.ended) return;
    this._updatePlayer(delta);
    this._updateNPCs(delta);
    this._checkCollisions();
    this._checkWin();
  }

  _updatePlayer(delta) {
    const { WIDTH, PLAY_H, PLAYER_SPEED_BASE, PLAYER_SPEED_PER_LEVEL, PLAYER_R, SPRITE_SCALE } = C;
    const speed   = PLAYER_SPEED_BASE + (this.currentLevel - 1) * PLAYER_SPEED_PER_LEVEL;
    const vec     = this._inputVector();
    const margin  = PLAYER_R;

    this.player.x = Phaser.Math.Clamp(
      this.player.x + vec.x * speed * (delta / 1000),
      72 + margin,
      WIDTH - 72 - margin
    );
    this.player.y = Phaser.Math.Clamp(
      this.player.y + vec.y * speed * (delta / 1000),
      margin,
      PLAY_H - margin
    );
  }

  _updateNPCs(delta) {
    const dt = delta / 1000;
    for (const npc of this.npcs) {
      npc.x += npc.vx * dt;
      npc.y += npc.vy * dt;

      if (npc.npcType === 'A') this._wrapNPC(npc);
      else if (npc.npcType === 'B') this._bounceNPC(npc);
      else this._wanderNPC(npc, delta);
    }
  }

  _wrapNPC(npc) {
    const { WIDTH, PLAY_H } = C;
    const m = 20;
    if (npc.x < -m)          npc.x = WIDTH + m;
    if (npc.x > WIDTH + m)   npc.x = -m;
    if (npc.y < -m)          npc.y = PLAY_H + m;
    if (npc.y > PLAY_H + m)  npc.y = -m;
  }

  _bounceNPC(npc) {
    const { WIDTH, PLAY_H } = C;
    const m = 24;
    if (npc.x < m)          { npc.x = m;          npc.vx =  Math.abs(npc.vx); }
    if (npc.x > WIDTH - m)  { npc.x = WIDTH - m;  npc.vx = -Math.abs(npc.vx); }
    if (npc.y < m)          { npc.y = m;           npc.vy =  Math.abs(npc.vy); }
    if (npc.y > PLAY_H - m) { npc.y = PLAY_H - m; npc.vy = -Math.abs(npc.vy); }
  }

  _wanderNPC(npc, delta) {
    const { WIDTH, PLAY_H } = C;
    const m = 24;

    // Steer back if near boundary
    if (npc.x < m || npc.x > WIDTH - m || npc.y < m || npc.y > PLAY_H - m) {
      const angle = Math.atan2(PLAY_H / 2 - npc.y, WIDTH / 2 - npc.x);
      npc.vx = Math.cos(angle) * npc.speed;
      npc.vy = Math.sin(angle) * npc.speed;
      npc.changeTimer = 1000;
      return;
    }

    npc.changeTimer -= delta;
    if (npc.changeTimer <= 0) {
      const angle = Math.random() * Math.PI * 2;
      npc.vx = Math.cos(angle) * npc.speed;
      npc.vy = Math.sin(angle) * npc.speed;
      npc.changeTimer = 1500 + Math.random() * 2000;
    }
  }

  // ─── collision & win ───────────────────────────────────────────────────────

  _checkCollisions() {
    const minDist2 = (C.PLAYER_R + C.NPC_R) ** 2;
    for (const npc of this.npcs) {
      if (this._dist2(this.player.x, this.player.y, npc.x, npc.y) < minDist2) {
        this._endGame(false, 'COLLISION!');
        return;
      }
    }
  }

  _checkWin() {
    if (this._dist2(this.player.x, this.player.y, C.PB.x, C.PB.y) < C.GOAL_R ** 2) {
      this._endGame(true, '');
    }
  }

  // ─── end game ──────────────────────────────────────────────────────────────

  _endGame(won, reason) {
    if (this.ended) return;
    this.ended  = true;
    this.playing = false;

    if (this.timerEvent) this.timerEvent.remove(false);

    if (won) {
      const prev = parseInt(localStorage.getItem(C.LS_KEY) || '0', 10);
      if (this.currentLevel > prev) {
        localStorage.setItem(C.LS_KEY, String(this.currentLevel));
      }

      const txt = this.add.text(C.WIDTH / 2, C.PLAY_H / 2, 'LEVEL COMPLETE!', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '22px',
        color: '#eecc44',
        stroke: '#000',
        strokeThickness: 6,
      }).setOrigin(0.5).setDepth(30);

      this.time.delayedCall(1500, () => {
        this.scene.start('Game', { level: this.currentLevel + 1 });
      });
    } else {
      // Flash red on collision
      this.cameras.main.flash(300, 255, 40, 40);
      this.time.delayedCall(350, () => {
        this.scene.start('GameOver', {
          reason,
          level: this.currentLevel,
        });
      });
    }
  }

  // ─── helpers ───────────────────────────────────────────────────────────────

  _dist2(x1, y1, x2, y2) {
    return (x1 - x2) ** 2 + (y1 - y2) ** 2;
  }
}
