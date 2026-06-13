import { motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar } from 'recharts'
import { PageTransition } from '../components/common/PageTransition'
import { SectionHeader } from '../components/common/SectionHeader'
import { useAuth } from '../hooks/useAuth'
import { BASE_URL } from '../config/api'
import { useSettings } from '../context/SettingsContext'

const parseDate = (value: string | Date | null | undefined) => {
  if (!value) {
    return null
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split('/').map(Number)
    const parsed = new Date(year, month - 1, day)

    if (
      parsed.getFullYear() !== year ||
      parsed.getMonth() !== month - 1 ||
      parsed.getDate() !== day
    ) {
      return null
    }

    return parsed
  }

  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    const [year, month, day] = value.slice(0, 10).split('-').map(Number)
    const parsed = new Date(year, month - 1, day)

    if (
      parsed.getFullYear() !== year ||
      parsed.getMonth() !== month - 1 ||
      parsed.getDate() !== day
    ) {
      return null
    }

    return parsed
  }

  return null
}

const toValidDate = parseDate

function formatDateDisplay(date: string | Date) {
  const parsed = toValidDate(date)

  if (!parsed) {
    return ''
  }

  const day = String(parsed.getDate()).padStart(2, '0')
  const month = String(parsed.getMonth() + 1).padStart(2, '0')
  const year = parsed.getFullYear()

  return `${day}/${month}/${year}`
}

const toDateKey = (value: Date) => {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const toDateInputValue = (value: string | Date | null | undefined) => {
  if (typeof value === 'string') {
    const parsed = toValidDate(value)
    return parsed ? toDateKey(parsed) : value.slice(0, 10)
  }

  const parsed = toValidDate(value)
  return parsed ? toDateKey(parsed) : ''
}

const parseLocalDate = (dateStr: string | null | undefined) => {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return null
  }

  const [year, month, day] = dateStr.split('-').map(Number)
  const parsed = new Date(year, month - 1, day)

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null
  }

  return parsed
}

const isRangeOverlapping = (
  newStartDate: string,
  newEndDate: string,
  existingStartDate: string,
  existingEndDate: string,
) => {
  const newStart = parseLocalDate(newStartDate)
  const newEnd = parseLocalDate(newEndDate)
  const existingStart = parseLocalDate(existingStartDate)
  const existingEnd = parseLocalDate(existingEndDate)

  if (!newStart || !newEnd || !existingStart || !existingEnd) {
    return false
  }

  return newStart <= existingEnd && newEnd >= existingStart
}

const symptomOptions = ['Cramps', 'Bloating', 'Mood Swings', 'Fatigue', 'Headache', 'Back Pain', 'Acne', 'Food Cravings'] as const
const flowOptions = ['Light', 'Medium', 'Heavy'] as const
const painOptions = ['None', 'Mild', 'Moderate', 'Severe'] as const

type FlowIntensity = (typeof flowOptions)[number]
type PainLevel = (typeof painOptions)[number]
type PredictionConfidence = 'low' | 'medium' | 'high'

type PredictionMeta = {
  predictedNextCycle: string
  confidence: PredictionConfidence
  warning: string | null
}

type PeriodLogEntry = {
  _id: string
  startDate: string
  endDate: string
  symptoms: string[]
  flow: FlowIntensity
  pain: PainLevel
  notes: string
}

const convertPainToNumber = (pain: PainLevel) => {
  if (pain === 'None') return 0
  if (pain === 'Mild') return 1
  if (pain === 'Moderate') return 2
  return 3
}

const convertFlowToNumber = (flow: FlowIntensity) => {
  if (flow === 'Light') return 1
  if (flow === 'Medium') return 2
  return 3
}

const getDaysInMonth = (date: Date) => {
  const year = date.getFullYear()
  const month = date.getMonth()
  return new Date(year, month + 1, 0).getDate()
}

const calculateStandardDeviation = (values: number[]) => {
  if (values.length < 2) {
    return 0
  }

  const mean = values.reduce((sum, value) => sum + value, 0) / values.length
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

const inferPredictionConfidence = (stdDeviation: number, shortestCycle: number | null, sampleSize: number): PredictionConfidence => {
  if (shortestCycle !== null && shortestCycle < 15) {
    return 'low'
  }

  if (sampleSize < 2) {
    return 'low'
  }

  if (stdDeviation < 2) {
    return 'high'
  }

  if (stdDeviation <= 5) {
    return 'medium'
  }

  return 'low'
}

const getHighlightStyle = (confidence: PredictionConfidence) => {
  if (confidence === 'high') {
    return {
      background: 'var(--shecare-primary)',
      color: 'var(--shecare-on-primary)',
      borderColor: 'var(--shecare-primary-hover)',
    }
  }

  if (confidence === 'medium') {
    return {
      background: 'rgba(231, 84, 128, 0.55)',
      color: 'var(--shecare-on-primary)',
      borderColor: 'rgba(231, 84, 128, 0.7)',
    }
  }

  return {
    background: 'rgba(231, 84, 128, 0.26)',
    color: 'var(--shecare-text-strong)',
    borderColor: 'rgba(231, 84, 128, 0.42)',
  }
}

const getMinimumAllowedDateForAge = (age: number) => {
  if (!Number.isFinite(age) || age < 9) {
    return null
  }

  return new Date(new Date().getFullYear() - age + 9, 0, 1)
}

const isSameDate = (left: Date, right: Date) =>
  left.getDate() === right.getDate() &&
  left.getMonth() === right.getMonth() &&
  left.getFullYear() === right.getFullYear()

const getDateRange = (start: Date, end: Date) => {
  const dates: Date[] = []
  let current = new Date(start)

  while (current <= end) {
    dates.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  return dates
}

export const PeriodTrackerPage = () => {
  const { isAdmin } = useAuth()
  
  if (isAdmin) {
    return <AdminCycleDataView />
  }

  return <UserPeriodTrackerView />
}

const AdminCycleDataView = () => {
  const aggregatedStats = [
    { label: 'Average Cycle Length', value: '28.5 days' },
    { label: 'Most Common Symptoms', value: 'Bloating, Cramps' },
    { label: 'Tracked Users', value: '1,240' },
  ]

  const cycleSymptomData = [
    { symptom: 'Cramps', frequency: 85 },
    { symptom: 'Bloating', frequency: 78 },
    { symptom: 'Fatigue', frequency: 65 },
    { symptom: 'Mood Swings', frequency: 72 },
    { symptom: 'Headache', frequency: 55 },
  ]

  const cycleDistribution = [
    { range: '21-24 days', count: 120 },
    { range: '25-28 days', count: 640 },
    { range: '29-32 days', count: 380 },
    { range: '33+ days', count: 100 },
  ]

  const adminTrendData = [
    { date: 'Jan', pain: 2, flow: 2.4 },
    { date: 'Feb', pain: 2.1, flow: 2.2 },
    { date: 'Mar', pain: 1.9, flow: 2.1 },
    { date: 'Apr', pain: 2.3, flow: 2.5 },
    { date: 'May', pain: 2.0, flow: 2.2 },
  ]

  return (
    <PageTransition>
      <SectionHeader title="Admin Cycle Data" subtitle="Aggregated period tracking analytics across all users." />
      
      <div className="grid gap-4 md:grid-cols-3">
        {aggregatedStats.map((stat, index) => (
          <motion.article
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * index }}
            className="shecare-card rounded-3xl p-5"
          >
            <p className="text-sm" style={{ color: 'var(--shecare-primary)' }}>{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold" style={{ color: 'var(--shecare-text-strong)' }}>{stat.value}</p>
          </motion.article>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="shecare-card rounded-3xl p-5"
        >
          <h3 className="text-lg font-semibold" style={{ color: 'var(--shecare-text-strong)' }}>
            Symptom Frequency Heatmap
          </h3>
          <div className="mt-4 h-80">
            <ResponsiveContainer>
              <BarChart data={cycleSymptomData}>
                <CartesianGrid stroke="var(--shecare-chart-grid)" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="symptom"
                  tick={{ fill: 'var(--shecare-chart-axis)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--shecare-chart-axis)', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--card, var(--shecare-surface-strong))',
                    border: '1px solid var(--shecare-border)',
                    borderRadius: '14px',
                    color: 'var(--shecare-text)',
                  }}
                />
                <Bar dataKey="frequency" fill="var(--shecare-primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.article>

        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="shecare-card rounded-3xl p-5"
        >
          <h3 className="text-lg font-semibold" style={{ color: 'var(--shecare-text-strong)' }}>
            Cycle Length Distribution
          </h3>
          <div className="mt-4 space-y-3">
            {cycleDistribution.map((item) => (
              <div key={item.range}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-sm" style={{ color: 'var(--shecare-text)' }}>{item.range}</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--shecare-text-strong)' }}>{item.count} users</p>
                </div>
                <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--shecare-primary-soft)' }}>
                  <div
                    className="h-full"
                    style={{
                      background: 'linear-gradient(90deg, var(--shecare-primary), var(--shecare-primary-hover))',
                      width: `${(item.count / 640) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.article>
      </div>

      <motion.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="shecare-card rounded-3xl p-5"
      >
        <h3 className="text-lg font-semibold" style={{ color: 'var(--shecare-text-strong)' }}>
          Cycle Trends Over Time
        </h3>
        <div className="mt-3 h-72">
          <ResponsiveContainer>
            <LineChart data={adminTrendData}>
              <XAxis
                dataKey="date"
                tick={{ fill: 'var(--shecare-chart-axis)', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--shecare-chart-axis)', fontSize: 12 }}
              />
              <CartesianGrid stroke="var(--shecare-chart-grid)" strokeDasharray="3 3" vertical={false} />
              <Tooltip
                contentStyle={{
                  background: 'var(--card, var(--shecare-surface-strong))',
                  border: '1px solid var(--shecare-border)',
                  borderRadius: '14px',
                  color: 'var(--shecare-text)',
                }}
                labelStyle={{ color: 'var(--shecare-text-strong)' }}
                itemStyle={{ color: 'var(--shecare-text)' }}
              />
              <Line type="monotone" dataKey="pain" stroke="var(--shecare-primary)" strokeWidth={3} dot={{ r: 4 }} />
              <Line
                type="monotone"
                dataKey="flow"
                stroke="var(--shecare-primary-soft-hover)"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.article>
    </PageTransition>
  )
}

const UserPeriodTrackerView = () => {
  const { user } = useAuth()
  const { settings } = useSettings()

  const userId = user?.userId ?? localStorage.getItem('userId') ?? ''
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [flow, setFlow] = useState<FlowIntensity>('Medium')
  const [pain, setPain] = useState<PainLevel>('Mild')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [logs, setLogs] = useState<PeriodLogEntry[]>([])
  const [editingLogId, setEditingLogId] = useState<string | null>(null)
  const [profileAge, setProfileAge] = useState<number | null>(null)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [predictionMeta, setPredictionMeta] = useState<PredictionMeta | null>(null)

  const fetchLogs = async (): Promise<PeriodLogEntry[]> => {
    const storedUserId = user?.userId ?? localStorage.getItem('userId')

    if (!storedUserId) {
      return []
    }
let data: any = null
    try {
      console.log('📊 FETCHING LOGS FOR USER:', storedUserId)
      const res = await fetch(`${BASE_URL}/period-logs/${storedUserId}`)
      data = await res.json()
      console.log('📋 FETCHED LOGS RESPONSE:', {
        success: data.success,
        logCount: data.data?.length || 0,
        logs: data.data?.map((l: any) => ({
          _id: l._id,
          startDate: l.startDate,
          endDate: l.endDate,
        })),
      })

      if (data.success) {
        console.log(`✅ LOADED ${data.data.length} LOGS INTO STATE`)
        setLogs(data.data)

        if (data.predictedNextCycle) {
          setPredictionMeta({
            predictedNextCycle: data.predictedNextCycle,
            confidence: data.confidence ?? 'low',
            warning: data.warning ?? null,
          })
        } else {
          setPredictionMeta(null)
        }

        if (Array.isArray(data.data) && data.data.length > 0) {
          const latestLog = data.data[0]
          const baseDate = toValidDate(latestLog.startDate)

          if (!baseDate) {
            return []
          }

          const predictedDate = new Date(baseDate)
          predictedDate.setDate(predictedDate.getDate() + 28)

          setCurrentMonth(new Date(predictedDate.getFullYear(), predictedDate.getMonth(), 1))
        }
      }
    } catch (error) {
      console.error('🔴 FETCH LOGS ERROR:', error)
      return []
    }

    return data.data || []
  }

  useEffect(() => {
    fetchLogs()
  }, [user?.userId])

  useEffect(() => {
    const fetchProfile = async () => {
      const storedUserId = user?.userId ?? localStorage.getItem('userId')

      if (!storedUserId) {
        setProfileLoaded(true)
        return
      }

      try {
        console.log('FETCH PROFILE FOR PERIOD TRACKER:', `${BASE_URL}/profile?userId=${storedUserId}`)
        const response = await fetch(`${BASE_URL}/profile?userId=${storedUserId}`)
        let data: any = null

try {
  data = await response.json()
} catch (jsonError) {
  console.error('❌ FAILED TO PARSE RESPONSE JSON:', jsonError)

  const rawText = await response.text()

  console.error('❌ RAW RESPONSE:', rawText)

  setError(`Server returned invalid response (${response.status})`)
  return
}
        console.log('LOADED PROFILE:', data)

        if (data.success && data.profile) {
          const ageValue = Number(data.profile.age)
          setProfileAge(Number.isFinite(ageValue) && ageValue > 0 ? ageValue : null)
        } else {
          setProfileAge(null)
        }
      } catch (error) {
        console.error('PROFILE LOAD ERROR:', error)
        setProfileAge(null)
      } finally {
        setProfileLoaded(true)
      }
    }

    fetchProfile()
  }, [user?.userId])

  if (!settings) {
    return (
      <PageTransition>
        <div className="shecare-card rounded-3xl p-5 text-sm" style={{ color: 'var(--shecare-muted)' }}>
          Loading settings...
        </div>
      </PageTransition>
    )
  }

  const sortedLogs = [...logs].sort(
    (a, b) => (parseDate(b.startDate)?.getTime() ?? 0) - (parseDate(a.startDate)?.getTime() ?? 0),
  )
  const ascendingLogs = [...sortedLogs].reverse()
  const latestLog = sortedLogs[0]

  const chartData = ascendingLogs.map((log) => ({
    date: (toValidDate(log.startDate) ?? new Date()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    painLevel: convertPainToNumber(log.pain),
    flowLevel: convertFlowToNumber(log.flow),
  }))
  const cycleLengths: number[] = []

  for (let i = 1; i < ascendingLogs.length; i++) {
    const prev = toValidDate(ascendingLogs[i - 1].startDate)
    const curr = toValidDate(ascendingLogs[i].startDate)

    if (!prev || !curr) {
      continue
    }

    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)

    if (diff > 0) {
      cycleLengths.push(diff)
    }
  }

  const averageCycleLength =
    cycleLengths.length > 0 ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length) : 28
  const shortestCycle = cycleLengths.length > 0 ? Math.min(...cycleLengths) : null
  const stdDeviation = calculateStandardDeviation(cycleLengths)
  const derivedConfidence = inferPredictionConfidence(stdDeviation, shortestCycle, cycleLengths.length)
  const shortCycleWarning = shortestCycle !== null && shortestCycle < 15
    ? 'Short cycle detected — consider tracking more data'
    : null
  const derivedWarning = shortCycleWarning ?? (derivedConfidence === 'low' ? 'Predictions may be less accurate due to irregular cycle.' : null)
  const lastCycleLength = cycleLengths.length > 0 ? cycleLengths[cycleLengths.length - 1] : null
  const formattedDate = latestLog ? formatDateDisplay(latestLog.startDate) : ''

  const isCurrentPeriod = (logStartDate: string | Date, logEndDate: string | Date) => {
    const start = toValidDate(logStartDate)
    const end = toValidDate(logEndDate)

    if (!start || !end) {
      return false
    }

    const today = new Date()
    return today >= start && today <= end
  }

  const currentPeriodActive = latestLog ? isCurrentPeriod(latestLog.startDate, latestLog.endDate) : false

  const lastStart = latestLog ? parseDate(latestLog.startDate) : null
  const lastEnd = latestLog ? parseDate(latestLog.endDate) : null
  const lastPeriodLength =
    lastStart && lastEnd
      ? Math.max(1, Math.round((lastEnd.getTime() - lastStart.getTime()) / (1000 * 60 * 60 * 24)) + 1)
      : 1

  const predictedStart = (() => {
    if (!lastStart) {
      return null
    }

    const nextPredictedStart = new Date(lastStart)
    nextPredictedStart.setDate(nextPredictedStart.getDate() + averageCycleLength)
    return nextPredictedStart
  })()

  const predictedEnd = (() => {
    if (!predictedStart) {
      return null
    }

    const nextPredictedEnd = new Date(predictedStart)
    nextPredictedEnd.setDate(nextPredictedEnd.getDate() + lastPeriodLength - 1)
    return nextPredictedEnd
  })()

  const currentCycleDates = currentPeriodActive && lastStart && lastEnd ? getDateRange(lastStart, lastEnd) : []
  const upcomingCycleDates = predictedStart && predictedEnd ? getDateRange(predictedStart, predictedEnd) : []
  const highlightedCycleDates = currentPeriodActive ? currentCycleDates : upcomingCycleDates

  const effectiveConfidence: PredictionConfidence = predictionMeta?.confidence ?? derivedConfidence
  const effectiveWarning = predictionMeta?.warning ?? derivedWarning

  useEffect(() => {
    console.log('RAW LOGS:', logs)
    console.log('PARSED:', logs.map((entry) => toValidDate(entry.startDate)))
    console.log('Last period:', lastStart, lastEnd)
    console.log('Predicted range:', predictedStart, predictedEnd)
    console.log('Current cycle dates:', currentCycleDates)
    console.log('Upcoming cycle dates:', upcomingCycleDates)
    console.log('Highlighted cycle dates:', highlightedCycleDates)
  }, [logs, lastStart, lastEnd, predictedStart, predictedEnd, currentCycleDates, upcomingCycleDates, highlightedCycleDates])

  const monthDays = Array.from({ length: getDaysInMonth(currentMonth) }, (_, i) => i + 1)
  const monthLabel = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const cycleInsight = (() => {
    if (cycleLengths.length < 2) {
      return null
    }

    const minCycle = Math.min(...cycleLengths)
    const maxCycle = Math.max(...cycleLengths)
    const variation = maxCycle - minCycle

    return variation <= 3 ? 'Your cycle is consistent 🌸' : 'Your cycle varies slightly each month'
  })()

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((item) => item !== symptom) : [...prev, symptom],
    )
  }

  const resetPeriodForm = () => {
    setStartDate('')
    setEndDate('')
    setSelectedSymptoms([])
    setFlow('Medium')
    setPain('Mild')
    setNotes('')
    setError('')
    setEditingLogId(null)
  }

  const openCreateLogModal = () => {
    resetPeriodForm()
    setIsPeriodModalOpen(true)
  }

  const openEditLogModal = (entry: PeriodLogEntry) => {
    setEditingLogId(entry._id)
    setStartDate(toDateInputValue(entry.startDate))
    setEndDate(toDateInputValue(entry.endDate))
    setSelectedSymptoms(entry.symptoms)
    setFlow(entry.flow)
    setPain(entry.pain)
    setNotes(entry.notes)
    setIsPeriodModalOpen(true)
  }

  const submitPeriodLog = async () => {
  if (!startDate || !endDate) {
    setError('Start date and end date are required')
    return
  }

  if (!profileLoaded) {
    setError('Loading profile validation, please try again in a moment.')
    return
  }

  try {
    console.log('Sending period log')

    const parsedStartDate = parseLocalDate(startDate)
    const parsedEndDate = parseLocalDate(endDate)

    if (!parsedStartDate || !parsedEndDate) {
      console.error('Invalid date:', { startDate, endDate })
      setError('Invalid date format')
      return
    }

    if (parsedEndDate < parsedStartDate) {
      setError('End date must be after start date')
      return
    }

    const logSpanInDays =
      Math.floor((parsedEndDate.getTime() - parsedStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

    if (logSpanInDays < 3) {
      setError('Period log must be at least 3 days long')
      return
    }

    if (profileAge !== null) {
      const minimumAllowedDate = getMinimumAllowedDateForAge(profileAge)

      if (minimumAllowedDate && parsedStartDate < minimumAllowedDate) {
        setError('Date is not realistic for the saved profile age')
        return
      }
    }

    const latestLogs = await fetchLogs()
    console.log('📚 FRESH LOGS FOR OVERLAP CHECK:', latestLogs)

    const overlappingLog = latestLogs.find((entry) => {
      if (editingLogId === entry._id) {
        return false
      }

      return isRangeOverlapping(startDate, endDate, entry.startDate, entry.endDate)
    })

    if (overlappingLog) {
      setError('This date range overlaps an existing period log. Edit the existing log instead.')
      return
    }

    console.log('✅ VALIDATED PERIOD LOG:', {
      userId,
      startDate,
      endDate,
      symptoms: selectedSymptoms,
      flow,
      pain,
      notes,
    })

    const response = await (editingLogId
      ? fetch(`${BASE_URL}/period-log/${editingLogId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              userId,
              startDate,
              endDate,
              flow,
              pain,
              symptoms: selectedSymptoms,
              notes,
            }),
        })
      : fetch(`${BASE_URL}/period-log`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
                userId,
                startDate,
                endDate,
                flow,
                pain,
                symptoms: selectedSymptoms,
                notes,
              }),
        }))

    const data = await response.json()
    console.log('📋 SAVE RESPONSE:', { status: response.status, statusText: response.statusText, data })

    if (!response.ok || !data.success) {
      console.error('❌ FAILED TO SAVE PERIOD LOG:', {
        message: data.message,
        status: response.status,
        conflictingLogId: data.conflictingLogId,
      })

      if (response.status === 409 && data.conflictingLog) {
        console.error('🧾 CONFLICTING SAVED LOG:', data.conflictingLog)
        console.error('🧾 CONFLICTING LOG DATES:', {
          startDate: data.conflictingLog.startDate,
          endDate: data.conflictingLog.endDate,
        })

        if (data.conflictType === 'exact-match' && data.conflictingLog._id) {
          setEditingLogId(data.conflictingLog._id)
          setError('A saved log already exists for these exact dates. Switched to edit mode.')
          setTimeout(() => setError(''), 5000)
          return
        }
      }

      setError(data.message || 'Something went wrong')
      setTimeout(() => setError(''), 5000)
      return
    }

    setError('')
    setEditingLogId(null)
    await fetchLogs()

    resetPeriodForm()
    setIsPeriodModalOpen(false)
  } catch (error) {
    console.error('Period log error:', error)
    setError('Something went wrong')
    setTimeout(() => setError(''), 3000)
  }
}

  const handleDelete = async (id: string) => {
    console.log('🗑️  DELETE FUNCTION CALLED')
    console.log('DELETE ID:', id)

    if (!window.confirm('Are you sure you want to delete this log?')) {
      console.log('❌ DELETE CANCELLED BY USER')
      return
    }

    try {
      console.log('📤 Sending delete request with userId:', userId)

      const res = await fetch(`${BASE_URL}/period-log/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      console.log('📥 DELETE RESPONSE STATUS:', res.status, res.statusText)

      const data = await res.json()

      console.log('📋 DELETE RESPONSE DATA:', data)

      if (!res.ok) {
        console.error('❌ DELETE FAILED:', data.message)
        setError(data.message || 'Failed to delete period log')
        setTimeout(() => setError(''), 4000)
        return
      }

      if (!data.success) {
        console.error('❌ DELETE NOT SUCCESSFUL:', data.message)
        setError(data.message || 'Failed to delete period log')
        setTimeout(() => setError(''), 4000)
        return
      }

      console.log('✅ DELETE SUCCESSFUL, DELETED ID:', data.deletedId)

      // Remove from local state immediately
      const updatedLogs = logs.filter((log) => log._id !== id)
      console.log(`🧹 REMOVING LOG FROM STATE: before=${logs.length}, after=${updatedLogs.length}`)
      setLogs(updatedLogs)

      // Reset form if this log was being edited
      if (editingLogId === id) {
        console.log('🔄 RESETTING FORM (was editing deleted log)')
        resetPeriodForm()
      }

      // Refetch to ensure backend is in sync
      console.log('🔄 REFETCHING LOGS FROM SERVER...')
      await fetchLogs()
      console.log('✅ REFETCH COMPLETE')
    } catch (error: any) {
  console.error('🔴 PERIOD LOG ERROR FULL:', error)

  setError(
    error?.message ||
    JSON.stringify(error) ||
    'Unknown frontend error'
  )

  setTimeout(() => setError(''), 5000)
}
  }

  const goToPreviousMonth = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  const periodModalContent = (
    <>
      <div className="themed-modal-overlay fixed inset-0 z-[120]" />
      <div className="themed-modal-shell fixed inset-0 z-[130] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.24, ease: 'easeOut' }}
          className="themed-modal-card w-full max-w-[680px] rounded-[2rem] p-6 md:p-7 max-h-[90vh] overflow-y-auto"
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h3 className="themed-modal-title text-2xl font-semibold">{editingLogId ? 'Edit Period Log' : 'Period Log'}</h3>
              <p className="themed-modal-subtitle mt-1 text-sm">Capture your cycle details clearly to spot trends over time.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsPeriodModalOpen(false)
                resetPeriodForm()
              }}
              className="themed-modal-close rounded-full px-3 py-1.5 text-sm font-medium"
            >
              Close
            </button>
          </div>

          <label className="block space-y-1.5">
            <span className="themed-modal-label text-sm">Start date</span>
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="themed-modal-input w-full rounded-2xl px-4 py-2.5"
              required
            />
          </label>

          <label className="mt-4 block space-y-1.5">
            <span className="themed-modal-label text-sm">End date</span>
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="themed-modal-input w-full rounded-2xl px-4 py-2.5"
              required
            />
          </label>

          <div className="mt-4 space-y-2">
            <span className="themed-modal-label text-sm">Symptoms</span>
            <div className="grid gap-2 sm:grid-cols-2">
              {symptomOptions.map((symptom) => {
                const isSelected = selectedSymptoms.includes(symptom)
                return (
                  <motion.button
                    key={symptom}
                    type="button"
                    onClick={() => toggleSymptom(symptom)}
                    whileTap={{ scale: 0.98 }}
                    animate={{ scale: isSelected ? 1.02 : 1 }}
                    transition={{ duration: 0.16, ease: 'easeOut' }}
                    className={`themed-modal-chip rounded-xl px-3 py-2 text-left text-sm font-medium ${
                      isSelected ? 'themed-modal-chip-active' : ''
                    }`}
                  >
                    {symptom}
                  </motion.button>
                )
              })}
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <span className="themed-modal-label text-sm">Flow Intensity</span>
            <div className="flex flex-wrap gap-2">
              {flowOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFlow(option)}
                  className={`themed-modal-pill rounded-full px-4 py-2 text-sm font-medium ${
                    flow === option ? 'themed-modal-pill-active' : ''
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <span className="themed-modal-label text-sm">Pain Level</span>
            <div className="flex flex-wrap gap-2">
              {painOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setPain(option)}
                  className={`themed-modal-pill rounded-full px-4 py-2 text-sm font-medium ${
                    pain === option ? 'themed-modal-pill-active' : ''
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <label className="mt-4 block space-y-1.5">
            <span className="themed-modal-label text-sm">Notes</span>
            <textarea
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Add any observations..."
              className="themed-modal-input w-full rounded-2xl px-4 py-2.5"
            />
          </label>

          {error ? (
            <div className="mt-4 rounded bg-red-100 p-2 text-red-600">
              {error}
            </div>
          ) : null}

          <button
            type="button"
            onClick={submitPeriodLog}
            className="themed-modal-submit mt-6 w-full rounded-full px-5 py-3 text-sm font-semibold"
          >
            {editingLogId ? 'Save Changes' : '✨ Log Period'}
          </button>
        </motion.div>
      </div>
    </>
  )

  return (
    <PageTransition>
      <SectionHeader title="Period Tracker" />
      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <article className="shecare-card rounded-3xl p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--shecare-text-strong)' }}>Cycle Calendar</h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goToPreviousMonth}
                className="shecare-button-secondary rounded-full px-3 py-1 text-xs font-semibold"
                aria-label="Previous month"
              >
                Prev
              </button>
              <p className="text-xs font-semibold" style={{ color: 'var(--shecare-text-strong)' }}>{monthLabel}</p>
              <button
                type="button"
                onClick={goToNextMonth}
                className="shecare-button-secondary rounded-full px-3 py-1 text-xs font-semibold"
                aria-label="Next month"
              >
                Next
              </button>
            </div>
          </div>

          {settings.periodReminders ? (
            currentPeriodActive ? (
              <p className="mt-2 text-xs font-medium" style={{ color: 'var(--shecare-primary)' }}>Current Cycle</p>
            ) : predictedStart ? (
              <p className="mt-2 text-xs font-medium" style={{ color: 'var(--shecare-primary)' }}>Upcoming Cycle</p>
            ) : null
          ) : (
            <p className="mt-2 text-xs font-medium" style={{ color: 'var(--shecare-muted)' }}>Period reminders are turned off</p>
          )}

          <div className="mt-4 grid grid-cols-7 gap-2 text-center text-sm">
            {monthDays.map((day) => {
              const cellDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
              const isHighlighted =
                settings.periodReminders &&
                highlightedCycleDates.some((date) => isSameDate(date, cellDate))

              return (
                <div
                  key={day}
                  className={`rounded-xl py-2 transition ${isHighlighted ? 'font-semibold border' : ''}`}
                  style={
                    isHighlighted
                      ? getHighlightStyle('high')
                      : {
                          background: 'var(--shecare-primary-soft)',
                          color: 'var(--shecare-text)',
                        }
                  }
                >
                  {day}
                </div>
              )
            })}
          </div>
        </article>

        <article className="shecare-card rounded-3xl p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--shecare-text-strong)' }}>Cycle Logging</h3>
            <button
              type="button"
              onClick={openCreateLogModal}
              className="shecare-button-secondary rounded-full px-4 py-2 text-xs font-semibold"
            >
              Log Period
            </button>
          </div>
          <label className="shecare-text-muted mt-4 block text-sm">Last cycle start date</label>
          <input
            type="text"
            value={formattedDate}
            readOnly
            placeholder="No data"
            className="shecare-input mt-2 w-full rounded-2xl px-4 py-2.5 outline-none"
          />
          <p className="mt-3 text-xs" style={{ color: 'var(--secondary-text)' }}>
            Your average cycle: {averageCycleLength ?? '—'} days
          </p>
          {lastCycleLength ? (
            <p className="mt-1 text-xs" style={{ color: 'var(--secondary-text)' }}>
              Last cycle length: {lastCycleLength} days
            </p>
          ) : null}
          {cycleInsight ? (
            <p className="mt-1 text-xs" style={{ color: 'var(--secondary-text)' }}>
              {cycleInsight}
            </p>
          ) : null}
          {settings.cyclePredictions ? (
            predictedStart ? (
              <div className="mt-4 rounded-2xl p-4" style={{ background: 'var(--shecare-primary-soft)' }}>
                <p className="shecare-text-muted text-sm">Predicted next cycle</p>
                <p className="font-delta text-4xl" style={{ color: 'var(--shecare-text-strong)' }}>
                  {predictedStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
                <p className="mt-1 text-xs font-medium" style={{ color: 'var(--shecare-text-strong)' }}>
                  Confidence: {effectiveConfidence.toUpperCase()}
                </p>
                {effectiveWarning ? (
                  <p className="mt-1 text-xs" style={{ color: 'var(--shecare-muted)' }}>
                    {effectiveWarning}
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border p-4" style={{ borderColor: 'var(--shecare-border)', background: 'var(--shecare-primary-soft)' }}>
                <p className="text-sm font-medium" style={{ color: 'var(--shecare-text-strong)' }}>
                  Not enough cycle logs yet. Add your first period start to begin prediction.
                </p>
              </div>
            )
          ) : (
            <div className="mt-4 rounded-2xl border p-4" style={{ borderColor: 'var(--shecare-border)', background: 'var(--shecare-primary-soft)' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--shecare-text-strong)' }}>Cycle predictions are off</p>
              <p className="mt-1 text-xs" style={{ color: 'var(--shecare-muted)' }}>Turn on Cycle predictions in Profile settings to show forecast cards and charts.</p>
            </div>
          )}
        </article>
      </div>

      {settings.cyclePredictions ? (
        <article className="shecare-card rounded-3xl p-5">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--shecare-text-strong)' }}>Cycle Insights</h3>
          <div className="mt-3 h-72">
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'var(--shecare-chart-axis)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--shecare-chart-axis)', fontSize: 12 }}
                />
                <CartesianGrid stroke="var(--shecare-chart-grid)" strokeDasharray="3 3" vertical={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--card, var(--shecare-surface-strong))',
                    border: '1px solid var(--shecare-border)',
                    borderRadius: '14px',
                    color: 'var(--shecare-text)',
                  }}
                  labelStyle={{ color: 'var(--shecare-text-strong)' }}
                  itemStyle={{ color: 'var(--shecare-text)' }}
                />
                <Line type="monotone" dataKey="painLevel" stroke="var(--shecare-primary)" strokeWidth={3} dot={{ r: 4 }} />
                <Line
                  type="monotone"
                  dataKey="flowLevel"
                  stroke="var(--shecare-primary-soft-hover)"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>
      ) : null}

      <article className="shecare-card rounded-3xl p-5">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--shecare-text-strong)' }}>Recent Period Logs</h3>
        {logs.length === 0 ? (
          <p className="shecare-text-muted mt-3 text-sm">No logs yet. Use Log Period to add your first entry.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {logs.map((entry) => (
              <div
                key={entry._id}
                className="rounded-2xl border p-4"
                style={{ borderColor: 'var(--shecare-border)', background: 'var(--shecare-primary-soft)' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold" style={{ color: 'var(--shecare-text-strong)' }}>
                    {formatDateDisplay(entry.startDate)} - {formatDateDisplay(entry.endDate)}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditLogModal(entry)}
                      className="shecare-button-secondary rounded-full px-3 py-1 text-xs font-semibold"
                      aria-label="Edit log"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      type="button"
                      disabled={!profileLoaded}
                      onClick={() => handleDelete(entry._id)}
                      className="rounded-full border px-3 py-1 text-xs font-semibold transition"
                      style={{
                        borderColor: 'var(--shecare-border-strong)',
                        background: 'var(--shecare-surface-strong)',
                        color: 'var(--shecare-primary)',
                      }}
                      aria-label="Delete log"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="shecare-text-muted mt-1 text-xs">Flow: {entry.flow} • Pain: {entry.pain}</p>
                {entry.symptoms.length > 0 ? (
                  <p className="shecare-text-muted mt-1 text-xs">Symptoms: {entry.symptoms.join(', ')}</p>
                ) : null}
                {entry.notes ? <p className="shecare-text-muted mt-1 text-xs">Notes: {entry.notes}</p> : null}
              </div>
            ))}
          </div>
        )}
      </article>

      {isPeriodModalOpen ? createPortal(periodModalContent, document.body) : null}
    </PageTransition>
  )
}