<script setup lang="ts">
const game = inject('game') as ReturnType<typeof useGameEngine>

const showCoin = ref(true)
onMounted(() => {
  setInterval(() => { showCoin.value = !showCoin.value }, 500)
})
</script>

<template>
  <div class="screen-overlay">
    <h1 class="neon-title">🐢 NEON<br>SEWER RAID</h1>
    <div class="version">v8.0 — ENHANCED</div>
    <div v-if="showCoin" class="insert-coin">🪙 INSERT COIN</div>
    <div v-else class="insert-coin">&nbsp;</div>

    <UButton class="btn-neon primary" @click="game.startGame()">START MISSION</UButton>
    <UButton class="btn-neon secondary" @click="game.toggleSkin()">
      {{ game.skin.value === 'leo' ? '🐢 HERO: LEO' : '🏒 HERO: CASEY' }}
      <span v-if="!game.caseyUnlocked.value" class="lock">🔒 5K pts to unlock</span>
    </UButton>
    <UButton class="btn-neon secondary" @click="game.screen.value = 'settings'">⚙️ SETTINGS</UButton>
    <UButton class="btn-neon secondary" @click="game.screen.value = 'help'">❓ HOW TO PLAY</UButton>

    <div class="hi-score">
      High Score: <span class="hi-score-val">{{ game.leaderboard.highScore.value.toLocaleString() }}</span>
    </div>

    <!-- Enhancement #16: Persistent Stats -->
    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-num">{{ game.stats.value.gamesPlayed }}</div>
        <div class="stat-name">Games</div>
      </div>
      <div class="stat-item">
        <div class="stat-num">{{ game.stats.value.totalKills }}</div>
        <div class="stat-name">Kills</div>
      </div>
      <div class="stat-item">
        <div class="stat-num">{{ game.stats.value.bossesDefeated }}</div>
        <div class="stat-name">Bosses</div>
      </div>
      <div class="stat-item">
        <div class="stat-num">{{ game.stats.value.highestCombo }}x</div>
        <div class="stat-name">Best Combo</div>
      </div>
      <div class="stat-item">
        <div class="stat-num">{{ game.stats.value.pizzaEaten }}</div>
        <div class="stat-name">🍕 Eaten</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
