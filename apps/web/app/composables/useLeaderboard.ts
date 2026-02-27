/**
 * useLeaderboard — Top-5 localStorage score persistence
 */

export interface ScoreEntry {
  score: number
  level: number
  date: number
}

const STORAGE_KEY = 'nsr_scores'
const MAX_ENTRIES = 5

export function useLeaderboard() {
  const scores = ref<ScoreEntry[]>(loadScores())

  function loadScores(): ScoreEntry[] {
    if (import.meta.client) {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      } catch {
        return []
      }
    }
    return []
  }

  function submitScore(score: number, level: number): number {
    const entry: ScoreEntry = { score, level, date: Date.now() }
    const all = [...scores.value, entry]
    all.sort((a, b) => b.score - a.score)
    const top = all.slice(0, MAX_ENTRIES)
    scores.value = top
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(top))
    }
    // Return rank (-1 if not in top 5)
    return top.findIndex(s => s.score === score && s.date === entry.date)
  }

  const highScore = computed(() => scores.value[0]?.score ?? 0)

  return {
    scores: readonly(scores),
    highScore,
    submitScore,
  }
}
