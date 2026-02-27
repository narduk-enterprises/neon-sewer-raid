<script setup lang="ts">
const game = inject('game') as ReturnType<typeof useGameEngine>

function shareScore() {
  const text = `🐢 NEON SEWER RAID\nSCORE: ${game.score.value}\nLEVEL: ${game.level.value}\nWAVE: ${game.wave.value}\nDetails: https://neon-sewer-raid.narduk.workers.dev/`
  navigator.clipboard.writeText(text)
    .then(() => alert('Score copied! 📋'))
    .catch(() => alert('Could not copy score.'))
}
</script>

<template>
  <div class="screen-overlay">
    <!-- Enhancement #18: NEW RECORD -->
    <div v-if="game.isNewRecord.value" class="new-record">🌟 NEW RECORD! 🌟</div>
    <h1 class="gameover-title">MISSION FAILED</h1>

    <div class="final-stats">
      <div>Score: <span class="score-val">{{ game.score.value.toLocaleString() }}</span></div>
      <div>Level: <span class="level-val">{{ game.level.value }}</span></div>
      <div>Wave: <span class="wave-val">{{ game.wave.value }}</span></div>
      <div>Best Combo: <span class="combo-val">{{ game.combo.value }}x</span></div>
    </div>

    <!-- Leaderboard -->
    <div class="leaderboard">
      <div class="lb-title">🏆 HIGH SCORES</div>
      <div
        v-for="(s, i) in game.leaderboard.scores.value"
        :key="i"
        class="lb-row"
        :class="{ current: s.score === game.score.value }"
      >
        <span>#{{ i + 1 }}</span>
        <span>Lv{{ s.level }}</span>
        <span>{{ s.score.toLocaleString() }}</span>
      </div>
      <div v-if="game.leaderboard.scores.value.length === 0" class="lb-empty">No scores yet!</div>
    </div>

    <div class="btn-group">
      <UButton class="btn-neon primary" @click="game.startGame()">RETRY</UButton>
      <UButton class="btn-neon secondary" @click="shareScore()">📋 SHARE SCORE</UButton>
      <UButton class="btn-neon secondary" @click="game.goToMenu()">MENU</UButton>
    </div>
  </div>
</template>

<style scoped>
</style>
