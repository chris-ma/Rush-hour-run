class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  // ─── init ──────────────────────────────────────────────────────────────────

  init(data) {
    this.currentLevel = data.level || 1;
    this.playing      = false;
    this.ended        = false;
    this.npcs         = [];
    this.timeLeft     = 0;
    this.timerEvent   = null;
    this._urgentTween = null;
    this.trainContainer = null;
    this.trainGfx       = null;
  }

  // ─── create ────────────────────────────────────────────────────────────────

  create() {
    // World growth: gates move 2% further every 3 completed levels (capped at y 760)
    const growths = Math.floor((this.currentLevel - 1) / 3);
    this.pa = {
      x: C.PA.x,
      y: Math.min(760, Math.round(C.PA.y * (1 + growths * 0.02))),
    };

    this._drawBackground();
    this._createGates();
    this._createTrain();
    this._createPlayer();
    this._spawnNPCs();
    this._createHUD();
    this._createJoystick();
    this._setupKeyboard();
    this._showCountdown();
  }

  // ─── background ────────────────────────────────────────────────────────────

  _drawBackground() {
    const { WIDTH, PLAY_H } = C;
    const g = this.add.graphics();

    // Platform floor — concrete
    g.fillStyle(0x7a7a6e);
    g.fillRect(0, 0, WIDTH, PLAY_H);

    // Tile grid
    g.lineStyle(1, 0x666660, 0.5);
    for (let x = 0; x <= WIDTH; x += 40)  g.lineBetween(x, 0, x, PLAY_H);
    for (let y = 0; y <= PLAY_H; y += 40) g.lineBetween(0, y, WIDTH, y);

    // Side columns
    for (let y = 100; y < PLAY_H - 80; y += 150) {
      g.fillStyle(0x5a5a52);
      g.fillRect(0,          y, 28, 55);
      g.fillRect(WIDTH - 28, y, 28, 55);
      g.fillStyle(0x888880);
      g.fillRect(2,          y + 2, 24, 51);
      g.fillRect(WIDTH - 26, y + 2, 24, 51);
    }

    // Yellow platform-edge safety stripe (bottom)
    g.fillStyle(0xeecc44);
    g.fillRect(0, PLAY_H - 20, WIDTH, 8);
    g.fillStyle(0x222222);
    g.fillRect(0, PLAY_H - 12, WIDTH, 12);

    // Blue overhead sign strip at very top
    g.fillStyle(0x1a3a88);
    g.fillRect(0, 0, WIDTH, 10);

    // Rail tracks — sleepers then rails, sitting just below train body
    const sleeperY = 66;
    const sleeperH = 18;
    g.fillStyle(0x4a2e0e);
    for (let x = 0; x < WIDTH; x += 22) {
      g.fillRect(x + 2, sleeperY, 14, sleeperH);
    }
    g.fillStyle(0x999990);
    g.fillRect(0, sleeperY + 2,            WIDTH, 4);
    g.fillRect(0, sleeperY + sleeperH - 6, WIDTH, 4);
    g.fillStyle(0xccccbb, 0.6);
    g.fillRect(0, sleeperY + 2,            WIDTH, 1);
    g.fillRect(0, sleeperY + sleeperH - 6, WIDTH, 1);
  }

  // ─── station gates (Point A) ───────────────────────────────────────────────

  _createGates() {
    const { WIDTH } = C;
    const PA = this.pa;
    const g  = this.add.graphics().setDepth(1);

    // Barrier beam
    g.fillStyle(0xcccc88);
    g.fillRect(PA.x - 130, PA.y - 5, 260, 10);

    // Posts
    g.fillStyle(0xaaaaaa);
    [-130, -44, 44, 130].forEach(ox => {
      g.fillRect(PA.x + ox - 5, PA.y - 24, 10, 48);
    });

    // Gate opening in centre
    g.fillStyle(0x333328);
    g.fillRect(PA.x - 16, PA.y - 5, 32, 10);

    // Arrow pointing up (toward train)
    g.fillStyle(0x22ee66);
    g.fillTriangle(PA.x, PA.y - 38, PA.x - 10, PA.y - 28, PA.x + 10, PA.y - 28);

    this.add.text(PA.x, PA.y + 26, 'PLATFORM GATES', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#eecc44',
      stroke: '#000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(2);
  }

  // ─── train (Point B) ───────────────────────────────────────────────────────

  _createTrain() {
    const { PB } = C;

    this.trainContainer = this.add.container(0, 0).setDepth(3);

    this.trainGfx = this.add.graphics();
    this._drawTrainGraphics(true);

    this.boardText = this.add.text(PB.x, 84, 'BOARD HERE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px',
      color: '#ffcc44',
      stroke: '#000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: this.boardText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.trainContainer.add([this.trainGfx, this.boardText]);
  }

  _drawTrainGraphics(doorOpen) {
    const { WIDTH, PB } = C;
    const g   = this.trainGfx;
    const tx  = 10;
    const ty  = 5;
    const tw  = WIDTH - 20;
    const th  = 70;
    const dw  = 48;
    const dx  = tx + (tw - dw) / 2;   // door x

    g.clear();

    // Train body
    g.fillStyle(0x1a4088);
    g.fillRect(tx, ty, tw, th);

    // Decorative stripe
    g.fillStyle(0xddbb88);
    g.fillRect(tx, ty + 22, tw, 7);

    // Windows — left of door
    g.fillStyle(0x99ddff, 0.85);
    for (let wx = tx + 14; wx < dx - 8; wx += 52) {
      g.fillRect(wx, ty + 8, 34, 16);
    }
    // Windows — right of door
    for (let wx = dx + dw + 8; wx < tx + tw - 14; wx += 52) {
      g.fillRect(wx, ty + 8, 34, 16);
    }

    // Door
    if (doorOpen) {
      g.fillStyle(0x080818);
      g.fillRect(dx, ty, dw, th);
      g.lineStyle(3, 0xffcc44, 1);
      g.strokeRect(dx, ty, dw, th);
      // Step glow
      g.fillStyle(0xffcc44, 0.45);
      g.fillRect(dx, ty + th - 10, dw, 10);
    } else {
      g.fillStyle(0x163070);
      g.fillRect(dx, ty, dw, th);
      g.lineStyle(2, 0x2255aa, 1);
      g.lineBetween(dx + dw / 2, ty, dx + dw / 2, ty + th);
    }

    // Train outline
    g.lineStyle(2, 0x0a2055, 1);
    g.strokeRect(tx, ty, tw, th);
  }

  // ─── player ────────────────────────────────────────────────────────────────

  _createPlayer() {
    this.player = this.add.image(this.pa.x, this.pa.y, 'player')
      .setScale(C.SPRITE_SCALE)
      .setDepth(5);
  }

  // ─── NPC spawning ──────────────────────────────────────────────────────────

  _spawnNPCs() {
    const count = C.NPC_COUNT_BASE + (this.currentLevel - 1) * C.NPC_COUNT_PER_LEVEL;
    const speed = C.NPC_SPEED_BASE + (this.currentLevel - 1) * C.NPC_SPEED_PER_LEVEL;

    for (let i = 0; i < count; i++) {
      const pos  = this._safeSpawnPos();
      const type = this._randomType();
      const key  = type === 'A' ? 'npc_a' : type === 'B' ? 'npc_b' : 'npc_c';

      const npc = this.add.image(pos.x, pos.y, key)
        .setScale(C.SPRITE_SCALE)
        .setDepth(4);

      const variation = 1 + (Math.random() * 2 - 1) * C.NPC_SPEED_VAR;
      npc.npcType     = type;
      npc.speed       = speed * variation;
      npc.changeTimer = 0;

      const angle = Math.random() * Math.PI * 2;

      if (type === 'B') {
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
        if (type === 'C') npc.changeTimer = 1500 + Math.random() * 2000;
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
    const { WIDTH, PLAY_H, PB, SPAWN_SAFE_A, SPAWN_SAFE_B, NPC_R, SPRITE_SCALE } = C;
    const margin = NPC_R * SPRITE_SCALE;
    const PA     = this.pa;

    do {
      x = Phaser.Math.Between(margin + 10, WIDTH - margin - 10);
      y = Phaser.Math.Between(margin + 90, PLAY_H - margin - 30);
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

    // Dark backing strip between train and play area
    this.add.graphics().setDepth(9)
      .fillStyle(0x000000, 0.55)
      .fillRect(0, 76, WIDTH, 46);

    // "Train leaves in" label
    this.add.text(10, 82, 'TRAIN LEAVES IN', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px',
      color: '#ffaa22',
      stroke: '#000',
      strokeThickness: 2,
    }).setDepth(10);

    this.timerText = this.add.text(10, 96, this._fmtTime(this.timeLeft), {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#000',
      strokeThickness: 4,
    }).setOrigin(0, 0).setDepth(10);

    // Level — top-right of the same strip
    this.add.text(WIDTH - 10, 88, `LEVEL ${this.currentLevel}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#eecc44',
      stroke: '#000',
      strokeThickness: 3,
    }).setOrigin(1, 0).setDepth(10);
  }

  _fmtTime(s) {
    const m   = Math.floor(s / 60);
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
    if (window.RHR_joy) {
      window.RHR_joy.active = false;
      window.RHR_joy.vx = 0;
      window.RHR_joy.vy = 0;
    }
  }

  _syncJoystickGraphics() {
    const joy = window.RHR_joy;
    if (!joy || !joy.active) { this._hideJoystick(); return; }
    this._drawJoystick(joy.ox, joy.oy, joy.kx, joy.ky);
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
    if (!this.input.keyboard) {
      this.cursors = null;
      this.wasd    = null;
      return;
    }
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd    = this.input.keyboard.addKeys({
      up:    Phaser.Input.Keyboard.KeyCodes.W,
      down:  Phaser.Input.Keyboard.KeyCodes.S,
      left:  Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
  }

  _inputVector() {
    const joy = window.RHR_joy;
    if (joy && joy.active && (joy.vx !== 0 || joy.vy !== 0)) {
      return { x: joy.vx, y: joy.vy };
    }

    if (!this.cursors) return { x: 0, y: 0 };

    let kx = 0, ky = 0;
    if (this.cursors.left.isDown  || this.wasd.left.isDown)  kx -= 1;
    if (this.cursors.right.isDown || this.wasd.right.isDown) kx += 1;
    if (this.cursors.up.isDown    || this.wasd.up.isDown)    ky -= 1;
    if (this.cursors.down.isDown  || this.wasd.down.isDown)  ky += 1;

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
    if (this.timeLeft === 10) this._blowWhistle();
    if (this.timeLeft <= 0) this._endGame('TOO LATE!');
  }

  // ─── update loop ───────────────────────────────────────────────────────────

  update(_, delta) {
    if (!this.playing || this.ended) return;
    this._syncJoystickGraphics();
    this._updatePlayer(delta);
    this._updateNPCs(delta);
    this._checkCollisions();
    this._checkWin();
  }

  _updatePlayer(delta) {
    const { WIDTH, PLAY_H, PLAYER_SPEED_BASE, PLAYER_SPEED_PER_LEVEL, PLAYER_R } = C;
    const speed  = PLAYER_SPEED_BASE + (this.currentLevel - 1) * PLAYER_SPEED_PER_LEVEL;
    const vec    = this._inputVector();
    const m      = PLAYER_R;

    this.player.x = Phaser.Math.Clamp(
      this.player.x + vec.x * speed * (delta / 1000),
      m, WIDTH - m
    );
    this.player.y = Phaser.Math.Clamp(
      this.player.y + vec.y * speed * (delta / 1000),
      m, PLAY_H - m
    );

    // Train wall — solid except for the centre door opening
    const TRAIN_BOT = 76;
    const DOOR_X1   = 216;
    const DOOR_X2   = 264;
    if (this.player.y < TRAIN_BOT &&
        (this.player.x < DOOR_X1 || this.player.x > DOOR_X2)) {
      this.player.y = TRAIN_BOT;
    }
  }

  _updateNPCs(delta) {
    const dt        = delta / 1000;
    const TRAIN_BOT = 76;

    for (const npc of this.npcs) {
      npc.x += npc.vx * dt;
      npc.y += npc.vy * dt;

      if (npc.npcType === 'A')      this._wrapNPC(npc);
      else if (npc.npcType === 'B') this._bounceNPC(npc);
      else                          this._wanderNPC(npc, delta);

      // Hard wall — all NPCs bounce off the train regardless of type
      if (npc.y < TRAIN_BOT) {
        npc.y  = TRAIN_BOT;
        npc.vy = Math.abs(npc.vy);
      }
    }
  }

  _wrapNPC(npc) {
    const { WIDTH, PLAY_H } = C;
    const m = 20;
    if (npc.x < -m)         npc.x = WIDTH + m;
    if (npc.x > WIDTH + m)  npc.x = -m;
    if (npc.y < -m)         npc.y = PLAY_H + m;
    if (npc.y > PLAY_H + m) npc.y = -m;
  }

  _bounceNPC(npc) {
    const { WIDTH, PLAY_H } = C;
    const m   = 24;
    const top = 76; // train wall
    if (npc.x < m)          { npc.x = m;          npc.vx =  Math.abs(npc.vx); }
    if (npc.x > WIDTH - m)  { npc.x = WIDTH - m;  npc.vx = -Math.abs(npc.vx); }
    if (npc.y < top)         { npc.y = top;         npc.vy =  Math.abs(npc.vy); }
    if (npc.y > PLAY_H - m) { npc.y = PLAY_H - m; npc.vy = -Math.abs(npc.vy); }
  }

  _wanderNPC(npc, delta) {
    const { WIDTH, PLAY_H } = C;
    const m = 24;

    if (npc.x < m || npc.x > WIDTH - m || npc.y < 76 || npc.y > PLAY_H - m) {
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
        this._endGame('COLLISION!');
        return;
      }
    }
  }

  _checkWin() {
    if (this._dist2(this.player.x, this.player.y, C.PB.x, C.PB.y) < C.GOAL_R ** 2) {
      this._animateTrainDeparture();
    }
  }

  // ─── train departure animation (win) ───────────────────────────────────────

  _animateTrainDeparture() {
    if (this.ended) return;
    this.ended   = true;
    this.playing = false;
    if (this.timerEvent) this.timerEvent.remove(false);

    // Save high score
    const prev = parseInt(localStorage.getItem(C.LS_KEY) || '0', 10);
    if (this.currentLevel > prev) {
      localStorage.setItem(C.LS_KEY, String(this.currentLevel));
    }

    // Player boards — hide them
    this.player.setVisible(false);

    // Close the door
    this._drawTrainGraphics(false);

    const msg = this.add.text(C.WIDTH / 2, C.PLAY_H / 2, 'DOORS CLOSING!', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '18px',
      color: '#ffcc44',
      stroke: '#000',
      strokeThickness: 5,
    }).setOrigin(0.5).setDepth(30);

    // After a beat, depart
    this.time.delayedCall(900, () => {
      msg.destroy();

      this.tweens.add({
        targets:  this.trainContainer,
        x:        C.WIDTH + 60,
        duration: 1100,
        ease:     'Quadratic.In',
        onComplete: () => {
          this.add.text(C.WIDTH / 2, C.PLAY_H / 2, 'LEVEL COMPLETE!', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '22px',
            color: '#eecc44',
            stroke: '#000',
            strokeThickness: 6,
          }).setOrigin(0.5).setDepth(30);

          this.time.delayedCall(1500, () => {
            this.scene.start('Game', { level: this.currentLevel + 1 });
          });
        },
      });
    });
  }

  // ─── loss ──────────────────────────────────────────────────────────────────

  _endGame(reason) {
    if (this.ended) return;
    this.ended   = true;
    this.playing = false;
    if (this.timerEvent) this.timerEvent.remove(false);

    this.cameras.main.flash(300, 255, 40, 40);
    this.time.delayedCall(350, () => {
      this.scene.start('GameOver', { reason, level: this.currentLevel });
    });
  }

  // ─── helpers ───────────────────────────────────────────────────────────────

  _blowWhistle() {
    try {
      const AC  = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();

      const blast = (startTime, duration) => {
        // Two-tone steam whistle: fundamental + perfect fifth
        [660, 990].forEach(freq => {
          const osc  = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0, startTime);
          gain.gain.linearRampToValueAtTime(0.22, startTime + 0.04);
          gain.gain.setValueAtTime(0.22, startTime + duration - 0.06);
          gain.gain.linearRampToValueAtTime(0, startTime + duration);
          osc.start(startTime);
          osc.stop(startTime + duration + 0.02);
        });
      };

      const t = ctx.currentTime;
      blast(t,        0.45);   // long toot
      blast(t + 0.6,  0.25);   // short toot
      blast(t + 0.95, 0.25);   // short toot
    } catch (_) { /* audio unavailable */ }
  }

  _dist2(x1, y1, x2, y2) {
    return (x1 - x2) ** 2 + (y1 - y2) ** 2;
  }
}
