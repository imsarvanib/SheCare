export const predictNextCycle = (lastCycleDate: string, cycleLength = 28) => {
  const baseDate = new Date(lastCycleDate)
  baseDate.setDate(baseDate.getDate() + cycleLength)
  return baseDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
