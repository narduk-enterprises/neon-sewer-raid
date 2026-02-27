<script setup lang="ts">
const game = inject('game') as ReturnType<typeof useGameEngine>

const arenaRef = ref<HTMLElement | null>(null)

function updateSize() {
  if (arenaRef.value) {
    game.setArenaSize(arenaRef.value.offsetWidth, arenaRef.value.offsetHeight)
  }
}

onMounted(() => {
  updateSize()
  window.addEventListener('resize', updateSize)
  const observer = new ResizeObserver(updateSize)
  if (arenaRef.value) observer.observe(arenaRef.value)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateSize)
})

// Rotation for special attack
const spinDeg = ref(0)
let spinFrame: number | null = null
function spinLoop() {
  if (game.isSpecial.value) {
    spinDeg.value = (Date.now() % 360) * 5
    spinFrame = requestAnimationFrame(spinLoop)
  } else {
    spinDeg.value = 0
  }
}
watch(() => game.isSpecial.value, (active) => {
  if (active) spinLoop()
  else if (spinFrame) cancelAnimationFrame(spinFrame)
})
</script>

<template>
  <div class="game-layout">
    <!-- HUD -->
    <GameHud v-if="game.screen.value === 'playing'" />

    <!-- Arena -->
    <div
      ref="arenaRef"
      class="arena"
      :class="[
        game.biome.value === 'technodrome' ? 'technodrome' : 'sewer',
        { shaking: game.shaking.value },
        { 'damage-flash': game.damageFlash.value },
        { 'level-up-flash': game.levelUpFlash.value },
      ]"
      :style="game.shaking.value ? `--shake-intensity: ${game.shakeIntensity.value}` : undefined"
    >
      <!-- CRT Overlay -->
      <div class="crt-overlay" />

      <!-- Boss Warning Overlay -->
      <div v-if="game.bossWarning.value" class="boss-warning-overlay" />

      <!-- Player -->
      <div
        class="entity player-entity"
        :class="{ 'invincible-blink': game.invincibleFlash.value, 'is-dashing': game.isDashing.value }"
        :style="{
          left: game.playerX.value + 'px',
          top: game.playerY.value + 'px',
          fontSize: '50px',
          filter: game.playerFilter.value || undefined,
          transform: `translate(-50%, -50%) scale(${game.playerScale.value})${game.isSpecial.value ? ` rotate(${spinDeg}deg)` : ''}`,
        }"
      >
        {{ game.playerEmoji.value }}
      </div>

      <!-- Enemies -->
      <div
        v-for="en in game.enemies.value"
        :key="en.id"
        class="entity"
        :style="{
          left: en.x + 'px', top: en.y + 'px',
          fontSize: en.fontSize + 'px',
          filter: en.filter || undefined,
          opacity: en.hp < en.maxHp && en.maxHp > 1 ? 0.6 + (en.hp / en.maxHp) * 0.4 : 1,
        }"
      >
        {{ en.emoji }}
        <!-- Mini HP bar for multi-hit enemies -->
        <div v-if="en.maxHp > 1 && en.hp < en.maxHp" class="mini-hp-bar">
          <div class="mini-hp-fill" :style="{ width: (en.hp / en.maxHp * 100) + '%' }" />
        </div>
      </div>

      <!-- Items -->
      <div
        v-for="it in game.items.value"
        :key="it.id"
        class="entity pop-in"
        :style="{ left: it.x + 'px', top: it.y + 'px', fontSize: it.fontSize + 'px' }"
      >
        {{ it.emoji }}
      </div>

      <!-- Projectiles -->
      <div
        v-for="p in game.projectiles.value"
        :key="p.id"
        class="entity projectile"
        :style="{ left: p.x + 'px', top: p.y + 'px', fontSize: p.fontSize + 'px' }"
      >
        {{ p.emoji }}
      </div>

      <!-- Score Gems (#14) -->
      <div
        v-for="g in game.gems.value"
        :key="g.id"
        class="gem"
        :style="{ left: g.x + 'px', top: g.y + 'px' }"
      >
        ✨
      </div>

      <!-- Boss -->
      <template v-if="game.boss.value">
        <div
          class="entity boss-entity"
          :style="{
            left: game.boss.value.x + 'px',
            top: game.boss.value.y + 'px',
            fontSize: game.boss.value.fontSize + 'px',
            filter: 'drop-shadow(0 0 20px var(--nsr-red))',
          }"
        >
          {{ game.boss.value.emoji }}
        </div>
        <div class="boss-hp-bar">
          <div class="boss-hp-fill" :style="{ width: (game.boss.value.hp / game.boss.value.maxHp * 100) + '%' }" />
          <div class="boss-hp-label">RAT KING</div>
        </div>
      </template>

      <!-- VFX Particles -->
      <div
        v-for="p in game.vfx.value"
        :key="p.id"
        class="vfx-particle"
        :class="'vfx-' + p.type"
        :style="{
          left: p.x + 'px', top: p.y + 'px',
          '--tx': p.tx + 'px', '--ty': p.ty + 'px',
          color: p.color,
          fontSize: (p.fontSize || 15) + 'px',
        }"
      >
        {{ p.text || p.emoji }}
      </div>

      <!-- Level Flash -->
      <div v-if="game.levelFlashing.value" class="level-flash">
        {{ game.levelFlashText.value }}
      </div>

      <!-- Wave Indicator -->
      <div v-if="game.screen.value === 'playing' && !game.boss.value" class="wave-indicator">
        WAVE {{ game.wave.value }}
        <span v-if="game.waveCleared.value" class="wave-cleared">✓ CLEAR</span>
      </div>

      <!-- Combo Counter -->
      <div v-if="game.combo.value > 1" class="combo-display">
        <div class="combo-count">{{ game.combo.value }}x COMBO</div>
        <div class="combo-timer-bar">
          <div class="combo-timer-fill" :style="{ width: game.comboTimerPercent.value + '%' }" />
        </div>
      </div>

      <!-- Shout -->
      <Transition name="shout">
        <div
          v-if="game.shoutText.value"
          :key="game.shoutId.value"
          class="shout-toast"
        >
          {{ game.shoutText.value }}
        </div>
      </Transition>

      <!-- Special Ready Button -->
      <UButton
        v-if="game.power.value >= 100 && !game.isSpecial.value && game.screen.value === 'playing'"
        class="btn-special"
        @touchstart.prevent="game.triggerSpecial()"
        @click="game.triggerSpecial()"
      >
        🐢
      </UButton>
    </div>

    <!-- Touch Controls -->
    <GameControls v-if="game.screen.value === 'playing'" />
  </div>
</template>

<style scoped>
/* Styles moved to main.css to comply with atx/no-style-block-layout */
</style>
