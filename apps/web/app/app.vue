<script setup lang="ts">
</script>

<template>
  <UApp>
    <NuxtPage />
  </UApp>
</template>

<style>
/* Neon Sewer Raid — Core variables and global styles */
:root {
  --nsr-green: #00ff88;
  --nsr-orange: #ff6b00;
  --nsr-purple: #bc13fe;
  --nsr-red: #ff003c;
  --nsr-yellow: #ffdd00;
  --nsr-bg: #050510;
}

@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
  touch-action: none;
  user-select: none;
}

html, body {
  background: var(--nsr-bg);
  height: 100dvh;
  width: 100vw;
  font-family: 'Orbitron', sans-serif;
  color: white;
  overflow: hidden;
  padding: env(safe-area-inset-top) 0 env(safe-area-inset-bottom) 0;
}

/* Shared button styles */
.btn-neon {
  font-family: 'Orbitron', sans-serif;
  border: none;
  border-radius: 50px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.1s;
  display: inline-block;
}

.btn-neon.primary {
  background: var(--nsr-green);
  color: var(--nsr-bg);
  padding: 12px 36px;
  font-size: clamp(1rem, 3vw, 1.3rem);
  box-shadow: 0 0 20px var(--nsr-green), inset 0 0 10px rgba(255,255,255,0.3);
}

.btn-neon.secondary {
  background: transparent;
  border: 2px solid var(--nsr-green);
  color: var(--nsr-green);
  padding: 8px 20px;
  font-size: clamp(0.75rem, 2.5vw, 0.95rem);
  box-shadow: 0 0 10px var(--nsr-green);
}

.btn-neon:active {
  transform: scale(0.95);
  box-shadow: 0 0 8px var(--nsr-green);
}

/* Remove default Nuxt UI body styling conflicts */
body {
  --ui-bg: var(--nsr-bg) !important;
}
</style>
