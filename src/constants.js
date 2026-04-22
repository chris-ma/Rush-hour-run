const C = Object.freeze({
  // Canvas
  WIDTH:  480,
  HEIGHT: 800,
  PLAY_H: 800,   // full canvas — no dedicated joystick zone

  // Player
  PLAYER_SPEED_BASE:     160,
  PLAYER_SPEED_PER_LEVEL: 5,
  PLAYER_R: 16,

  // NPC
  NPC_COUNT_BASE:     5,
  NPC_COUNT_PER_LEVEL: 3,
  NPC_SPEED_BASE:     80,
  NPC_SPEED_PER_LEVEL: 10,
  NPC_SPEED_VAR: 0.15,
  NPC_R: 14,

  // Timer
  TIMER_BASE:   30,
  TIMER_DEC:     2,
  TIMER_MIN:    10,
  TIMER_URGENT:  5,

  // Spawn safety
  SPAWN_SAFE_A: 120,
  SPAWN_SAFE_B:  60,

  // Goal positions
  PA: { x: 240, y: 700 },  // gates — lower in expanded world
  PB: { x: 240, y: 55  },  // train door
  GOAL_R: 36,

  // Virtual joystick (touch anywhere)
  JOY_BASE_R: 44,
  JOY_KNOB_R: 20,
  JOY_MAX:    64,
  JOY_DEAD:   10,

  SPRITE_SCALE: 3,
  LS_KEY: 'rushHourRun_highestLevel',
});
