export type Trimester = 'First' | 'Second' | 'Third'

export type PregnancySnapshot = {
  weeks: number
  trimester: Trimester
  dueDateISO: string
  dueDateLabel: string
  progressPercent: number
  weeksLeft: number
}

const TOTAL_WEEKS = 40
const DAY_IN_MS = 24 * 60 * 60 * 1000
const WEEK_IN_MS = 7 * DAY_IN_MS

const clamp = (value: number, min: number, max: number) => {
  return Math.min(max, Math.max(min, value))
}

const getTrimester = (weeks: number): Trimester => {
  if (weeks <= 12) {
    return 'First'
  }

  if (weeks <= 26) {
    return 'Second'
  }

  return 'Third'
}

const toISODate = (date: Date) => {
  return date.toISOString().slice(0, 10)
}

const toLongDate = (date: Date) => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export const calculatePregnancySnapshot = (lmpDateISO: string, today = new Date()): PregnancySnapshot => {
  const lmpDate = new Date(`${lmpDateISO}T00:00:00`)
  const elapsed = today.getTime() - lmpDate.getTime()
  const rawWeeks = Math.floor(elapsed / WEEK_IN_MS)
  const weeks = clamp(Number.isFinite(rawWeeks) ? rawWeeks : 0, 0, TOTAL_WEEKS)

  const dueDate = new Date(lmpDate)
  dueDate.setDate(dueDate.getDate() + 280)

  const progressPercent = clamp(Math.round((weeks / TOTAL_WEEKS) * 100), 0, 100)
  const weeksLeft = clamp(TOTAL_WEEKS - weeks, 0, TOTAL_WEEKS)

  return {
    weeks,
    trimester: getTrimester(weeks),
    dueDateISO: toISODate(dueDate),
    dueDateLabel: toLongDate(dueDate),
    progressPercent,
    weeksLeft,
  }
}

export const weeklyGuidance: Record<number, string[]> = {
  1: ['Start taking folic acid', 'Track your cycle', 'Consult a doctor'],
  2: ['Stay hydrated', 'Eat small meals', 'Avoid stress'],
  3: ['Mild symptoms may begin', 'Rest well', 'Light exercise'],
  4: ['Implantation may occur', 'Avoid heavy work'],
  5: ['Nausea may start', 'Eat small frequent meals'],
  6: ['Fatigue is normal', 'Increase iron intake'],
  7: ['Hormonal changes continue', 'Stay calm'],
  8: ['First ultrasound soon', 'Take vitamins'],
  9: ['Baby growth begins', 'Healthy diet important'],
  10: ['Avoid junk food', 'Stay active'],
  11: ['Hormones stabilize', 'Routine checkup'],
  12: ['End of trimester 1', 'Celebrate milestone 🎉'],

  13: ['Energy increases', 'Balanced diet'],
  14: ['Second trimester begins', 'Light exercise'],
  15: ['Baby movement soon', 'Stay hydrated'],
  16: ['Mid pregnancy scan', 'Track weight'],
  17: ['Calcium needed', 'Healthy snacks'],
  18: ['Baby kicks start', 'Relax'],
  19: ['Monitor health', 'Doctor visit'],
  20: ['Halfway there 🎉', 'Ultrasound'],
  21: ['Sleep properly', 'Comfort care'],
  22: ['Stretching helps', 'Stay active'],
  23: ['Baby growth fast', 'Nutrition important'],
  24: ['Monitor sugar levels', 'Stay relaxed'],
  25: ['Weight gain normal', 'Exercise'],
  26: ['End of trimester 2', 'Prepare ahead'],

  27: ['Third trimester begins', 'More rest'],
  28: ['Baby movement strong', 'Track kicks'],
  29: ['Avoid stress', 'Eat healthy'],
  30: ['Back pain possible', 'Proper posture'],
  31: ['Sleep difficulty', 'Use pillows'],
  32: ['Doctor visits frequent', 'Stay calm'],
  33: ['Prepare hospital bag', 'Plan delivery'],
  34: ['Baby position matters', 'Consult doctor'],
  35: ['Final growth stage', 'Rest more'],
  36: ['Almost there', 'Stay ready'],
  37: ['Full term near', 'Watch symptoms'],
  38: ['Labor anytime', 'Stay prepared'],
  39: ['Final days', 'Relax'],
  40: ['Delivery week 🎉', 'Stay calm & ready'],
}