# Rush Hour Run — Game Requirements

## 1. Overview

**Genre:** Top-down 2D dodging game  
**Platform:** Browser (HTML5, powered by Phaser.js v3)  
**Premise:** You are an office worker running late. Navigate a crowded city pavement from your front door (Point A) to the office entrance (Point B) before the countdown timer expires — without colliding with anyone along the way.

---

## 2. Visual Aesthetic — 90s Pixelated Realistic (GTA 1 / Postal Style)

The game's look must evoke the gritty, top-down realism of GTA 1 (1997) and Postal (1997).

- **Colour palette:** Muted, desaturated urban tones — concrete greys, dirty yellows, dull greens, dark asphalt. No bright pastels.
- **Sprite resolution:** Player and NPC characters drawn at ~16×16 px source size, scaled up 2–3× via nearest-neighbour (no blur, no anti-aliasing).
- **Pixel scaling:** Phaser config must set `pixelArt: true` to enforce nearest-neighbour scaling globally.
- **Character sprites:** Simple humanoid silhouettes, top-down perspective, 4 directional variants (N/S/E/W).
- **Map style:** Pixel-art tilemap — visible road markings, kerbs, manhole covers, pavement cracks, zebra crossings, street furniture. Buildings visible at map edges.
- **UI / HUD style:** Bold pixel font (e.g. Press Start 2P); minimal chrome; styled like a 90s arcade game.
- **Audio (optional / stretch):** Chiptune or MIDI-style background track; 8-bit sound effects for collision and level complete.

---

## 3. Win & Lose Conditions

| Event | Outcome |
|---|---|
| Player reaches Point B before timer expires | **Win** — advance to next level |
| Player collides with any NPC pedestrian | **Lose** — Game Over |
| Timer reaches 0:00 and player has not reached Point B | **Lose** — Game Over |

- On **win:** brief "Level Complete!" message, then auto-advance to the next level. Record highest level reached.
- On **lose:** show Game Over screen with cause of loss, highest level reached, and options to retry from Level 1 or return to main menu.

---

## 4. Player Mechanics

- **View:** Top-down (bird's-eye).
- **Controls:** WASD or Arrow Keys. 8-directional movement. Diagonal movement speed must be normalised (multiplied by `1/√2 ≈ 0.707`) so diagonal is not faster than cardinal.
- **Base speed:** 160 px/s at Level 1; increases by +5 px/s per level.
- **Hitbox:** Circle, radius = 40% of sprite's visual width.
- **Sprite orientation:** Rotates to face current movement direction (4 directional frames).
- **Lives / Health:** None — one collision = instant Game Over.
- **Abilities:** None at this scope.

---

## 5. NPC Pedestrians

### 5.1 Spawning

- All NPCs spawn at level start; none spawn mid-level.
- Starting count: **5 NPCs at Level 1**, increasing by **+3 per level** (no cap).
- Spawn exclusion zones:
  - No NPC within **120 px** of Point A (safe start for player).
  - No NPC within **60 px** of Point B (goal always reachable).
- No two NPCs may spawn with overlapping hitboxes (retry placement on overlap).

### 5.2 Movement Pattern Types

Each NPC is randomly assigned one of three types at spawn:

| Type | Name | Behaviour | Base Speed | Proportion |
|---|---|---|---|---|
| A | Straight Walker | Moves in one fixed direction; wraps to opposite edge on exit | 80 px/s | 50% |
| B | Pacer | Moves back and forth along one axis; reverses at arena boundary or a patrol limit | 60 px/s | 30% |
| C | Wanderer | Changes to a new random direction every 1.5–3.5 s | 50 px/s | 20% |

- Each NPC's speed has ±15% random variation per individual to avoid synchronised-looking crowds.
- NPC speed base increases by **+10 px/s per level** (applied before the per-individual variation).
- NPCs do not collide with each other (pass through).
- NPCs do not track or target the player — movement is fully independent.

### 5.3 Visual Differentiation

- NPCs must be visually distinct from the player (different colour palette, no briefcase).
- Type A: blue-toned clothing. Type B: red-toned. Type C: yellow-toned.
- This allows the player to read crowd behaviour at a glance.

---

## 6. Timer

- Countdown timer, starts the moment the level begins.
- **Starting value:** 30 seconds at Level 1; decreases by **2 s per level** (minimum 10 s).
- Display format: `MM:SS` or bare seconds (e.g. `0:30`).
- When ≤ 5 seconds remain: timer display turns **red** and pulses at ~1 Hz.
- At 0:00, if the player has not reached Point B: transition to Game Over with message "Too Late!"

---

## 7. Level Progression

- Linear progression: Level 1, 2, 3, … with no defined cap.
- The same map layout is used across all levels; only difficulty parameters change.
- On level advance, all NPCs are cleared and respawned with new randomised positions and the updated count/speed values.

### Difficulty Scaling Table

| Parameter | Level 1 | Per-level increase | Floor / Cap |
|---|---|---|---|
| NPC count | 5 | +3 | No cap |
| NPC base speed | 80 px/s | +10 px/s | No cap |
| Timer | 30 s | −2 s | Minimum 10 s |
| Player speed | 160 px/s | +5 px/s | No cap |

---

## 8. Highest Level Tracking

- Stored in `localStorage` under the key `rushHourRun_highestLevel`.
- Updated only when the player beats their previous record.
- Displayed on: the Start screen, and the Game Over screen.
- No server-side leaderboard — fully client-side.

---

## 9. Arena / Map Design

- **Viewport:** Single, non-scrolling screen. Logical resolution: **800 × 600 px**.
- **Map style:** Urban pavement / street — pixel-art tilemap with road, kerb, and pavement tiles.
- **Point A (Start):** Bottom-centre of the arena. Marked with a pixel-art "home door" sprite and a green indicator zone.
- **Point B (Goal):** Top-centre of the arena. Marked with a pixel-art "office door" sprite and a blue indicator zone.
- **Arena boundaries:** Hard walls — player and NPCs cannot exit the arena (player is clamped; Type A NPCs wrap; Type B NPCs bounce).
- **Unobstructed path distance:** The straight-line distance from Point A to Point B must require ~8–12 s of unimpeded travel at base player speed, creating a meaningful skill gap between perfect and average navigation.

---

## 10. Screens & UI Flow

```
Start Screen
  └─> [Play] ─> Countdown Intro (3…2…1…GO!)
                 └─> Level N (PLAYING)
                      ├─> Win ─> "Level Complete!" ─> Level N+1
                      └─> Lose ─> Game Over Screen
                                   ├─> [Retry] ─> Level 1
                                   └─> [Menu] ─> Start Screen
```

### Start Screen
- Game title in pixel font.
- "Highest Level Reached: X" (from localStorage).
- [Play] button.

### HUD (visible during play)
| Element | Position | Content |
|---|---|---|
| Timer | Top-right | Countdown; red + pulsing at ≤5 s |
| Level | Top-left | "LEVEL X" |

### Countdown Intro
- Overlay drawn over the already-visible (static) arena and NPCs.
- Sequence: "3" → "2" → "1" → "GO!" — each shown for 0.8 s.
- NPCs begin moving the frame after "GO!" disappears.

### Win Transition
- Brief "LEVEL COMPLETE!" overlay for ~1.5 s, then auto-advance.

### Game Over Screen
- Semi-transparent dark overlay over the last game frame.
- Large text: cause of loss — "COLLISION!" or "TOO LATE!"
- "Highest Level Reached: X"
- [Retry from Level 1] and [Main Menu] buttons.

---

## 11. Technical Requirements

- **Framework:** Phaser.js v3.x
- **Rendering:** WebGL (Canvas fallback); `pixelArt: true` in Phaser game config
- **Physics:** Phaser Arcade Physics for movement and collision detection
- **Collision model:** Circle-to-circle for player ↔ NPC; circle-to-zone for player ↔ Point B goal area
- **Frame rate:** Target 60 fps; physics update must be frame-rate independent (fixed timestep)
- **Resolution:** 800 × 600 px logical, scaled to fit browser window (letterboxed)
- **Browser support:** Chrome, Firefox, Safari (latest 2 major versions each)
- **No backend:** Fully client-side; no API calls, no accounts, no cookies
- **Pixel font:** Press Start 2P (via Google Fonts CDN or bundled)

### Scene Structure

| Scene | Purpose |
|---|---|
| `BootScene` | Preloads all assets |
| `MenuScene` | Start screen with highest level display |
| `GameScene` | Core gameplay loop (countdown intro + playing state) |
| `GameOverScene` | Win/lose outcome screen |

### Constants File

All tunable values (speeds, NPC counts, timer durations, hitbox radii, scaling factors) must be defined in a single `src/constants.js` file — no magic numbers scattered in game logic.

---

## 12. Asset Manifest

### Sprites (pixel art, PNG, transparent background, top-down view)

| ID | Description | Source Size |
|---|---|---|
| `player` | Office worker (briefcase), 4-directional | 16×16 px per frame |
| `npc_a` | Straight Walker (blue clothing) | 16×16 px per frame |
| `npc_b` | Pacer (red clothing) | 16×16 px per frame |
| `npc_c` | Wanderer (yellow clothing) | 16×16 px per frame |
| `door_a` | Point A — home door | 24×24 px |
| `door_b` | Point B — office door | 24×24 px |
| `tileset` | Pavement / road tiles (kerb, asphalt, cracks, markings) | 16×16 px per tile |

### Audio (all optional / stretch goal)

| ID | Description | Format |
|---|---|---|
| `bgm` | Uptempo chiptune loop | MP3 / OGG |
| `sfx_collision` | Impact on NPC hit | MP3 / OGG |
| `sfx_win` | Short victory jingle | MP3 / OGG |
| `sfx_tick` | Urgent tick at ≤5 s | MP3 / OGG |

Total asset payload target: **≤ 2 MB uncompressed**.

---

## 13. Non-Functional Requirements

- Game must be fully interactive within **3 seconds** of page load on a 10 Mbps connection.
- Stable **60 fps** on hardware from 2018 or later (integrated graphics).
- All tunable constants in `src/constants.js` — no hardcoded magic numbers in logic files.
- No external dependencies beyond Phaser.js and Press Start 2P font.
- Passes ESLint recommended ruleset with no errors.

---

## 14. Out of Scope

The following are explicitly excluded from this version to prevent scope creep:

- Multiplayer
- Mobile / touch controls
- Power-ups, collectibles, or player abilities
- NPC-to-NPC collision
- Procedurally generated map layouts
- Walk-cycle sprite animations (single-frame per direction is acceptable at MVP)
- Server-side leaderboard
- Accessibility features (colour-blind modes, screen reader support)
- Pause menu (Escape key does nothing at MVP)

---

## 15. Acceptance Criteria

| ID | Given | When | Then |
|---|---|---|---|
| AC-001 | Game is in PLAYING state | Player reaches Point B before timer hits 0 | Transition to win; highest level updated if applicable |
| AC-002 | Game is in PLAYING state | Player hitbox overlaps any NPC hitbox | Immediate transition to Game Over with "COLLISION!" |
| AC-003 | Game is in PLAYING state | Timer reaches 0:00; player not at Point B | Transition to Game Over with "TOO LATE!" |
| AC-004 | Game initialises a level | NPCs are placed | No NPC centre within 120 px of Point A or 60 px of Point B |
| AC-005 | Player holds two perpendicular movement keys | One frame elapses | Player displacement ≤ `playerSpeed × elapsed` (not 1.41×) |
| AC-006 | Player wins a run and beats their highest level | Page is refreshed | Start screen shows the updated highest level |
| AC-007 | Timer has > 5 seconds remaining | Timer crosses 5 s | Timer text turns red and pulses at ~1 Hz |
| AC-008 | Browser frame rate drops to 30 fps | Game is running | NPC and player move at the same real-world speed as at 60 fps |
| AC-009 | Any sprite is rendered | Game is running | No bilinear blur — all pixels are sharp (nearest-neighbour scaling) |
