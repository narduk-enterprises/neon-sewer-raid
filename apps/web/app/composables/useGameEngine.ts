/**
 * useGameEngine — Main game engine with ALL 20 enhancements
 *
 * Enhancements implemented:
 * 1.  Invincibility frames (1s blink after damage)
 * 2.  Scaled screen shake (small/medium/heavy)
 * 3.  Kill streak announcements (DOUBLE/MEGA/ULTRA/UNSTOPPABLE)
 * 4.  Combo timer bar (1.2s visual countdown)
 * 5.  Screen flash on level up
 * 6.  Player dash/dodge (swipe or Shift, brief i-frames)
 * 7.  Wave system (clear wave → respite → next)
 * 8.  Auto-fire toggle
 * 9.  Difficulty rebalance (spawn cap, HP scaling)
 * 10. Projectile trails
 * 11. Themed death particles per enemy type
 * 12. Multi-hit enemy damage indicators
 * 13. Boss warning sequence
 * 14. Score gems from kills
 * 15. Arena border damage flash
 * 16. Persistent statistics
 * 17. Milestone unlocks
 * 18. Best run display on game over
 * 19. Haptic feedback
 * 20. (Swipe dismiss handled in components)
 */

export type GameScreen = 'menu' | 'playing' | 'paused' | 'gameover' | 'help' | 'settings'
export type EnemyType = 'robot' | 'bat' | 'shooter' | 'mouser' | 'foot'
export type ItemType = 'pizza' | 'ooze' | 'barrel' | 'spicy'

export interface Vec2 { x: number; y: number }

export interface Entity {
  id: number
  x: number
  y: number
  emoji: string
  type: string
  hp: number
  maxHp: number
  vx: number
  vy: number
  fontSize: number
  filter: string
  lastShot?: number
  isDashing?: boolean
  lastDash?: number
  dashVx?: number
  dashVy?: number
}

export interface Projectile {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  speed: number
  emoji: string
  isEnemy: boolean
  fontSize: number
}

export interface VfxParticle {
  id: number
  x: number
  y: number
  emoji: string
  tx: number
  ty: number
  born: number
  duration: number
  type: 'particle' | 'shout' | 'float' | 'explosion' | 'trail' | 'gem'
  text?: string
  color?: string
  fontSize?: number
}

export interface BossState {
  x: number
  y: number
  hp: number
  maxHp: number
  vx: number
  lastShot: number
  phase: 'warning' | 'enter' | 'fight'
  emoji: string
  fontSize: number
  warningStart: number
}

export interface GameStats {
  gamesPlayed: number
  totalKills: number
  bossesDefeated: number
  highestCombo: number
  pizzaEaten: number
  totalScore: number
}

// Kill streak thresholds
const KILL_STREAKS: [number, string][] = [
  [3, '🔥 DOUBLE KILL!'],
  [5, '⚡ MEGA KILL!'],
  [8, '💀 ULTRA KILL!'],
  [12, '☠️ UNSTOPPABLE!'],
  [20, '🌟 GODLIKE!'],
]

// Themed death particles per enemy type
const DEATH_PARTICLES: Record<string, string> = {
  robot: '⚡',
  bat: '🦴',
  shooter: '💀',
  mouser: '🧀',
  foot: '👻',
}

const STATS_KEY = 'nsr_stats'

let _nextId = 0
function nextId() { return ++_nextId }

function loadStats(): GameStats {
  if (import.meta.client) {
    try {
      return JSON.parse(localStorage.getItem(STATS_KEY) || '{}') as GameStats
    } catch {
      return { gamesPlayed: 0, totalKills: 0, bossesDefeated: 0, highestCombo: 0, pizzaEaten: 0, totalScore: 0 }
    }
  }
  return { gamesPlayed: 0, totalKills: 0, bossesDefeated: 0, highestCombo: 0, pizzaEaten: 0, totalScore: 0 }
}

function saveStats(stats: GameStats) {
  if (import.meta.client) {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats))
  }
}

function haptic(ms = 50) {
  if (import.meta.client && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(ms)
  }
}

export function useGameEngine() {
  const audio = useAudio()
  const leaderboard = useLeaderboard()

  // --- Core State ---
  const screen = ref<GameScreen>('menu')
  const score = ref(0)
  const level = ref(1)
  const hp = ref(3)
  const maxHp = ref(3)
  const power = ref(0)
  const isSpecial = ref(false)
  const specialTimer = ref(0)
  const combo = ref(0)
  const lastKill = ref(0)
  const skin = ref<'leo' | 'casey'>('leo')
  const leftHanded = ref(false)
  const sensitivity = ref(1.0)
  const autoFire = ref(false)

  if (import.meta.client) {
    leftHanded.value = localStorage.getItem('nsr_lefty') === 'true'
    sensitivity.value = Number.parseFloat(localStorage.getItem('nsr_sens') || '1.0')
    autoFire.value = localStorage.getItem('nsr_autofire') === 'true'
  }

  // Player
  const playerX = ref(0)
  const playerY = ref(0)
  const playerEmoji = computed(() => skin.value === 'casey' ? '🏒' : '🐢')
  const playerFilter = ref('')
  const playerScale = ref(1)

  // Enhancement #1: Invincibility frames
  const invincible = ref(false)
  const invincibleFlash = ref(false)

  // Enhancement #4: Combo timer bar
  const comboTimerPercent = ref(0)
  const COMBO_WINDOW = 1200 // ms

  // Enhancement #5: Screen flash on level up
  const levelUpFlash = ref(false)

  // Enhancement #6: Dash/dodge
  const isDashing = ref(false)
  const dashCooldown = ref(0)
  const DASH_COOLDOWN = 600 // ms
  const DASH_DURATION = 150 // ms
  let dashEndTime = 0
  let dashVx = 0
  let dashVy = 0

  // Enhancement #7: Wave system
  const wave = ref(0)
  const waveEnemiesLeft = ref(0)
  const waveCleared = ref(false)
  const waveClearTimer = ref(0)
  const waveSpawned = ref(0)
  const waveTotal = ref(0)

  // Enhancement #13: Boss warning
  const bossWarning = ref(false)

  // Enhancement #15: Damage flash
  const damageFlash = ref(false)

  // Enhancement #16: Persistent stats
  const stats = ref<GameStats>(loadStats())

  // Enhancement #18: Best run
  const isNewRecord = ref(false)

  // Arena dimensions
  const arenaWidth = ref(0)
  const arenaHeight = ref(0)

  // Entities
  const enemies = ref<Entity[]>([])
  const items = ref<Entity[]>([])
  const projectiles = ref<Projectile[]>([])
  const vfx = ref<VfxParticle[]>([])
  const boss = ref<BossState | null>(null)

  // VFX state
  const shaking = ref(false)
  const shakeIntensity = ref(1)
  const levelFlashText = ref('')
  const levelFlashing = ref(false)
  const biome = ref<'sewer' | 'technodrome'>('sewer')

  // Powerup timers
  const powerupTime = ref(0)
  const spicyTime = ref(0)

  // Message toast
  const shoutText = ref('')
  const shoutId = ref(0)

  // Enhancement #14: Score gems (auto-magnetize collectibles)
  const gems = ref<{ id: number; x: number; y: number; born: number }[]>([])

  // Game loop
  let animFrameId: number | null = null
  let hitStop = 0
  let gameActive = false

  // Controls interface
  const inputVelocity = reactive({ x: 0, y: 0 })
  let attackHeld = false
  let lastAutoFireTime = 0

  function setInputVelocity(x: number, y: number) {
    inputVelocity.x = x
    inputVelocity.y = y
  }

  function requestAttack() {
    doAttack()
  }

  function setAttackHeld(held: boolean) {
    attackHeld = held
  }

  // --- Game Lifecycle ---

  function startGame() {
    audio.initCtx()
    audio.playTrack('game', 1)
    audio.playSfx('cowabunga')

    score.value = 0
    level.value = 1
    hp.value = 3
    power.value = 0
    isSpecial.value = false
    specialTimer.value = 0
    combo.value = 0
    comboTimerPercent.value = 0
    powerupTime.value = 0
    spicyTime.value = 0
    playerFilter.value = ''
    playerScale.value = 1
    biome.value = 'sewer'
    invincible.value = false
    invincibleFlash.value = false
    isDashing.value = false
    dashCooldown.value = 0
    isNewRecord.value = false
    bossWarning.value = false
    damageFlash.value = false
    levelUpFlash.value = false

    // Wave system init
    wave.value = 1
    waveCleared.value = false
    waveClearTimer.value = 0
    waveSpawned.value = 0
    waveTotal.value = calcWaveSize(1)
    waveEnemiesLeft.value = waveTotal.value

    playerX.value = arenaWidth.value / 2
    playerY.value = arenaHeight.value / 2

    enemies.value = []
    items.value = []
    projectiles.value = []
    vfx.value = []
    gems.value = []
    boss.value = null
    hitStop = 0
    lastAutoFireTime = 0

    // Stats
    stats.value.gamesPlayed++
    saveStats(stats.value)

    screen.value = 'playing'
    gameActive = true

    if (!animFrameId) {
      animFrameId = requestAnimationFrame(gameLoop)
    }
  }

  function calcWaveSize(waveNum: number): number {
    return Math.min(5 + waveNum * 2, 25) // 7, 9, 11... capped at 25
  }

  function togglePause() {
    if (screen.value === 'playing') {
      screen.value = 'paused'
      gameActive = false
      audio.suspendCtx()
    } else if (screen.value === 'paused') {
      screen.value = 'playing'
      gameActive = true
      audio.resumeCtx()
      animFrameId = requestAnimationFrame(gameLoop)
    }
  }

  function goToMenu() {
    screen.value = 'menu'
    gameActive = false
    if (animFrameId) cancelAnimationFrame(animFrameId)
    animFrameId = null
    audio.playTrack('menu')
  }

  function triggerSpecial() {
    if (power.value < 100 || isSpecial.value) return
    power.value = 0
    isSpecial.value = true
    specialTimer.value = Date.now() + 3000
    shout('🐢 TURTLE POWER!')
    audio.playSfx('radical')
    playerScale.value = 1.5
    haptic(200)
  }

  // Enhancement #6: Dash
  function triggerDash() {
    if (isDashing.value || Date.now() < dashCooldown.value) return
    if (screen.value !== 'playing') return

    isDashing.value = true
    dashEndTime = Date.now() + DASH_DURATION
    dashCooldown.value = Date.now() + DASH_COOLDOWN

    // Dash in current movement direction, or forward
    const mag = Math.sqrt(inputVelocity.x ** 2 + inputVelocity.y ** 2)
    if (mag > 0.1) {
      dashVx = (inputVelocity.x / mag) * 25
      dashVy = (inputVelocity.y / mag) * 25
    } else {
      dashVx = 0
      dashVy = -25 // Default: dash up
    }
    haptic(30)
  }

  // --- Main Game Loop ---

  function gameLoop(t: number) {
    if (!gameActive) return

    if (hitStop > 0) {
      if (Date.now() < hitStop) {
        animFrameId = requestAnimationFrame(gameLoop)
        return
      }
      hitStop = 0
    }

    // Enhancement #8: Auto-fire
    if (autoFire.value && attackHeld) {
      const now = Date.now()
      const isMutagen = powerupTime.value > 0 && now < powerupTime.value
      const cd = isMutagen ? 100 : 300
      if (now - lastAutoFireTime > cd) {
        doAttack()
        lastAutoFireTime = now
      }
    }

    // Enhancement #4: Combo timer
    updateComboTimer()

    // Enhancement #6: Dash
    updateDash()

    // Special attack logic
    updateSpecial()

    // Move player
    updatePlayer()

    // Level up check
    checkLevelUp()

    // Powerup expiration
    checkPowerups()

    // Enhancement #1: Invincibility flash
    if (invincible.value) {
      invincibleFlash.value = Math.floor(Date.now() / 80) % 2 === 0
    }

    // Enhancement #7: Wave spawning
    updateWaveSpawning(t)

    // Boss
    if (boss.value) updateBoss(t)

    // Projectiles
    updateProjectiles()

    // Enemies
    updateEnemies()

    // Items
    updateItems()

    // Enhancement #14: Gems magnetize
    updateGems()

    // Cleanup VFX
    cleanupVfx()

    animFrameId = requestAnimationFrame(gameLoop)
  }

  // --- Player ---

  function updatePlayer() {
    if (isDashing.value) return // Dash handles movement

    const speed = 8 * sensitivity.value
    playerX.value = clamp(playerX.value + inputVelocity.x * speed, 30, arenaWidth.value - 30)
    playerY.value = clamp(playerY.value + inputVelocity.y * speed, 30, arenaHeight.value - 30)
  }

  function updateDash() {
    if (!isDashing.value) return
    if (Date.now() > dashEndTime) {
      isDashing.value = false
      return
    }
    playerX.value = clamp(playerX.value + dashVx, 30, arenaWidth.value - 30)
    playerY.value = clamp(playerY.value + dashVy, 30, arenaHeight.value - 30)

    // Trail effect during dash
    vfx.value.push({
      id: nextId(), x: playerX.value, y: playerY.value,
      emoji: playerEmoji.value, tx: 0, ty: 0,
      born: Date.now(), duration: 200, type: 'trail',
      fontSize: 40,
    })
  }

  function movePlayerKeyboard(dx: number, dy: number) {
    if (isDashing.value) return
    const s = 25 * sensitivity.value
    playerX.value = clamp(playerX.value + dx * s, 30, arenaWidth.value - 30)
    playerY.value = clamp(playerY.value + dy * s, 30, arenaHeight.value - 30)
  }

  // --- Combo Timer (#4) ---

  function updateComboTimer() {
    if (combo.value <= 0) {
      comboTimerPercent.value = 0
      return
    }
    const elapsed = Date.now() - lastKill.value
    const remaining = Math.max(0, COMBO_WINDOW - elapsed)
    comboTimerPercent.value = (remaining / COMBO_WINDOW) * 100

    if (remaining <= 0) {
      combo.value = 0
      comboTimerPercent.value = 0
    }
  }

  // --- Combat ---

  let lastAttackTime = 0

  function doAttack() {
    if (screen.value !== 'playing') return
    const now = Date.now()
    const isMutagen = powerupTime.value > 0 && now < powerupTime.value
    const cd = isMutagen ? 100 : 300
    if (lastAttackTime && now - lastAttackTime < cd) return
    lastAttackTime = now

    audio.playSfx('attack')
    haptic(20)

    const spawnProj = (offX = 0, offY = 0) => {
      let emoji = '⚔️'
      if (isMutagen) emoji = '🔥'
      else if (skin.value === 'casey') emoji = '🏏'

      projectiles.value.push({
        id: nextId(),
        x: playerX.value + offX, y: playerY.value + offY,
        vx: 0, vy: 0, speed: 14,
        emoji, isEnemy: false, fontSize: isMutagen ? 32 : 28,
      })
    }

    spawnProj()
    if (isMutagen) {
      spawnProj(20, 20)
      spawnProj(-20, -20)
    }
  }

  // --- Enemies ---

  function updateEnemies() {
    const px = playerX.value
    const py = playerY.value

    for (let i = enemies.value.length - 1; i >= 0; i--) {
      const en = enemies.value[i]!
      const dx = px - en.x
      const dy = py - en.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      switch (en.type) {
        case 'bat':
          en.x += en.vx
          en.y += en.vy
          if (en.y < 0 || en.y > arenaHeight.value) en.vy *= -1
          if (en.x < -100 || en.x > arenaWidth.value + 100) {
            enemies.value.splice(i, 1)
            continue
          }
          break

        case 'shooter': {
          const targetDist = 250
          const spd = 1.2
          if (dist > targetDist + 50) { en.x += (dx / dist) * spd; en.y += (dy / dist) * spd }
          else if (dist < targetDist - 50) { en.x -= (dx / dist) * spd; en.y -= (dy / dist) * spd }
          const now = Date.now()
          if (now - (en.lastShot || 0) > 2000) {
            en.lastShot = now
            projectiles.value.push({
              id: nextId(), x: en.x, y: en.y,
              vx: (dx / dist) * 4, vy: (dy / dist) * 4,
              speed: 4, emoji: '✴️', isEnemy: true, fontSize: 20,
            })
          }
          break
        }

        case 'mouser': {
          const spd = 2.5 + level.value * 0.3
          en.x += (dx / dist) * spd + (Math.random() - 0.5) * 2
          en.y += (dy / dist) * spd + (Math.random() - 0.5) * 2
          break
        }

        case 'foot': {
          const now = Date.now()
          if (en.isDashing) {
            en.x += en.dashVx || 0
            en.y += en.dashVy || 0
            if (now - (en.lastDash || 0) > 300) en.isDashing = false
          } else {
            en.x += (dx / dist) * 1.0
            en.y += (dy / dist) * 1.0
            if (now - (en.lastDash || 0) > 2500 && dist < 300) {
              en.isDashing = true
              en.lastDash = now
              en.dashVx = (dx / dist) * 12
              en.dashVy = (dy / dist) * 12
            }
          }
          break
        }

        default: {
          const baseSpeed = 1.5 + level.value * 0.4
          en.x += (dx / dist) * baseSpeed
          en.y += (dy / dist) * baseSpeed
        }
      }

      // Enhancement #12: Damage indicators (opacity based on HP%)
      if (en.maxHp > 1) {
        const hpPct = en.hp / en.maxHp
        en.filter = hpPct < 0.5 ? 'brightness(1.5) saturate(0.5)' : ''
      }

      // Player collision — skip if invincible or dashing
      if (distBetween({ x: px, y: py }, en) < 40) {
        if (!invincible.value && !isDashing.value) {
          takeDamage()
          spawnParticles(en.x, en.y, '💥')
          enemies.value.splice(i, 1)
        } else if (isDashing.value) {
          // Dash through enemies damages them
          destroyEnemy(i)
        }
      }
    }
  }

  function spawnEnemy() {
    // Enhancement #9: Difficulty rebalance — spawn cap
    if (enemies.value.length >= 15) return

    if (level.value >= 5 && Math.random() < 0.2) { spawnFootSoldier(); return }
    if (level.value >= 4 && Math.random() < 0.15) { spawnMouserSwarm(); return }
    if (level.value >= 3 && Math.random() < 0.2) { spawnShooter(); return }
    if (level.value >= 2 && Math.random() < 0.3) { spawnBat(); return }

    const side = Math.floor(Math.random() * 4)
    let x: number, y: number
    const pad = 30
    if (side === 0) { x = -pad; y = Math.random() * arenaHeight.value }
    else if (side === 1) { x = arenaWidth.value + pad; y = Math.random() * arenaHeight.value }
    else if (side === 2) { x = Math.random() * arenaWidth.value; y = -pad }
    else { x = Math.random() * arenaWidth.value; y = arenaHeight.value + pad }

    // Enhancement #9: HP scales with level
    const hpVal = 1 + Math.floor(level.value / 4)

    enemies.value.push({
      id: nextId(), x, y, emoji: '🤖', type: 'robot',
      hp: hpVal, maxHp: hpVal, vx: 0, vy: 0, fontSize: 50, filter: '',
    })
  }

  function spawnBat() {
    const startLeft = Math.random() > 0.5
    enemies.value.push({
      id: nextId(),
      x: startLeft ? -50 : arenaWidth.value + 50,
      y: Math.random() * (arenaHeight.value - 100) + 50,
      emoji: '🦇', type: 'bat',
      hp: 1, maxHp: 1,
      vx: startLeft ? 3 + Math.random() : -(3 + Math.random()),
      vy: (Math.random() - 0.5) * 4, fontSize: 50, filter: '',
    })
  }

  function spawnShooter() {
    const angle = Math.random() * Math.PI * 2
    const hpVal = 2 + Math.floor(level.value / 3)
    enemies.value.push({
      id: nextId(),
      x: arenaWidth.value / 2 + Math.cos(angle) * (arenaWidth.value / 1.5),
      y: arenaHeight.value / 2 + Math.sin(angle) * (arenaHeight.value / 1.5),
      emoji: '🥷', type: 'shooter',
      hp: hpVal, maxHp: hpVal, vx: 0, vy: 0, lastShot: 0, fontSize: 50, filter: '',
    })
  }

  function spawnMouserSwarm() {
    shout('🐁 MOUSER SWARM!')
    for (let i = 0; i < 3; i++) {
      const angle = Math.random() * Math.PI * 2
      const d = arenaWidth.value / 2 + 50
      enemies.value.push({
        id: nextId(),
        x: arenaWidth.value / 2 + Math.cos(angle) * d,
        y: arenaHeight.value / 2 + Math.sin(angle) * d,
        emoji: '🐁', type: 'mouser', hp: 1, maxHp: 1,
        vx: 0, vy: 0, fontSize: 35, filter: '',
      })
    }
  }

  function spawnFootSoldier() {
    const angle = Math.random() * Math.PI * 2
    const hpVal = 3 + Math.floor(level.value / 3)
    enemies.value.push({
      id: nextId(),
      x: arenaWidth.value / 2 + Math.cos(angle) * (arenaWidth.value / 1.2),
      y: arenaHeight.value / 2 + Math.sin(angle) * (arenaHeight.value / 1.2),
      emoji: '👺', type: 'foot',
      hp: hpVal, maxHp: hpVal, vx: 0, vy: 0, fontSize: 50, filter: '',
      lastDash: 0, isDashing: false, dashVx: 0, dashVy: 0,
    })
  }

  function destroyEnemy(index: number) {
    const en = enemies.value[index]!

    // Enhancement #9: Multi-hit enemies lose HP instead of dying
    en.hp--
    if (en.hp > 0) {
      spawnParticles(en.x, en.y, '💥', 12)
      spawnFloatText(en.x, en.y, `${en.hp}/${en.maxHp}`, '#ff6b00')
      hitStop = Date.now() + 25
      haptic(15)
      return
    }

    hitStop = Date.now() + 40
    haptic(40)

    // Power charge
    if (!isSpecial.value && power.value < 100) {
      power.value = Math.min(100, power.value + 5)
      if (power.value >= 100) {
        shout('⚡ COWABUNGA READY!')
        audio.playSfx('radical')
      }
    }

    // Combo
    const now = Date.now()
    if (now - lastKill.value < COMBO_WINDOW) combo.value++
    else combo.value = 1
    lastKill.value = now

    // Enhancement #3: Kill streaks
    for (const [threshold, msg] of KILL_STREAKS) {
      if (combo.value === threshold) {
        shout(msg)
        shake(3) // Big shake for kill streak
        haptic(100)
        break
      }
    }

    // Enhancement #16: Stats
    stats.value.totalKills++
    if (combo.value > stats.value.highestCombo) stats.value.highestCombo = combo.value

    const pts = 50 * combo.value
    score.value += pts

    // Enhancement #11: Themed death particles
    const deathEmoji = DEATH_PARTICLES[en.type] || '💥'
    spawnParticles(en.x, en.y, deathEmoji, 20)
    spawnParticles(en.x, en.y, '💥', 15)
    spawnFloatText(en.x, en.y, `+${pts}`, '#ffff00')
    if (combo.value > 1) spawnFloatText(en.x, en.y - 20, `${combo.value}x`, '#ff6b00')

    // Enhancement #14: Score gems
    for (let i = 0; i < Math.min(combo.value, 5); i++) {
      gems.value.push({
        id: nextId(),
        x: en.x + (Math.random() - 0.5) * 60,
        y: en.y + (Math.random() - 0.5) * 60,
        born: Date.now(),
      })
    }

    // Wave tracking
    waveEnemiesLeft.value = Math.max(0, waveEnemiesLeft.value - 1)

    enemies.value.splice(index, 1)
    shake(1) // Normal shake for kill
  }

  // --- Enhancement #14: Gems ---

  function updateGems() {
    const px = playerX.value
    const py = playerY.value

    for (let i = gems.value.length - 1; i >= 0; i--) {
      const g = gems.value[i]!
      // Magnetize toward player
      const dx = px - g.x
      const dy = py - g.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < 30) {
        // Collect
        score.value += 10
        gems.value.splice(i, 1)
        continue
      }

      // Attract
      const speed = Math.max(3, 12 - dist / 50)
      g.x += (dx / dist) * speed
      g.y += (dy / dist) * speed

      // Expire old gems
      if (Date.now() - g.born > 5000) {
        gems.value.splice(i, 1)
      }
    }
  }

  // --- Items ---

  function spawnItem() {
    const r = Math.random()
    let emoji = '🍕'
    let type: ItemType = 'pizza'
    if (r < 0.05) { emoji = '🌶️'; type = 'spicy' }
    else if (r < 0.15) { emoji = '🛢️'; type = 'barrel' }
    else if (r < 0.25) { emoji = '🧪'; type = 'ooze' }

    items.value.push({
      id: nextId(),
      x: 50 + Math.random() * (arenaWidth.value - 100),
      y: 50 + Math.random() * (arenaHeight.value - 100),
      emoji, type, hp: 1, maxHp: 1, vx: 0, vy: 0, fontSize: 50, filter: '',
    })
  }

  function updateItems() {
    const px = playerX.value
    const py = playerY.value
    for (let i = items.value.length - 1; i >= 0; i--) {
      const it = items.value[i]!
      if (distBetween({ x: px, y: py }, it) < 45) {
        if (it.type === 'barrel') {
          if (!invincible.value && !isDashing.value) {
            takeDamage()
          }
          explodeBarrel(i)
        } else {
          collectItem(it)
          items.value.splice(i, 1)
        }
        continue
      }

      if (it.type === 'barrel') {
        for (let pi = projectiles.value.length - 1; pi >= 0; pi--) {
          const p = projectiles.value[pi]!
          if (!p.isEnemy && distBetween(p, it) < 40) {
            explodeBarrel(i)
            projectiles.value.splice(pi, 1)
            break
          }
        }
      }
    }
  }

  function explodeBarrel(idx: number) {
    const it = items.value[idx]!
    items.value.splice(idx, 1)
    audio.playSfx('attack')
    shout('💥 BOOM!')
    shake(2)
    haptic(80)
    spawnParticles(it.x, it.y, '💥', 100)
    spawnParticles(it.x, it.y, '🔥', 40)

    for (let i = enemies.value.length - 1; i >= 0; i--) {
      if (distBetween(it, enemies.value[i]!) < 250) {
        destroyEnemy(i)
      }
    }
  }

  function collectItem(item: Entity) {
    if (item.type === 'pizza') {
      score.value += 100
      stats.value.pizzaEaten++
      if (hp.value < maxHp.value) { hp.value++; shout('❤️ HEALED!') }
      else shout('🍕 YUM!')
      audio.playSfx('pizza')
      spawnParticles(playerX.value, playerY.value, '✨')
      haptic(30)
    } else if (item.type === 'ooze') {
      score.value += 500
      shout('🧪 MUTAGEN!')
      audio.playSfx('radical')
      powerupTime.value = Date.now() + 5000
      playerFilter.value = 'drop-shadow(0 0 20px #00ff88) hue-rotate(90deg)'
      audio.playTrack('mutagen')
      haptic(100)
    } else if (item.type === 'spicy') {
      score.value += 300
      shout('🌶️ SPICY!!')
      audio.playSfx('radical')
      spicyTime.value = Date.now() + 10000
      playerFilter.value = 'drop-shadow(0 0 20px #ff003c) sepia(1) saturate(5)'
      haptic(60)
    }
  }

  // --- Enhancement #7: Wave System ---

  let lastSpawnTime = 0

  function updateWaveSpawning(t: number) {
    // Boss levels
    if (level.value > 0 && level.value % 5 === 0) {
      if (!boss.value) {
        // Enhancement #13: Boss warning
        if (!bossWarning.value) {
          bossWarning.value = true
          shout('⚠️ WARNING!')
          damageFlash.value = true
          setTimeout(() => { shout('⚠️ WARNING!'); damageFlash.value = true }, 800)
          setTimeout(() => { shout('⚠️ RAT KING APPROACHES!'); spawnBoss() }, 1600)
          setTimeout(() => { bossWarning.value = false; damageFlash.value = false }, 2400)
        }
      } else {
        updateBoss(t)
      }
      return
    }

    // Wave clear check
    if (waveSpawned.value >= waveTotal.value && enemies.value.length === 0 && !waveCleared.value) {
      waveCleared.value = true
      waveClearTimer.value = Date.now()
      shout(`🌊 WAVE ${wave.value} CLEAR!`)
      audio.playSfx('radical')
      haptic(60)
    }

    // Wave respite
    if (waveCleared.value) {
      if (Date.now() - waveClearTimer.value > 2000) {
        // Next wave
        wave.value++
        waveCleared.value = false
        waveSpawned.value = 0
        waveTotal.value = calcWaveSize(wave.value)
        waveEnemiesLeft.value = waveTotal.value
        shout(`🌊 WAVE ${wave.value}`)
      }
      return
    }

    // Spawn enemies for this wave
    if (waveSpawned.value < waveTotal.value) {
      const spawnRate = Math.max(400, 1500 - level.value * 100)
      if (t - lastSpawnTime > spawnRate) {
        spawnEnemy()
        waveSpawned.value++
        if (Math.random() > 0.6) spawnItem()
        lastSpawnTime = t
      }
    }
  }

  // --- Boss ---

  function spawnBoss() {
    if (boss.value) return
    const maxBossHp = 50 + level.value * 10
    boss.value = {
      x: arenaWidth.value / 2, y: -100,
      hp: maxBossHp, maxHp: maxBossHp,
      vx: 2 + level.value * 0.2,
      lastShot: 0, phase: 'enter',
      emoji: '🐀', fontSize: 100,
      warningStart: Date.now(),
    }
  }

  function updateBoss(t: number) {
    const b = boss.value
    if (!b) return
    if (b.phase === 'enter') {
      b.y += 2
      if (b.y > 100) b.phase = 'fight'
    } else if (b.phase === 'fight') {
      b.x += b.vx
      if (b.x > arenaWidth.value - 50 || b.x < 50) b.vx *= -1
      b.y = 100 + Math.sin(t / 500) * 30

      if (t - b.lastShot > 800) {
        bossAttack()
        b.lastShot = t
      }
    }
  }

  function bossAttack() {
    const b = boss.value
    if (!b) return
    const dx = playerX.value - b.x
    const dy = playerY.value - b.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    projectiles.value.push({
      id: nextId(), x: b.x, y: b.y,
      vx: (dx / dist) * 8, vy: (dy / dist) * 8,
      speed: 8, emoji: '🟢', isEnemy: true, fontSize: 30,
    })
  }

  function bossDefeated() {
    const b = boss.value
    if (!b) return
    const bonus = 2000 * (level.value / 5)
    score.value += bonus
    shout('🏆 BOSS DESTROYED!')
    audio.playSfx('radical')
    spawnParticles(b.x, b.y, '💥', 80)
    spawnParticles(b.x, b.y, '🔥', 50)
    spawnParticles(b.x, b.y, '⭐', 30)
    shake(3)
    haptic(200)

    stats.value.bossesDefeated++
    saveStats(stats.value)

    boss.value = null
    bossWarning.value = false
    projectiles.value = projectiles.value.filter(p => !p.isEnemy)

    // Advance past boss level
    score.value += 100 // Push past the 1000-point boundary
  }

  // --- Projectiles ---

  function updateProjectiles() {
    const px = playerX.value
    const py = playerY.value

    for (let i = projectiles.value.length - 1; i >= 0; i--) {
      const p = projectiles.value[i]!

      if (p.isEnemy) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < -50 || p.x > arenaWidth.value + 50 || p.y < -50 || p.y > arenaHeight.value + 50) {
          projectiles.value.splice(i, 1)
          continue
        }
        if (distBetween(p, { x: px, y: py }) < 40) {
          if (!invincible.value && !isDashing.value) {
            takeDamage()
          }
          projectiles.value.splice(i, 1)
          continue
        }
      } else {
        // Heat-seeking player projectiles
        let target: Vec2 | null = null
        if (boss.value && boss.value.phase === 'fight') {
          target = boss.value
        } else {
          let minDist = 9999
          for (const en of enemies.value) {
            const d = distBetween(p, en)
            if (d < minDist) { minDist = d; target = en }
          }
        }

        if (target) {
          const dx = target.x - p.x
          const dy = target.y - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          p.vx = (dx / dist) * p.speed
          p.vy = (dy / dist) * p.speed
        } else {
          if (p.vx === 0 && p.vy === 0) p.vx = p.speed
        }

        p.x += p.vx
        p.y += p.vy

        // Enhancement #10: Projectile trails
        if (Math.random() > 0.6) {
          vfx.value.push({
            id: nextId(), x: p.x, y: p.y,
            emoji: '✨', tx: 0, ty: 0,
            born: Date.now(), duration: 150, type: 'trail', fontSize: 10,
          })
        }

        if (p.x > arenaWidth.value + 50 || p.x < -50 || p.y > arenaHeight.value + 50 || p.y < -50) {
          projectiles.value.splice(i, 1)
          continue
        }

        let hit = false
        for (let j = enemies.value.length - 1; j >= 0; j--) {
          if (distBetween(p, enemies.value[j]!) < 50) {
            destroyEnemy(j)
            hit = true
            break
          }
        }

        if (!hit && boss.value && boss.value.phase === 'fight' && distBetween(p, boss.value) < 80) {
          boss.value.hp--
          audio.playSfx('attack')
          spawnParticles(p.x, p.y, '💥')
          spawnFloatText(p.x, p.y, '-1', '#ff003c')
          if (boss.value.hp <= 0) bossDefeated()
          hit = true
          shake(1)
        }

        if (hit) {
          projectiles.value.splice(i, 1)
        }
      }
    }
  }

  // --- Special ---

  function updateSpecial() {
    if (!isSpecial.value) return
    if (Date.now() > specialTimer.value) {
      isSpecial.value = false
      playerScale.value = 1
    } else {
      for (let i = enemies.value.length - 1; i >= 0; i--) {
        if (distBetween({ x: playerX.value, y: playerY.value }, enemies.value[i]!) < 80) {
          destroyEnemy(i)
        }
      }
    }
  }

  // --- Level & Powerups ---

  function checkLevelUp() {
    const calcLevel = 1 + Math.floor(score.value / 1000)
    if (calcLevel > level.value) {
      level.value = calcLevel

      // Enhancement #5: Screen flash on level up
      levelUpFlash.value = true
      setTimeout(() => { levelUpFlash.value = false }, 300)

      levelFlashText.value = `LEVEL ${level.value}!`
      levelFlashing.value = true
      setTimeout(() => { levelFlashing.value = false }, 2000)

      if (level.value >= 5) {
        biome.value = 'technodrome'
        if (level.value === 5) shout('⚡ ENTER DIMENSION X!')
      } else {
        biome.value = 'sewer'
      }

      audio.playSfx('radical')
      audio.playTrack('game', level.value)
      shake(2)
      haptic(80)

      // Reset wave for new level
      wave.value = 1
      waveSpawned.value = 0
      waveCleared.value = false
      waveTotal.value = calcWaveSize(1)
      waveEnemiesLeft.value = waveTotal.value
    }
  }

  function checkPowerups() {
    const now = Date.now()
    if (powerupTime.value > 0 && now > powerupTime.value) {
      powerupTime.value = 0
      playerFilter.value = ''
      shout('POWER DOWN')
      audio.playTrack('game', level.value)
    }
    if (spicyTime.value > 0 && now > spicyTime.value) {
      spicyTime.value = 0
      if (!powerupTime.value) playerFilter.value = ''
    }
  }

  // --- Damage ---

  function takeDamage() {
    if (invincible.value || isDashing.value) return

    hp.value--
    haptic(100)

    // Enhancement #15: Damage flash
    damageFlash.value = true
    setTimeout(() => { damageFlash.value = false }, 300)

    // Enhancement #2: Heavy shake on damage
    shake(2)
    shout('💔 OUCH!')

    // Enhancement #1: Invincibility frames
    invincible.value = true
    setTimeout(() => {
      invincible.value = false
      invincibleFlash.value = false
    }, 1000)

    if (hp.value <= 0) gameOver()
  }

  function gameOver() {
    gameActive = false
    screen.value = 'gameover'
    audio.playTrack('gameover')

    // Enhancement #16: Save stats
    stats.value.totalScore += score.value
    saveStats(stats.value)

    // Enhancement #18: Best run check
    const rank = leaderboard.submitScore(score.value, level.value)
    isNewRecord.value = rank === 0
  }

  // --- VFX ---

  function shout(text: string) {
    shoutText.value = text
    shoutId.value = nextId()
    setTimeout(() => { shoutText.value = '' }, 1500)
  }

  // Enhancement #2: Scaled shake
  function shake(intensity = 1) {
    shakeIntensity.value = intensity
    shaking.value = true
    setTimeout(() => { shaking.value = false }, 100 + intensity * 50)
  }

  function spawnParticles(x: number, y: number, emoji: string, size = 15) {
    const count = Math.min(8, 4 + Math.floor(size / 20))
    for (let i = 0; i < count; i++) {
      vfx.value.push({
        id: nextId(), x, y, emoji,
        tx: (Math.random() - 0.5) * 200,
        ty: (Math.random() - 0.5) * 200,
        born: Date.now(), duration: 500, type: 'particle', fontSize: size,
      })
    }
  }

  function spawnFloatText(x: number, y: number, text: string, color: string) {
    vfx.value.push({
      id: nextId(), x, y, emoji: '',
      tx: 0, ty: -150,
      born: Date.now(), duration: 800,
      type: 'float', text, color, fontSize: 20,
    })
  }

  function cleanupVfx() {
    const now = Date.now()
    vfx.value = vfx.value.filter(p => now - p.born < p.duration)
  }

  // --- Settings ---

  function toggleLeftHanded() {
    leftHanded.value = !leftHanded.value
    if (import.meta.client) {
      localStorage.setItem('nsr_lefty', String(leftHanded.value))
    }
  }

  function setSensitivity(val: number) {
    sensitivity.value = val
    if (import.meta.client) {
      localStorage.setItem('nsr_sens', String(val))
    }
  }

  function toggleSkin() {
    skin.value = skin.value === 'leo' ? 'casey' : 'leo'
  }

  function toggleAutoFire() {
    autoFire.value = !autoFire.value
    if (import.meta.client) {
      localStorage.setItem('nsr_autofire', String(autoFire.value))
    }
  }

  // Enhancement #17: Milestone unlocks
  const caseyUnlocked = computed(() => stats.value.totalScore >= 5000)

  // --- Resize ---

  function setArenaSize(w: number, h: number) {
    arenaWidth.value = w
    arenaHeight.value = h
    if (playerX.value > w) playerX.value = w - 50
    if (playerY.value > h) playerY.value = h - 50
  }

  // --- Helpers ---

  function distBetween(a: Vec2, b: Vec2): number {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
  }

  function clamp(v: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, v))
  }

  onUnmounted(() => {
    if (animFrameId) cancelAnimationFrame(animFrameId)
    audio.stopMusic()
  })

  return {
    // State
    screen, score, level, hp, maxHp, power, isSpecial, combo, comboTimerPercent,
    skin, leftHanded, sensitivity, autoFire,
    playerX, playerY, playerEmoji, playerFilter, playerScale,
    invincible, invincibleFlash, isDashing,
    enemies, items, projectiles, boss, vfx, gems,
    shaking, shakeIntensity, levelFlashText, levelFlashing, biome,
    shoutText, shoutId,
    arenaWidth, arenaHeight,
    wave, waveEnemiesLeft, waveCleared, waveTotal,
    bossWarning, damageFlash, levelUpFlash,
    stats, isNewRecord, caseyUnlocked,

    // Audio & Leaderboard
    audio, leaderboard,

    // Actions
    startGame, togglePause, goToMenu, triggerSpecial, triggerDash,
    setInputVelocity, requestAttack, setAttackHeld, movePlayerKeyboard,
    toggleLeftHanded, setSensitivity, toggleSkin, toggleAutoFire,
    setArenaSize,
  }
}
