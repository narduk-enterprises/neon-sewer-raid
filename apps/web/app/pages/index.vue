<script setup lang="ts">
const game = useGameEngine()

// Inject game engine for child components
provide('game', game)

// Keyboard controls
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && (game.screen.value === 'menu' || game.screen.value === 'gameover')) {
    game.startGame()
  }
  if (e.key === 'Escape' && (game.screen.value === 'playing' || game.screen.value === 'paused')) {
    game.togglePause()
  }

  if (game.screen.value !== 'playing') return

  if (e.key === 'ArrowUp' || e.key === 'w') game.movePlayerKeyboard(0, -1)
  if (e.key === 'ArrowDown' || e.key === 's') game.movePlayerKeyboard(0, 1)
  if (e.key === 'ArrowLeft' || e.key === 'a') game.movePlayerKeyboard(-1, 0)
  if (e.key === 'ArrowRight' || e.key === 'd') game.movePlayerKeyboard(1, 0)
  if (e.key === ' ') { e.preventDefault(); game.requestAttack() }
  if (e.key === 'e' || e.key === 'E') game.triggerSpecial()
  if (e.key === 'Shift') { e.preventDefault(); game.triggerDash() }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

useSeoMeta({
  title: '🐢 Neon Sewer Raid',
  description: 'An arcade action game. Fight robots, bats, and the Rat King in neon-lit sewers!',
})
</script>

<template>
  <div class="game-page">
    <!-- Screen Overlays -->
    <ScreenMenu v-if="game.screen.value === 'menu'" />
    <ScreenHelp v-if="game.screen.value === 'help'" />
    <ScreenSettings v-if="game.screen.value === 'settings'" />
    <ScreenPause v-if="game.screen.value === 'paused'" />
    <ScreenGameOver v-if="game.screen.value === 'gameover'" />

    <!-- Game Arena -->
    <GameArena />
  </div>
</template>

<style scoped>
.game-page {
  width: 100%;
  height: 100dvh;
  position: relative;
  overflow: hidden;
  background: #050510;
  display: flex;
  flex-direction: column;
}
</style>
