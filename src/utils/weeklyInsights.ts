export type WeeklyInsightsInput = {
  moodScores: number[]
  cycleLengths: number[]
  reminderTaken: boolean[]
}

export type WeeklyInsight = {
  id: 'mood' | 'cycle' | 'medicine'
  icon: string
  text: string
}

const average = (values: number[]) => {
  if (values.length === 0) {
    return 0
  }

  const total = values.reduce((sum, value) => sum + value, 0)
  return total / values.length
}

const isCycleStable = (cycleLengths: number[]) => {
  if (cycleLengths.length <= 1) {
    return true
  }

  const minLength = Math.min(...cycleLengths)
  const maxLength = Math.max(...cycleLengths)
  return maxLength - minLength <= 2
}

export const generateWeeklyInsights = (input: WeeklyInsightsInput): WeeklyInsight[] => {
  const midpoint = Math.ceil(input.moodScores.length / 2)
  const earlierMood = average(input.moodScores.slice(0, midpoint))
  const recentMood = average(input.moodScores.slice(midpoint))
  const moodImproved = recentMood >= earlierMood

  const stableCycle = isCycleStable(input.cycleLengths)

  const reminderCount = input.reminderTaken.length
  const takenCount = input.reminderTaken.filter(Boolean).length
  const adherenceRate = reminderCount === 0 ? 0 : takenCount / reminderCount
  const consistentRoutine = adherenceRate >= 0.75

  return [
    {
      id: 'mood',
      icon: '🌸',
      text: moodImproved ? 'Your mood improved this week.' : 'Your mood is finding a steadier rhythm this week.',
    },
    {
      id: 'cycle',
      icon: '📈',
      text: stableCycle ? 'Cycle pattern is stable.' : 'Cycle pattern shifted slightly but stays on track.',
    },
    {
      id: 'medicine',
      icon: '💊',
      text: consistentRoutine
        ? "Medicine adherence is consistent."
        : "You're building consistency with your routine.",
    },
  ]
}