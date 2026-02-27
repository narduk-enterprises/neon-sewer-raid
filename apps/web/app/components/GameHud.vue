<script setup lang="ts">
const game = inject('game') as ReturnType<typeof useGameEngine>
</script>

<template>
  <div class="hud-bar">
    <div class="stat-box stat-hp">
      <div class="stat-label">HP</div>
      <div class="stat-value">{{ '❤️'.repeat(game.hp.value) }}{{ '🖤'.repeat(game.maxHp.value - game.hp.value) }}</div>
    </div>
    <div class="stat-box stat-level">
      <div class="stat-label">LVL</div>
      <div class="stat-value">{{ game.level.value }}</div>
    </div>
    <div class="stat-box stat-score">
      <div class="stat-label">SCORE</div>
      <div class="stat-value">{{ game.score.value.toLocaleString() }}</div>
    </div>
    <div class="stat-box stat-power">
      <div class="stat-label">POWER</div>
      <div class="power-bar-track">
        <div
          class="power-bar-fill"
          :style="{ width: game.power.value + '%' }"
          :class="{ ready: game.power.value >= 100 }"
        />
      </div>
    </div>
    <UButton class="stat-box stat-pause" @click="game.togglePause()">
      <div class="stat-label">PAUSE</div>
      <div class="stat-value">⏸️</div>
    </UButton>
  </div>
</template>

<style scoped>
.hud-bar {
  display: flex;
  gap: 6px;
  padding: 6px 8px;
  z-index: 100;
  flex-wrap: wrap;
  align-items: flex-start;
}

</style>
