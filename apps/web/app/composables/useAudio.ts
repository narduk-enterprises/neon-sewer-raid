/**
 * useAudio — Web Audio API synthesizer + SFX engine
 * Procedurally generates chiptune music from frequency patterns
 */

interface TrackData {
  tempo: number
  bass: number[]
  lead: number[]
  drum: number[]
}

const TRACKS: Record<string, TrackData> = {
  menu: {
    tempo: 100,
    bass: [220, 0, 220, 0, 196, 0, 196, 0],
    lead: [440, 523, 659, 523, 392, 493, 587, 493],
    drum: [0, 0, 0, 0, 0, 0, 0, 0],
  },
  'game-1': {
    tempo: 110,
    bass: [55, 0, 55, 0, 55, 0, 65, 73],
    lead: [0, 440, 0, 440, 0, 440, 880, 0],
    drum: [1, 0, 1, 0, 1, 0, 1, 1],
  },
  'game-2': {
    tempo: 140,
    bass: [110, 110, 0, 110, 220, 110, 0, 110],
    lead: [880, 0, 880, 0, 659, 659, 0, 987],
    drum: [1, 1, 1, 1, 1, 1, 1, 1],
  },
  'game-3': {
    tempo: 180,
    bass: [55, 110, 55, 110, 55, 110, 55, 110],
    lead: [440, 554, 659, 880, 0, 880, 659, 554],
    drum: [1, 1, 1, 1, 1, 1, 1, 1],
  },
  technodrome: {
    tempo: 150,
    bass: [36, 36, 0, 36, 41, 41, 0, 41],
    lead: [554, 0, 523, 0, 554, 659, 523, 0],
    drum: [1, 0, 1, 1, 1, 0, 1, 1],
  },
  boss: {
    tempo: 200,
    bass: [55, 55, 55, 55, 49, 49, 49, 49],
    lead: [880, 830, 880, 830, 0, 0, 1174, 1174],
    drum: [1, 1, 1, 1, 1, 1, 1, 1],
  },
  mutagen: {
    tempo: 220,
    bass: [110, 55, 110, 55, 220, 110, 55, 110],
    lead: [880, 1174, 880, 1318, 880, 1174, 1567, 1760],
    drum: [1, 1, 1, 1, 1, 1, 1, 1],
  },
  gameover: {
    tempo: 80,
    bass: [110, 103, 98, 92, 87, 82, 0, 0],
    lead: [0, 0, 0, 0, 0, 0, 0, 0],
    drum: [0, 0, 0, 0, 0, 0, 0, 0],
  },
}

export function useAudio() {
  const musicEnabled = ref(true)
  const sfxEnabled = ref(true)

  if (import.meta.client) {
    musicEnabled.value = localStorage.getItem('nsr_music') !== 'false'
    sfxEnabled.value = localStorage.getItem('nsr_sfx') !== 'false'
  }

  let ctx: AudioContext | null = null
  const sounds: Record<string, AudioBuffer> = {}
  let currentTrack = ''
  let nextNoteTime = 0
  let animFrameId: number | null = null
  let tempo = 120
  let noteIndex = 0

  function initCtx() {
    if (ctx) return
    if (import.meta.client) {
      ctx = new (window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext!)()
    }
    // Preload SFX
    const sfxFiles = ['cowabunga', 'pizza', 'radical', 'attack']
    for (const name of sfxFiles) {
      fetch(`/audio/${name}.mp3`)
        .then(r => r.arrayBuffer())
        .then(b => ctx!.decodeAudioData(b))
        .then(d => { sounds[name] = d })
        .catch(() => {})
    }
  }

  function playSfx(name: string) {
    if (!sfxEnabled.value || !sounds[name] || !ctx) return
    if (ctx.state === 'suspended') ctx.resume()
    const src = ctx.createBufferSource()
    src.buffer = sounds[name]!
    // Add some gain control
    const gain = ctx.createGain()
    gain.gain.value = 0.6
    src.connect(gain)
    gain.connect(ctx.destination)
    src.start(0)
  }

  function playTrack(type: string, level = 1) {
    if (!musicEnabled.value) return
    let trackId = type
    if (type === 'game') {
      if (level % 5 === 0) trackId = 'boss'
      else if (level > 5) trackId = 'technodrome'
      else if (level >= 3) trackId = 'game-3'
      else if (level === 2) trackId = 'game-2'
      else trackId = 'game-1'
    }
    if (currentTrack === trackId) return
    stopMusic()

    if (!ctx) initCtx()
    if (ctx?.state === 'suspended') ctx.resume()

    currentTrack = trackId
    noteIndex = 0
    const trackData = TRACKS[trackId] || TRACKS.menu
    tempo = trackData!.tempo
    nextNoteTime = ctx!.currentTime
    scheduleLoop()
  }

  function scheduleLoop() {
    if (!currentTrack || !ctx) return
    const secondsPerBeat = 60.0 / tempo
    const lookahead = 0.1

    while (nextNoteTime < ctx.currentTime + lookahead) {
      playStep(nextNoteTime)
      nextNoteTime += secondsPerBeat * 0.25
      noteIndex++
    }
    animFrameId = requestAnimationFrame(scheduleLoop)
  }

  function playStep(time: number) {
    if (!ctx) return
    const track = TRACKS[currentTrack]
    if (!track) return
    const i = noteIndex % 8

    // Bass (Square wave)
    if (track.bass[i]! > 0) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.setValueAtTime(track.bass[i]!, time)
      gain.gain.setValueAtTime(0.15, time)
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(time)
      osc.stop(time + 0.15)
    }

    // Lead (Sawtooth)
    if (track.lead[i]! > 0) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(track.lead[i]!, time)
      gain.gain.setValueAtTime(0.08, time)
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.12)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(time)
      osc.stop(time + 0.15)
    }

    // Drums (Noise burst)
    if (track.drum[i]! > 0) {
      const bufferSize = ctx.sampleRate * 0.05
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let j = 0; j < bufferSize; j++) {
        data[j] = (Math.random() * 2 - 1) * Math.max(0, 1 - j / bufferSize)
      }
      const noise = ctx.createBufferSource()
      noise.buffer = buffer
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.3, time)
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05)
      // Highpass for snare-like sound
      const filter = ctx.createBiquadFilter()
      filter.type = 'highpass'
      filter.frequency.value = i % 2 === 0 ? 100 : 3000 // kick vs snare
      noise.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)
      noise.start(time)
    }
  }

  function stopMusic() {
    if (animFrameId !== null) cancelAnimationFrame(animFrameId)
    animFrameId = null
    currentTrack = ''
  }

  function resumeCtx() {
    if (ctx?.state === 'suspended') ctx.resume()
  }

  function suspendCtx() {
    if (ctx?.state === 'running') ctx.suspend()
  }

  function toggleMusic() {
    musicEnabled.value = !musicEnabled.value
    if (import.meta.client) {
      localStorage.setItem('nsr_music', String(musicEnabled.value))
    }
    if (!musicEnabled.value) stopMusic()
  }

  function toggleSfx() {
    sfxEnabled.value = !sfxEnabled.value
    if (import.meta.client) {
      localStorage.setItem('nsr_sfx', String(sfxEnabled.value))
    }
  }

  return {
    musicEnabled: readonly(musicEnabled),
    sfxEnabled: readonly(sfxEnabled),
    initCtx,
    playSfx,
    playTrack,
    stopMusic,
    resumeCtx,
    suspendCtx,
    toggleMusic,
    toggleSfx,
  }
}
