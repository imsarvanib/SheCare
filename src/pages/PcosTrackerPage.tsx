import { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PageTransition } from '../components/common/PageTransition'
import { SectionHeader } from '../components/common/SectionHeader'
import { useAuth } from '../hooks/useAuth'
import { API_URL } from '../config/api'

type Frequency = 'never' | 'rarely' | 'sometimes' | 'often' | 'daily'
type Intake = 'low' | 'moderate' | 'high'
type Stress = 'low' | 'moderate' | 'high'
type Exercise = 'none' | '1-2' | '3-5' | '6+'
type Water = '<1.5L' | '1.5-2.5L' | '>2.5L'
type MissedPeriods = 'none' | 'occasional' | 'frequent'
type PeriodRegularity = 'regular' | 'irregular'

type FormState = {
  age: string
  heightCm: string
  weightKg: string
  periodRegularity: PeriodRegularity
  cycleLength: string
  periodDuration: string
  missedPeriods: MissedPeriods
  heavyBleeding: boolean
  painfulPeriods: boolean
  acne: boolean
  hairFall: boolean
  facialHairGrowth: boolean
  weightGain: boolean
  darkNeckPatches: boolean
  moodSwings: boolean
  fatigue: boolean
  bloating: boolean
  sugarCravings: boolean
  pelvicPain: boolean
  sleepHours: string
  stressLevel: Stress
  exerciseFrequency: Exercise
  waterIntake: Water
  junkFoodFrequency: Frequency
  sugarIntake: Frequency
  friedFoodIntake: Frequency
  proteinIntake: Intake
  fiberIntake: Intake
  familyHistoryPcos: boolean
  familyHistoryDiabetes: boolean
  familyHistoryThyroid: boolean
  thyroidIssues: boolean
  insulinResistance: boolean
  previousPcosDiagnosis: boolean
}

type ValidationErrors = Partial<Record<keyof FormState, string>>


type RiskFactor = {
  label: string
  points: number
}

type SmartWarning = {
  icon: string
  message: string
}

type AssessmentResult = {
  score: number
  possibilityLevel: string
  severityLevel: string
  bmiValue: number | null
  bmiCategory: string
  mainRiskFactors: string[]
  explanation: string
  dietPlan: string[]
  lifestylePlan: string[]
  doctorRecommendation: string[]
  createdAt?: string
}

const initialForm: FormState = {
  age: '',
  heightCm: '',
  weightKg: '',
  periodRegularity: 'regular',
  cycleLength: '',
  periodDuration: '',
  missedPeriods: 'none',
  heavyBleeding: false,
  painfulPeriods: false,
  acne: false,
  hairFall: false,
  facialHairGrowth: false,
  weightGain: false,
  darkNeckPatches: false,
  moodSwings: false,
  fatigue: false,
  bloating: false,
  sugarCravings: false,
  pelvicPain: false,
  sleepHours: '',
  stressLevel: 'moderate',
  exerciseFrequency: '1-2',
  waterIntake: '1.5-2.5L',
  junkFoodFrequency: 'sometimes',
  sugarIntake: 'sometimes',
  friedFoodIntake: 'sometimes',
  proteinIntake: 'moderate',
  fiberIntake: 'moderate',
  familyHistoryPcos: false,
  familyHistoryDiabetes: false,
  familyHistoryThyroid: false,
  thyroidIssues: false,
  insulinResistance: false,
  previousPcosDiagnosis: false,
}

const parseNumber = (value: string) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const getBmiValue = (heightCm: string, weightKg: string) => {
  const height = parseNumber(heightCm)
  const weight = parseNumber(weightKg)
  if (!height || !weight || height <= 0 || weight <= 0) return null
  const heightM = height / 100
  return Number((weight / (heightM * heightM)).toFixed(1))
}

const getBmiCategory = (bmi: number | null) => {
  if (!bmi) return 'Not available'
  if (bmi < 18.5) return 'Underweight'
  if (bmi < 25) return 'Normal'
  if (bmi < 30) return 'Overweight'
  return 'Obese'
}

const getRiskBand = (score: number) => {
  if (score <= 6) {
    return { possibilityLevel: 'Low Risk', severityLevel: 'Mild' }
  }
  if (score <= 14) {
    return { possibilityLevel: 'Moderate Risk', severityLevel: 'Moderate' }
  }
  if (score <= 25) {
    return { possibilityLevel: 'High Risk', severityLevel: 'High' }
  }
  return { possibilityLevel: 'Severe Risk', severityLevel: 'Severe' }
}

const validateForm = (form: FormState): ValidationErrors => {
  const errors: ValidationErrors = {}
  const age = parseNumber(form.age)
  const height = parseNumber(form.heightCm)
  const weight = parseNumber(form.weightKg)
  const cycleLength = parseNumber(form.cycleLength)
  const periodDuration = parseNumber(form.periodDuration)
  const sleepHours = parseNumber(form.sleepHours)

  if (form.age && (age === null || age < 10 || age > 60)) {
    errors.age = 'Age must be between 10 and 60'
  }

  if (form.heightCm && (height === null || height < 100 || height > 220)) {
    errors.heightCm = 'Height must be between 100 and 220 cm'
  }

  if (form.weightKg && (weight === null || weight < 25 || weight > 200)) {
    errors.weightKg = 'Weight must be between 25 and 200 kg'
  }

  if (form.cycleLength && (cycleLength === null || cycleLength < 21 || cycleLength > 60)) {
    errors.cycleLength = 'Cycle length must be between 21 and 60 days'
  }

  if (form.periodDuration && (periodDuration === null || periodDuration < 1 || periodDuration > 10)) {
    errors.periodDuration = 'Period duration must be between 1 and 10 days'
  }

  if (form.sleepHours && (sleepHours === null || sleepHours < 0 || sleepHours > 14)) {
    errors.sleepHours = 'Sleep hours must be between 0 and 14'
  }

  return errors
}

const getSmartWarnings = (form: FormState): SmartWarning[] => {
  const warnings: SmartWarning[] = []
  const cycleLength = parseNumber(form.cycleLength)
  const periodDuration = parseNumber(form.periodDuration)
  const bmi = getBmiValue(form.heightCm, form.weightKg)

  if (cycleLength && cycleLength > 35) {
    warnings.push({ icon: '⚠️', message: 'Irregular ovulation detected (cycle > 35 days)' })
  }

  if (periodDuration && periodDuration > 7) {
    warnings.push({ icon: '⚠️', message: 'Heavy/long bleeding pattern detected (> 7 days)' })
  }

  if (periodDuration && periodDuration < 2) {
    warnings.push({ icon: '⚠️', message: 'Very short periods may indicate hormonal imbalance' })
  }

  if (bmi && bmi > 25) {
    warnings.push({ icon: '⚠️', message: 'Weight-related hormonal risk detected (BMI > 25)' })
  }

  if (form.sugarCravings && form.fatigue) {
    warnings.push({ icon: '⚠️', message: 'Possible insulin resistance pattern (cravings + fatigue)' })
  }

  if (form.acne && form.facialHairGrowth) {
    warnings.push({ icon: '⚠️', message: 'Androgen imbalance indicators detected' })
  }

  return warnings
}

export const PcosTrackerPage = () => {
  const [form, setForm] = useState<FormState>(initialForm)
  const [result, setResult] = useState<AssessmentResult | null>(null)
  const [history, setHistory] = useState<Array<any>>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [loadingSave, setLoadingSave] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const { user } = useAuth()
  const [showForm, setShowForm] = useState(true)

  const bmiValue = useMemo(() => getBmiValue(form.heightCm, form.weightKg), [form.heightCm, form.weightKg])
  const formErrors = useMemo(() => validateForm(form), [form])
  const smartWarnings = useMemo(() => getSmartWarnings(form), [form])
  const hasErrors = Object.keys(formErrors).length > 0
  const isFormEmpty =
    !form.age &&
    !form.heightCm &&
    !form.weightKg &&
    !form.cycleLength &&
    !form.periodDuration &&
    !form.sleepHours &&
    !Object.values(form).some((val) => (typeof val === 'boolean' ? val : false))

  const onBooleanChange = (key: keyof FormState) => {
    setForm((prev) => ({ ...prev, [key]: !prev[key as keyof FormState] }))
  }

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    // Validate before submit
    const newErrors = validateForm(form)
    if (Object.keys(newErrors).length > 0) {
      return
    }

    const riskFactors: RiskFactor[] = []
    const cycleLength = parseNumber(form.cycleLength)
    const periodDuration = parseNumber(form.periodDuration)
    const sleepHours = parseNumber(form.sleepHours)

    const addFactor = (condition: boolean, label: string, points: number) => {
      if (!condition) return
      riskFactors.push({ label, points })
    }

    // BMI-based scoring
    if (bmiValue !== null) {
      if (bmiValue >= 30) addFactor(true, 'High BMI (obesity)', 6)
      else if (bmiValue >= 25) addFactor(true, 'High BMI (overweight)', 4)
    }

    // Cycle-based scoring
    if (cycleLength !== null) {
      if (cycleLength > 35) addFactor(true, 'Long cycle length (> 35 days)', 3)
      else if (cycleLength < 21) addFactor(true, 'Short cycle length (< 21 days)', 2)
    }
    addFactor(form.periodRegularity === 'irregular', 'Irregular period pattern', 3)
    addFactor(form.missedPeriods === 'occasional', 'Occasional missed periods', 2)
    addFactor(form.missedPeriods === 'frequent', 'Frequent missed periods', 4)

    // Period duration-based scoring
    if (periodDuration !== null) {
      if (periodDuration > 7) addFactor(true, 'Heavy/prolonged bleeding (> 7 days)', 2)
      else if (periodDuration < 2) addFactor(true, 'Very short period (< 2 days)', 2)
    }

    // Symptom-based scoring
    addFactor(form.acne, 'Persistent acne', 2)
    addFactor(form.hairFall, 'Hair fall/thinning', 2)
    addFactor(form.facialHairGrowth, 'Facial hair growth', 3)
    addFactor(form.weightGain, 'Unexplained weight gain', 3)
    addFactor(form.darkNeckPatches, 'Dark neck patches', 3)
    addFactor(form.moodSwings, 'Mood swings', 1)
    addFactor(form.fatigue, 'Fatigue/low energy', 1)
    addFactor(form.bloating, 'Frequent bloating', 1)
    addFactor(form.sugarCravings, 'Sugar cravings', 2)
    addFactor(form.pelvicPain, 'Pelvic pain', 2)
    addFactor(form.heavyBleeding, 'Heavy bleeding', 1)
    addFactor(form.painfulPeriods, 'Painful periods', 1)

    // Lifestyle-based scoring
    addFactor(form.stressLevel === 'high', 'High stress level', 2)
    addFactor(form.stressLevel === 'moderate', 'Moderate stress level', 1)
    addFactor(form.exerciseFrequency === 'none', 'No regular exercise', 2)
    addFactor(form.exerciseFrequency === '1-2', 'Low exercise frequency', 1)
    addFactor(form.waterIntake === '<1.5L', 'Low water intake', 1)
    addFactor(form.junkFoodFrequency === 'often' || form.junkFoodFrequency === 'daily', 'High junk food', 2)
    addFactor(form.junkFoodFrequency === 'sometimes', 'Moderate junk food', 1)
    addFactor(form.sugarIntake === 'often' || form.sugarIntake === 'daily', 'High sugar intake', 2)
    addFactor(form.sugarIntake === 'sometimes', 'Moderate sugar intake', 1)
    addFactor(form.friedFoodIntake === 'often' || form.friedFoodIntake === 'daily', 'High fried food', 2)
    addFactor(form.friedFoodIntake === 'sometimes', 'Moderate fried food', 1)
    addFactor(form.proteinIntake === 'low', 'Low protein intake', 1)
    addFactor(form.fiberIntake === 'low', 'Low fiber intake', 1)

    // Medical & family history-based scoring
    addFactor(form.familyHistoryPcos, 'Family history of PCOS', 3)
    addFactor(form.familyHistoryDiabetes, 'Family history of diabetes', 3)
    addFactor(form.familyHistoryThyroid, 'Family history of thyroid', 3)
    addFactor(form.thyroidIssues, 'Existing thyroid issues', 3)
    addFactor(form.insulinResistance, 'Known insulin resistance', 4)
    addFactor(form.previousPcosDiagnosis, 'Previous PCOS diagnosis', 5)

    const score = riskFactors.reduce((sum, factor) => sum + factor.points, 0)
    const riskBand = getRiskBand(score)

    const topRiskFactors = [...riskFactors]
      .sort((a, b) => b.points - a.points)
      .slice(0, 6)
      .map((factor) => factor.label)

    const dietPlan = [
      'Follow the plate rule: 50% non-starchy vegetables, 25% lean protein, 25% whole grain carbs.',
      'Include protein + fiber in your first meal to stabilize blood sugar.',
      'Prefer whole foods over packaged snacks (≥80% of the week).',
    ]

    if (form.sugarIntake === 'often' || form.sugarIntake === 'daily' || form.sugarCravings) {
      dietPlan.push('Adopt a low-sugar, low-GI diet: oats, lentils, beans, nuts, seeds, unsweetened fruit.')
    }
    if (bmiValue && bmiValue >= 25) {
      dietPlan.push('Implement portion control and calorie deficit for sustainable weight management.')
    }
    if (form.proteinIntake === 'low') {
      dietPlan.push('Increase protein: eggs, paneer/tofu, fish, curd, legumes, nuts.')
    }
    if (form.fiberIntake === 'low') {
      dietPlan.push('Boost fiber to 25–35g/day: vegetables, whole grains, beans, chia/flax seeds.')
    }

    const lifestylePlan = [
      'Aim for 150+ minutes of weekly activity (mix cardio & strength training).',
      'Practice daily stress management: breathing, meditation, journaling, walks.',
      'Track menstrual cycle and symptoms monthly to spot patterns.',
    ]

    if (form.fatigue || (sleepHours && sleepHours < 7)) {
      lifestylePlan.push('Prioritize sleep hygiene: fixed bedtime, dim lights, no late caffeine/screens.')
    }
    if (form.waterIntake === '<1.5L') {
      lifestylePlan.push('Increase hydration to 2–2.5L/day (unless medically restricted).')
    }
    if (form.stressLevel === 'high') {
      lifestylePlan.push('Consider therapy, yoga, or counseling to manage chronic stress.')
    }

    const doctorRecommendation = [
      '⚠️ This is a screening tool, not a diagnosis. Consult a gynecologist/endocrinologist.',
    ]

    if (form.periodRegularity === 'irregular' || form.missedPeriods !== 'none') {
      doctorRecommendation.push('Book a gynecology consult + hormone panel soon due to irregular/missed periods.')
    }
    if (form.acne || form.facialHairGrowth || form.hairFall) {
      doctorRecommendation.push('Hormonal imbalance signs (acne/facial hair/hair loss) need clinical evaluation.')
    }
    if (
      form.familyHistoryPcos ||
      form.familyHistoryDiabetes ||
      form.familyHistoryThyroid ||
      form.thyroidIssues ||
      form.insulinResistance
    ) {
      doctorRecommendation.push('Family/metabolic risk requires medical consultation and lab work.')
    }
    if (riskBand.possibilityLevel === 'High Risk' || riskBand.possibilityLevel === 'Severe Risk') {
      doctorRecommendation.push('Prioritize in-person consultation within 2–4 weeks given your risk level.')
    }

    const explanation = `Your assessment indicates a ${riskBand.possibilityLevel.toLowerCase()} profile for PCOS/PCOD based on menstrual, hormonal, metabolic, and lifestyle factors. This is a screening estimate only—not a medical diagnosis.`

    const resultObj: AssessmentResult = {
      score,
      possibilityLevel: riskBand.possibilityLevel,
      severityLevel: riskBand.severityLevel,
      bmiValue,
      bmiCategory: getBmiCategory(bmiValue),
      mainRiskFactors: topRiskFactors,
      explanation,
      dietPlan,
      lifestylePlan,
      doctorRecommendation,
    }

    // Save to backend if user is present
    const saveAssessment = async () => {
      if (!user?.userId) {
        setResult(resultObj)
        setShowForm(false)
        return
      }

      setLoadingSave(true)
      try {
        const resp = await fetch(`${API_URL}/pcos-assessments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.userId, formData: form, result: resultObj }),
        })
        const data = await resp.json()
        if (data && data.success && data.data) {
          // backend returns saved assessment in data.data
          const saved = data.data
          setResult({ ...(saved.result || resultObj), createdAt: saved.createdAt })
          setShowForm(false)
          // refresh history
          setHistory((prev) => [saved, ...prev])
        } else {
          setResult(resultObj)
        }
      } catch (err) {
        console.error('Failed to save assessment', err)
        setResult(resultObj)
      } finally {
        setLoadingSave(false)
      }
    }

    void saveAssessment()
  }

  const inputClass = (hasError: boolean) =>
    `mt-2 w-full rounded-xl border px-3 py-2 text-sm outline-none transition focus:ring-2 ${
      hasError ? 'border-red-400 focus:ring-red-200' : 'focus:ring-pink-300'
    }`

  const inputStyle = (hasError: boolean) => ({
    borderColor: hasError ? '#f87171' : 'var(--shecare-border)',
    background: hasError ? 'rgba(244, 63, 94, 0.05)' : 'var(--shecare-primary-soft)',
  })

  // Load history for logged-in user
  useEffect(() => {
    const load = async () => {
      if (!user?.userId) return
      setLoadingHistory(true)
      try {
        const resp = await fetch(`${API_URL}/pcos-assessments/${user.userId}`)
        const data = await resp.json()
        if (data && data.success) {
          setHistory(data.data || [])
          if ((data.data || []).length > 0) {
            const latest = data.data[0]
            setResult({ ...(latest.result || {}), createdAt: latest.createdAt })
            setForm(latest.formData || initialForm)
            setShowForm(false)
          }
        }
      } catch (err) {
        console.error('Failed to load PCOS history', err)
      } finally {
        setLoadingHistory(false)
      }
    }

    void load()
  }, [user?.userId])

  return (
    <PageTransition>
      <SectionHeader
        title="PCOS/PCOD Smart Checker"
        subtitle="Comprehensive AI-powered risk assessment with validation and health-based intelligence."
      />
{showForm ? (
      <motion.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="shecare-card rounded-3xl p-6"
      >
        <div className="mb-5">
          <p className="text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--shecare-primary)' }}>
            SheCare Medical Intelligence
          </p>
          <h3 className="text-xl font-semibold" style={{ color: 'var(--shecare-text-strong)' }}>
            Personal Health Assessment Form
          </h3>
          <p className="mt-1 text-sm" style={{ color: 'var(--shecare-muted)' }}>
            All inputs are validated to ensure accuracy. Leave empty any fields you prefer not to answer.
          </p>
        </div>

        {smartWarnings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 space-y-2 rounded-2xl p-4"
            style={{ background: 'rgba(244, 63, 94, 0.08)' }}
          >
            {smartWarnings.map((warning) => (
              <div key={warning.message} className="flex items-start gap-2 text-sm" style={{ color: 'var(--shecare-text)' }}>
                <span className="text-lg">{warning.icon}</span>
                <span>{warning.message}</span>
              </div>
            ))}
          </motion.div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <section>
            <h4 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--shecare-text-strong)' }}>
              Basic Metrics
            </h4>
            <div className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="text-sm" style={{ color: 'var(--shecare-text)' }}>
                  Age (years)
                </label>
                <input
                  type="number"
                  min={10}
                  max={60}
                  value={form.age}
                  onChange={(e) => setForm((prev) => ({ ...prev, age: e.target.value }))}
                  className={inputClass(!!formErrors.age)}
                  style={inputStyle(!!formErrors.age)}
                />
                {formErrors.age && (
                  <p className="mt-1 text-xs text-red-400">{formErrors.age}</p>
                )}
              </div>
              <div>
                <label className="text-sm" style={{ color: 'var(--shecare-text)' }}>
                  Height (cm)
                </label>
                <input
                  type="number"
                  min={100}
                  max={220}
                  value={form.heightCm}
                  onChange={(e) => setForm((prev) => ({ ...prev, heightCm: e.target.value }))}
                  className={inputClass(!!formErrors.heightCm)}
                  style={inputStyle(!!formErrors.heightCm)}
                />
                {formErrors.heightCm && (
                  <p className="mt-1 text-xs text-red-400">{formErrors.heightCm}</p>
                )}
              </div>
              <div>
                <label className="text-sm" style={{ color: 'var(--shecare-text)' }}>
                  Weight (kg)
                </label>
                <input
                  type="number"
                  min={25}
                  max={200}
                  value={form.weightKg}
                  onChange={(e) => setForm((prev) => ({ ...prev, weightKg: e.target.value }))}
                  className={inputClass(!!formErrors.weightKg)}
                  style={inputStyle(!!formErrors.weightKg)}
                />
                {formErrors.weightKg && (
                  <p className="mt-1 text-xs text-red-400">{formErrors.weightKg}</p>
                )}
              </div>
              <div>
                <label className="text-sm" style={{ color: 'var(--shecare-text)' }}>
                  BMI (auto-calculated)
                </label>
                <div
                  className="mt-2 flex h-[42px] items-center rounded-xl border px-3 text-sm font-semibold"
                  style={{ borderColor: 'var(--shecare-border)', background: 'var(--shecare-primary-soft)', color: 'var(--shecare-text-strong)' }}
                >
                  {bmiValue ? `${bmiValue} (${getBmiCategory(bmiValue)})` : 'Enter height & weight'}
                </div>
              </div>
            </div>
          </section>

          <section>
            <h4 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--shecare-text-strong)' }}>
              Menstrual Cycle & Bleeding Pattern
            </h4>
            <div className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <label className="text-sm" style={{ color: 'var(--shecare-text)' }}>
                Period Regularity
                <select
                  value={form.periodRegularity}
                  onChange={(e) => setForm((prev) => ({ ...prev, periodRegularity: e.target.value as PeriodRegularity }))}
                  className={inputClass(false)}
                  style={inputStyle(false)}
                >
                  <option value="regular">Regular</option>
                  <option value="irregular">Irregular</option>
                </select>
              </label>
              <div>
                <label className="text-sm" style={{ color: 'var(--shecare-text)' }}>
                  Cycle Length (days)
                </label>
                <input
                  type="number"
                  min={21}
                  max={60}
                  value={form.cycleLength}
                  onChange={(e) => setForm((prev) => ({ ...prev, cycleLength: e.target.value }))}
                  className={inputClass(!!formErrors.cycleLength)}
                  style={inputStyle(!!formErrors.cycleLength)}
                />
                <p className="mt-1 text-xs" style={{ color: 'var(--shecare-muted)' }}>
                  Days from start of one period to start of next (21–45 normal)
                </p>
                {formErrors.cycleLength && (
                  <p className="mt-1 text-xs text-red-400">{formErrors.cycleLength}</p>
                )}
              </div>
              <div>
                <label className="text-sm" style={{ color: 'var(--shecare-text)' }}>
                  Period Duration (days)
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={form.periodDuration}
                  onChange={(e) => setForm((prev) => ({ ...prev, periodDuration: e.target.value }))}
                  className={inputClass(!!formErrors.periodDuration)}
                  style={inputStyle(!!formErrors.periodDuration)}
                />
                <p className="mt-1 text-xs" style={{ color: 'var(--shecare-muted)' }}>
                  Days of bleeding (typically 3–7 days)
                </p>
                {formErrors.periodDuration && (
                  <p className="mt-1 text-xs text-red-400">{formErrors.periodDuration}</p>
                )}
              </div>
              <label className="text-sm" style={{ color: 'var(--shecare-text)' }}>
                Missed Periods
                <select
                  value={form.missedPeriods}
                  onChange={(e) => setForm((prev) => ({ ...prev, missedPeriods: e.target.value as MissedPeriods }))}
                  className={inputClass(false)}
                  style={inputStyle(false)}
                >
                  <option value="none">None</option>
                  <option value="occasional">Occasional</option>
                  <option value="frequent">Frequent</option>
                </select>
              </label>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm" style={{ borderColor: 'var(--shecare-border)', background: 'var(--shecare-primary-soft)', color: 'var(--shecare-text)' }}>
                <input type="checkbox" checked={form.heavyBleeding} onChange={() => onBooleanChange('heavyBleeding')} />
                Heavy bleeding episodes
              </label>
              <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm" style={{ borderColor: 'var(--shecare-border)', background: 'var(--shecare-primary-soft)', color: 'var(--shecare-text)' }}>
                <input type="checkbox" checked={form.painfulPeriods} onChange={() => onBooleanChange('painfulPeriods')} />
                Painful periods
              </label>
            </div>
          </section>

          <section>
            <h4 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--shecare-text-strong)' }}>
              Hormonal & Body Symptoms
            </h4>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ['acne', 'Persistent acne'],
                ['hairFall', 'Hair fall/thinning'],
                ['facialHairGrowth', 'Facial hair growth'],
                ['weightGain', 'Unexplained weight gain'],
                ['darkNeckPatches', 'Dark neck patches'],
                ['moodSwings', 'Mood swings'],
                ['fatigue', 'Fatigue/low energy'],
                ['bloating', 'Frequent bloating'],
                ['sugarCravings', 'Sugar cravings'],
                ['pelvicPain', 'Pelvic pain'],
              ].map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm"
                  style={{ borderColor: 'var(--shecare-border)', background: 'var(--shecare-primary-soft)', color: 'var(--shecare-text)' }}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(form[key as keyof FormState])}
                    onChange={() => onBooleanChange(key as keyof FormState)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </section>

          <section>
            <h4 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--shecare-text-strong)' }}>
              Lifestyle & Nutrition
            </h4>
            <div className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="text-sm" style={{ color: 'var(--shecare-text)' }}>
                  Sleep (hours/day)
                </label>
                <input
                  type="number"
                  min={0}
                  max={14}
                  value={form.sleepHours}
                  onChange={(e) => setForm((prev) => ({ ...prev, sleepHours: e.target.value }))}
                  className={inputClass(!!formErrors.sleepHours)}
                  style={inputStyle(!!formErrors.sleepHours)}
                />
                {formErrors.sleepHours && (
                  <p className="mt-1 text-xs text-red-400">{formErrors.sleepHours}</p>
                )}
              </div>
              <label className="text-sm" style={{ color: 'var(--shecare-text)' }}>
                Stress Level
                <select
                  value={form.stressLevel}
                  onChange={(e) => setForm((prev) => ({ ...prev, stressLevel: e.target.value as Stress }))}
                  className={inputClass(false)}
                  style={inputStyle(false)}
                >
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                </select>
              </label>
              <label className="text-sm" style={{ color: 'var(--shecare-text)' }}>
                Exercise Frequency
                <select
                  value={form.exerciseFrequency}
                  onChange={(e) => setForm((prev) => ({ ...prev, exerciseFrequency: e.target.value as Exercise }))}
                  className={inputClass(false)}
                  style={inputStyle(false)}
                >
                  <option value="none">None</option>
                  <option value="1-2">1–2 days/week</option>
                  <option value="3-5">3–5 days/week</option>
                  <option value="6+">6+ days/week</option>
                </select>
              </label>
              <label className="text-sm" style={{ color: 'var(--shecare-text)' }}>
                Water Intake
                <select
                  value={form.waterIntake}
                  onChange={(e) => setForm((prev) => ({ ...prev, waterIntake: e.target.value as Water }))}
                  className={inputClass(false)}
                  style={inputStyle(false)}
                >
                  <option value="<1.5L">Less than 1.5L/day</option>
                  <option value="1.5-2.5L">1.5–2.5L/day</option>
                  <option value=">2.5L">More than 2.5L/day</option>
                </select>
              </label>
              <label className="text-sm" style={{ color: 'var(--shecare-text)' }}>
                Junk Food Frequency
                <select
                  value={form.junkFoodFrequency}
                  onChange={(e) => setForm((prev) => ({ ...prev, junkFoodFrequency: e.target.value as Frequency }))}
                  className={inputClass(false)}
                  style={inputStyle(false)}
                >
                  <option value="never">Never</option>
                  <option value="rarely">Rarely</option>
                  <option value="sometimes">Sometimes</option>
                  <option value="often">Often</option>
                  <option value="daily">Daily</option>
                </select>
              </label>
              <label className="text-sm" style={{ color: 'var(--shecare-text)' }}>
                Sugar Intake
                <select
                  value={form.sugarIntake}
                  onChange={(e) => setForm((prev) => ({ ...prev, sugarIntake: e.target.value as Frequency }))}
                  className={inputClass(false)}
                  style={inputStyle(false)}
                >
                  <option value="never">Never</option>
                  <option value="rarely">Rarely</option>
                  <option value="sometimes">Sometimes</option>
                  <option value="often">Often</option>
                  <option value="daily">Daily</option>
                </select>
              </label>
              <label className="text-sm" style={{ color: 'var(--shecare-text)' }}>
                Fried Food Intake
                <select
                  value={form.friedFoodIntake}
                  onChange={(e) => setForm((prev) => ({ ...prev, friedFoodIntake: e.target.value as Frequency }))}
                  className={inputClass(false)}
                  style={inputStyle(false)}
                >
                  <option value="never">Never</option>
                  <option value="rarely">Rarely</option>
                  <option value="sometimes">Sometimes</option>
                  <option value="often">Often</option>
                  <option value="daily">Daily</option>
                </select>
              </label>
              <label className="text-sm" style={{ color: 'var(--shecare-text)' }}>
                Protein Intake
                <select
                  value={form.proteinIntake}
                  onChange={(e) => setForm((prev) => ({ ...prev, proteinIntake: e.target.value as Intake }))}
                  className={inputClass(false)}
                  style={inputStyle(false)}
                >
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                </select>
              </label>
              <label className="text-sm" style={{ color: 'var(--shecare-text)' }}>
                Fiber Intake
                <select
                  value={form.fiberIntake}
                  onChange={(e) => setForm((prev) => ({ ...prev, fiberIntake: e.target.value as Intake }))}
                  className={inputClass(false)}
                  style={inputStyle(false)}
                >
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                </select>
              </label>
            </div>
          </section>

          <section>
            <h4 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--shecare-text-strong)' }}>
              Medical & Family History
            </h4>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ['familyHistoryPcos', 'Family history of PCOS'],
                ['familyHistoryDiabetes', 'Family history of diabetes'],
                ['familyHistoryThyroid', 'Family history of thyroid'],
                ['thyroidIssues', 'Existing thyroid issues'],
                ['insulinResistance', 'Known insulin resistance'],
                ['previousPcosDiagnosis', 'Previous PCOS diagnosis'],
              ].map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm"
                  style={{ borderColor: 'var(--shecare-border)', background: 'var(--shecare-primary-soft)', color: 'var(--shecare-text)' }}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(form[key as keyof FormState])}
                    onChange={() => onBooleanChange(key as keyof FormState)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </section>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={hasErrors || isFormEmpty}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50 hover:opacity-95"
              style={{
                background: hasErrors || isFormEmpty 
                  ? 'rgba(194, 97, 127, 0.5)' 
                  : 'linear-gradient(135deg, var(--shecare-primary), var(--shecare-primary-hover))',
              }}
              title={hasErrors ? 'Please fix errors before submitting' : isFormEmpty ? 'Please fill in at least some fields' : ''}
            >
              {hasErrors ? '✓ Fix Errors to Analyze' : 'Analyze My PCOS/PCOD Risk'}
            </button>
            <button
              type="button"
              onClick={() => {
                setForm(initialForm)
                setResult(null)
              }}
              className="rounded-xl border px-5 py-2.5 text-sm font-semibold"
              style={{ borderColor: 'var(--shecare-border)', color: 'var(--shecare-text)' }}
            >
              Reset Form
            </button>
          </div>
        </form>
      </motion.article>
) : null}
      {result ? (
        <motion.article
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="shecare-card mt-6 rounded-3xl p-6"
          style={{ background: 'linear-gradient(145deg, var(--shecare-primary-soft), var(--shecare-surface))' }}
        >
          <h3 className="text-xl font-semibold" style={{ color: 'var(--shecare-text-strong)' }}>
            ✨ Your PCOS/PCOD Assessment Result
          </h3>

          <div className="mt-3 flex items-center justify-between">
            <div className="text-xs" style={{ color: 'var(--shecare-muted)' }}>
              {result.createdAt ? `Saved: ${new Date(result.createdAt).toLocaleString()}` : loadingSave ? 'Saving...' : 'Local result'}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
               onClick={() => {
                    setForm(initialForm)
                    setResult(null)
                    setShowForm(true)
                    setShowHistory(false)
                  }}
                className="rounded-xl border px-3 py-1 text-sm"
                style={{ borderColor: 'var(--shecare-border)', color: 'var(--shecare-text)' }}
              >
                Retake Assessment
              </button>
              <button
                type="button"
                onClick={() => setShowHistory((s) => !s)}
                className="rounded-xl px-3 py-1 text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, var(--shecare-primary), var(--shecare-primary-hover))' }}
              >
                {showHistory ? 'Hide Previous' : 'View Previous Assessments'}
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl p-4" style={{ background: 'var(--shecare-surface)' }}>
              <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--shecare-muted)' }}>Risk Level</p>
              <p className="mt-1 text-lg font-semibold" style={{ color: 'var(--shecare-text-strong)' }}>{result.possibilityLevel}</p>
            </div>
            <div className="rounded-2xl p-4" style={{ background: 'var(--shecare-surface)' }}>
              <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--shecare-muted)' }}>Severity</p>
              <p className="mt-1 text-lg font-semibold" style={{ color: 'var(--shecare-text-strong)' }}>{result.severityLevel}</p>
            </div>
            <div className="rounded-2xl p-4" style={{ background: 'var(--shecare-surface)' }}>
              <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--shecare-muted)' }}>Score</p>
              <p className="mt-1 text-lg font-semibold" style={{ color: 'var(--shecare-text-strong)' }}>{result.score}/80+</p>
            </div>
            <div className="rounded-2xl p-4" style={{ background: 'var(--shecare-surface)' }}>
              <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--shecare-muted)' }}>BMI</p>
              <p className="mt-1 text-lg font-semibold" style={{ color: 'var(--shecare-text-strong)' }}>
                {result.bmiValue ? `${result.bmiValue} (${result.bmiCategory})` : result.bmiCategory}
              </p>
            </div>
          </div>

          <p className="mt-5 text-sm leading-6" style={{ color: 'var(--shecare-text)' }}>
            {result.explanation}
          </p>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--shecare-text-strong)' }}>Main Risk Factors</h4>
              <ul className="mt-2 space-y-2 text-sm" style={{ color: 'var(--shecare-text)' }}>
                {result.mainRiskFactors.length > 0 ? (
                  result.mainRiskFactors.map((factor) => <li key={factor}>• {factor}</li>)
                ) : (
                  <li>• No major risk factors detected.</li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--shecare-text-strong)' }}>Diet Plan</h4>
              <ul className="mt-2 space-y-2 text-sm" style={{ color: 'var(--shecare-text)' }}>
                {result.dietPlan.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--shecare-text-strong)' }}>Lifestyle Plan</h4>
              <ul className="mt-2 space-y-2 text-sm" style={{ color: 'var(--shecare-text)' }}>
                {result.lifestylePlan.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--shecare-text-strong)' }}>Medical Consultation</h4>
              <ul className="mt-2 space-y-2 text-sm" style={{ color: 'var(--shecare-text)' }}>
                {result.doctorRecommendation.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-6 rounded-2xl border p-3 text-xs leading-5" style={{ borderColor: 'var(--shecare-border)', color: 'var(--shecare-muted)' }}>
            <strong>Disclaimer:</strong> This Smart Checker is for educational purposes only and provides screening guidance, not a medical diagnosis. PCOS/PCOD diagnosis requires evaluation by a qualified gynecologist, endocrinologist, or reproductive health specialist with blood tests and imaging. Always consult a healthcare professional for diagnosis, treatment, and medical advice.
          </p>
        </motion.article>
      ) : null}
      {showHistory ? (
        <motion.article
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="shecare-card mt-6 rounded-3xl p-4"
        >
          <h4 className="text-sm font-semibold" style={{ color: 'var(--shecare-text-strong)' }}>Previous Assessments</h4>
          {loadingHistory ? (
            <p className="mt-2 text-sm" style={{ color: 'var(--shecare-muted)' }}>Loading assessments...</p>
          ) : history.length === 0 ? (
            <p className="mt-2 text-sm" style={{ color: 'var(--shecare-muted)' }}>No previous assessments found.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {history.map((h) => (
                <li key={h._id} className="flex items-center justify-between rounded-xl border px-3 py-2" style={{ borderColor: 'var(--shecare-border)' }}>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--shecare-text-strong)' }}>{h.result?.possibilityLevel || 'Assessment'}</div>
                    <div className="text-xs" style={{ color: 'var(--shecare-muted)' }}>{new Date(h.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                          setResult({ ...(h.result || {}), createdAt: h.createdAt })
                          setForm(h.formData || initialForm)
                          setShowForm(false)
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                      className="rounded-xl px-3 py-1 text-sm"
                      style={{ border: '1px solid var(--shecare-border)', color: 'var(--shecare-text)' }}
                    >
                      Load
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </motion.article>
      ) : null}
    </PageTransition>
  )
}
