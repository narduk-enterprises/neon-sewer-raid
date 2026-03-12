<script setup lang="ts">
const game = inject('game') as ReturnType<typeof useGameEngine>
</script>

<template>
  <div class="screen-overlay">
    <h1 class="settings-title">⚙️ SETTINGS</h1>

    <div class="setting-row">
      <span>Left Handed</span>
      <UButton class="toggle" :class="{ on: game.leftHanded.value }" @click="game.toggleLeftHanded()">
        <div class="toggle-knob" />
      </UButton>
    </div>

    <div class="setting-row">
      <span>Music</span>
      <UButton class="toggle" :class="{ on: game.audio.musicEnabled.value }" @click="game.audio.toggleMusic()">
        <div class="toggle-knob" />
      </UButton>
    </div>

    <div class="setting-row">
      <span>SFX</span>
      <UButton class="toggle" :class="{ on: game.audio.sfxEnabled.value }" @click="game.audio.toggleSfx()">
        <div class="toggle-knob" />
      </UButton>
    </div>

    <!-- Enhancement #8: Auto-fire toggle -->
    <div class="setting-row">
      <span>Auto-Fire</span>
      <UButton class="toggle" :class="{ on: game.autoFire.value }" @click="game.toggleAutoFire()">
        <div class="toggle-knob" />
      </UButton>
    </div>

    <div class="setting-row">
      <span>Sensitivity</span>
      <USlider
        :min="0.5" :max="2.0" :step="0.1"
        :model-value="game.sensitivity.value"
        @update:model-value="game.setSensitivity($event)"
      />
    </div>
    <div class="sens-value">{{ game.sensitivity.value.toFixed(1) }}x</div>

    <UButton class="btn-neon primary" @click="game.screen.value = 'menu'" style="margin-top: 16px">DONE</UButton>
  </div>
</template>

<style scoped>
.screen-overlay {
  position: absolute; inset: 0;
  background: rgba(5,5,16,0.96);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  z-index: 210; padding: 20px;
}

.settings-title {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(1.5rem, 5vw, 2rem);
  color: var(--nsr-green);
  text-shadow: 0 0 10px var(--nsr-green);
  margin-bottom: 20px;
}

.setting-row {
  width: 100%; max-width: 300px;
  display: flex; justify-content: space-between;
  align-items: center; margin: 10px 0;
  font-family: 'Orbitron', sans-serif;
  font-size: 0.9rem; color: white;
}

.toggle {
  position: relative; width: 56px; height: 28px;
  background: #333; border-radius: 14px;
  cursor: pointer; border: 1px solid #555;
  padding: 0; transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
}
.toggle.on { background: var(--nsr-green); border-color: var(--nsr-green); box-shadow: 0 0 10px var(--nsr-green); }
.toggle-knob {
  position: absolute; top: 2px; left: 2px;
  width: 22px; height: 22px;
  background: white; border-radius: 50%;
  transition: left 0.2s;
}
.toggle.on .toggle-knob { left: 30px; }

input[type="range"] { width: 130px; accent-color: var(--nsr-green); }
.sens-value { font-family: 'Orbitron', sans-serif; font-size: 0.7rem; opacity: 0.6; color: white; }
</style>
