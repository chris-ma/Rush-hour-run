const C = Object.freeze({
  // Canvas
  WIDTH: 480,
  HEIGHT: 800,
  PLAY_H: 520,        // play area height (top portion)
  JOY_ZONE_Y: 520,    // y where the joystick touch zone begins

  // Player
  PLAYER_SPEED_BASE: 160,
  PLAYER_SPEED_PER_LEVEL: 5,
  PLAYER_R: 16,       // hitbox radius in game coords (sprite displayed at 48px)

  // NPC
  NPC_COUNT_BASE: 5,
  NPC_COUNT_PER_LEVEL: 3,
  NPC_SPEED_BASE: 80,
  NPC_SPEED_PER_LEVEL: 10,
  NPC_SPEED_VAR: 0.15,  // ±15% individual variation
  NPC_R: 14,

  // Timer
  TIMER_BASE: 30,
  TIMER_DEC: 2,        // seconds subtracted per level
  TIMER_MIN: 10,
  TIMER_URGENT: 5,

  // Spawn safety
  SPAWN_SAFE_A: 120,
  SPAWN_SAFE_B: 60,

  // Goal positions (within play area)
  PA: { x: 240, y: 470 },   // Point A — home (bottom-centre)
  PB: { x: 240, y: 55 },    // Point B — office (top-centre)
  GOAL_R: 36,

  // Virtual joystick
  JOY_BASE_R: 44,
  JOY_KNOB_R: 20,
  JOY_MAX: 64,
  JOY_DEAD: 10,

  // Sprite display scale (source sprites are 16×16)
  SPRITE_SCALE: 3,

  // Palette (muted GTA1-style)
  COL_ASPHALT:   0x2a2a2e,
  COL_PAVEMENT:  0x5c5c54,
  COL_KERB:      0x888880,
  COL_MARKING:   0xeecc44,
  COL_JOY_ZONE:  0x16161a,

  // localStorage
  LS_KEY: 'rushHourRun_highestLevel',
});
