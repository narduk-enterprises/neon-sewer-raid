<script setup lang="ts">
const game = inject('game') as ReturnType<typeof useGameEngine>
</script>

<template>
  <div class="screen-overlay">
    <h1 class="pause-title">PAUSED</h1>
    <UButton class="btn-neon primary" @click="game.togglePause()">RESUME</UButton>
    <UButton class="btn-neon secondary" @click="game.goToMenu()">QUIT</UButton>
  </div>
</template>

<style scoped>
.screen-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 210;
  gap: 12px;
}

.pause-title {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(2rem, 6vw, 3rem);
  color: white;
  text-shadow: 0 0 20px white;
}
</style>
