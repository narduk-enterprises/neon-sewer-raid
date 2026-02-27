<script setup lang="ts">
const game = inject('game') as ReturnType<typeof useGameEngine>

const touchpadRef = ref<HTMLElement | null>(null)
const joyActive = ref(false)
const joyX = ref(0)
const joyY = ref(0)
const knobOffset = reactive({ x: 0, y: 0 })

let joyStartX = 0
let joyStartY = 0

function onTouchStart(e: TouchEvent) {
  e.preventDefault()
  if (game.screen.value !== 'playing') return
  const touch = e.changedTouches[0]!
  const rect = touchpadRef.value!.getBoundingClientRect()

  joyActive.value = true
  joyStartX = touch.clientX
  joyStartY = touch.clientY
  joyX.value = touch.clientX - rect.left
  joyY.value = touch.clientY - rect.top
  knobOffset.x = 0
  knobOffset.y = 0
}

function onTouchMove(e: TouchEvent) {
  e.preventDefault()
  if (!joyActive.value || game.screen.value !== 'playing') return

  const touch = e.changedTouches[0]!
  const dx = touch.clientX - joyStartX
  const dy = touch.clientY - joyStartY
  const dist = Math.sqrt(dx * dx + dy * dy)
  const maxDist = 40
  const clampDist = Math.min(dist, maxDist)
  const angle = Math.atan2(dy, dx)

  knobOffset.x = Math.cos(angle) * clampDist
  knobOffset.y = Math.sin(angle) * clampDist

  const magnitude = clampDist / maxDist
  game.setInputVelocity(Math.cos(angle) * magnitude, Math.sin(angle) * magnitude)
}

function onTouchEnd(e: TouchEvent) {
  e.preventDefault()
  joyActive.value = false
  knobOffset.x = 0
  knobOffset.y = 0
  game.setInputVelocity(0, 0)
}

// Enhancement #8: Auto-fire (hold attack button)
function onAttackStart(e: Event) {
  e.preventDefault()
  game.requestAttack()
  game.setAttackHeld(true)
}

function onAttackEnd(e: Event) {
  e.preventDefault()
  game.setAttackHeld(false)
}
</script>

<template>
  <div
    class="control-bar"
    :class="{ 'left-handed': game.leftHanded.value }"
  >
    <!-- Joystick Pad -->
    <div
      ref="touchpadRef"
      class="touch-pad"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @touchcancel="onTouchEnd"
    >
      <div v-if="joyActive" class="joy-base" :style="{ left: joyX + 'px', top: joyY + 'px' }" />
      <div v-if="joyActive" class="joy-knob" :style="{ left: joyX + knobOffset.x + 'px', top: joyY + knobOffset.y + 'px' }" />
    </div>

    <!-- Right side buttons -->
    <div class="action-buttons">
      <!-- Enhancement #6: Dash button -->
      <UButton
        class="btn-dash"
        @touchstart.prevent="game.triggerDash()"
        @click.prevent="game.triggerDash()"
      >
        💨
      </UButton>

      <!-- Attack Button (hold for auto-fire) -->
      <UButton
        class="btn-attack"
        @touchstart="onAttackStart"
        @touchend="onAttackEnd"
        @touchcancel="onAttackEnd"
        @mousedown="onAttackStart"
        @mouseup="onAttackEnd"
      >
        ⚔️
      </UButton>
    </div>
  </div>
</template>

<style scoped>
/* Styles moved to main.css to comply with atx/no-style-block-layout */
</style>
