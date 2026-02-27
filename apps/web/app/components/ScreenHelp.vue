<script setup lang="ts">
const game = inject('game') as ReturnType<typeof useGameEngine>
</script>

<template>
  <div class="screen-overlay">
    <h1 class="help-title">INSTRUCTIONS</h1>
    <div class="help-content">
      <div class="help-section">
        <h3 class="section-title orange">CONTROLS</h3>
        <div class="help-row"><span>🕹️ <b>MOVE</b></span><span>Joystick / WASD / Arrows</span></div>
        <div class="help-row"><span>⚔️ <b>ATTACK</b></span><span>Button / Space</span></div>
        <div class="help-row"><span>🐢 <b>SPECIAL</b></span><span>Button / Shift</span></div>
      </div>

      <div class="help-section">
        <h3 class="section-title purple">POWERUPS</h3>
        <div class="help-item">🍕 <b class="orange">PIZZA:</b> Restores 1 Heart ❤️</div>
        <div class="help-item">🧪 <b class="green">OOZE:</b> MUTAGEN MODE (5s) — Rapid Fire + Spread Shot</div>
        <div class="help-item">🌶️ <b class="red">SPICY:</b> Damage Boost (10s)</div>
      </div>

      <div class="help-section">
        <h3 class="section-title red">ENEMIES</h3>
        <div class="help-item">🤖 <b>ROBOTS:</b> Standard Homing</div>
        <div class="help-item">🦇 <b>BATS:</b> Fast &amp; Flying</div>
        <div class="help-item">🥷 <b>NINJA:</b> Shoots Shurikens (Lv3+)</div>
        <div class="help-item">🐁 <b>MOUSER:</b> Fast Swarm (Lv4+)</div>
        <div class="help-item">👺 <b>FOOT CLAN:</b> Dash Attack (Lv5+)</div>
        <div class="help-item">🛢️ <b>BARRELS:</b> Shoot to Explode!</div>
        <div class="help-item">🐀 <b>RAT KING:</b> Boss (Every 5th Level)</div>
      </div>
    </div>
    <UButton class="btn-neon primary" @click="game.screen.value = 'menu'">BACK</UButton>
  </div>
</template>

<style scoped>
</style>
