import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { PageTransition } from '../components/common/PageTransition'
import { SectionHeader } from '../components/common/SectionHeader'
import { SkeletonCard } from '../components/common/Skeleton'
import { WeeklyInsightsCard } from '../components/common/WeeklyInsightsCard'
import { supportiveQuotes } from '../data/quotes'
import { useSettings } from '../context/SettingsContext'
import { useMockLoading } from '../hooks/useMockLoading'
import { generateWeeklyInsights } from '../utils/weeklyInsights'

type PeriodLog = {
  _id: string
  userId?: string
  startDate?: string
  endDate?: string
  cycleLength?: number
  painLevel?: number
  mood?: string
  createdAt?: string
}

type Reminder = {
  _id: string
  userId?: string
  name?: string
  medicineName?: string
  times?: string[]
  active?: boolean
  startDate?: string
  endDate?: string
}

type Journal = {
  _id: string
  text: string
  mood: string
  stress: number
  energy: number
  createdAt: string
}

type ChartPoint = {
  date: string
  stress: number
}


const pickRandomQuote = () => {
  if (supportiveQuotes.length === 0) return 'Take care of your body 🌸'
  return supportiveQuotes[Math.floor(Math.random() * supportiveQuotes.length)].text
}

export const DashboardPage = () => {
  const loading = useMockLoading(700)
  const { settings } = useSettings()

  const [quote, setQuote] = useState('')
  const [periodLogs, setPeriodLogs] = useState<PeriodLog[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [journals, setJournals] = useState<Journal[]>([])
const [nextCycle, setNextCycle] = useState<string | null>(null)
const [currentCycle, setCurrentCycle] = useState(false)
  const getNewQuote = () => {
    setQuote(pickRandomQuote())
  }
  const parseLocalDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-').map(Number)

  return new Date(year, month - 1, day)
}
  useEffect(() => {
    getNewQuote()
  }, [])

useEffect(() => {
  console.log('Dashboard mounted')

  const fetchData = async () => {
    console.log('Fetching data...')

    try {
          const storedUserId = localStorage.getItem('userId')

            if (!storedUserId) {
              console.error('No userId found')
              return
            }
      const [periodRes, reminderRes, journalRes] = await Promise.all([
       fetch(`http://localhost:5000/period-logs/${storedUserId}`),
fetch(`http://localhost:5000/api/medicine-reminders/${storedUserId}`),
fetch(`http://localhost:5000/api/journals/user123`),
      ])

      console.log('Responses received')

      const periodData = await periodRes.json()
      const reminderData = await reminderRes.json()
      const journalData = await journalRes.json()

      console.log('PERIOD DATA:', periodData)
      console.log('REMINDER DATA:', reminderData)
      console.log('JOURNAL DATA:', journalData)

      setPeriodLogs(Array.isArray(periodData.data) ? periodData.data : [])
      
      setReminders(
  Array.isArray(reminderData.data)
    ? reminderData.data
    : [],
)
setJournals(
  Array.isArray(journalData)
    ? journalData
    : [],
)
    } catch (err) {
      console.error('Dashboard fetch error:', err)
    }
  }

  fetchData()
}, [])

  const todayReminderCount = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)

    return reminders.filter((reminder) => {
      if (reminder.active === false) return false

      const startDate = reminder.startDate ? reminder.startDate.slice(0, 10) : today
      const endDate = reminder.endDate ? reminder.endDate.slice(0, 10) : today

      return today >= startDate && today <= endDate
    }).length
  }, [reminders])

  const latestJournal = journals[0]

const latestPeriodLog = periodLogs[0]

const nextCycleText = useMemo(() => {
  if (!latestPeriodLog?.startDate) {
    return 'Add data'
  }

  const start = parseLocalDate(latestPeriodLog.startDate)

  const predicted = new Date(start)

  predicted.setDate(predicted.getDate() + 28)

  return predicted.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })
}, [latestPeriodLog])

const currentCycleText = useMemo(() => {
  if (!latestPeriodLog?.startDate || !latestPeriodLog?.endDate) {
    return 'Track your cycle'
  }

  const start = parseLocalDate(latestPeriodLog.startDate)
  const end = parseLocalDate(latestPeriodLog.endDate)

  const today = new Date()

  today.setHours(0, 0, 0, 0)

  if (today >= start && today <= end) {
    return 'Currently on cycle'
  }

  return 'Predicted next cycle'
}, [latestPeriodLog])

 const weeklyInsights = useMemo(() => {
  return generateWeeklyInsights({
    moodScores: journals.map((journal) => journal.stress),

    cycleLengths: periodLogs
      .map((log) => log.cycleLength)
      .filter((length): length is number => typeof length === 'number'),

    reminderTaken: reminders.map((reminder) => reminder.active ?? false),
  })
}, [journals, periodLogs, reminders])

  const chartData: ChartPoint[] = useMemo(() => {
    return journals.slice(0, 7).reverse().map((journal) => ({
      date: new Date(journal.createdAt).toLocaleDateString(),
      stress: journal.stress,
    }))
  }, [journals])

  if (!settings) {
    return (
      <PageTransition>
        <SectionHeader title="Dashboard" />
        <div className="shecare-card rounded-3xl p-5 text-sm" style={{ color: 'var(--shecare-muted)' }}>
          Loading settings...
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="mb-6">
        <SectionHeader title="Dashboard" />
      </div>

      {settings.dailyQuotes ? (
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="quote-card"
        >
          <div className="flex items-center gap-3">
            <span className="quote-icon" aria-hidden="true">
              ✨
            </span>
            <p className="quote-text">{quote}</p>
          </div>
          <button type="button" onClick={getNewQuote} className="refresh-btn" aria-label="Refresh quote">
            ↻
          </button>
        </motion.article>
      ) : null}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <motion.article
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="shecare-card rounded-3xl p-5"
          >
            <p className="text-sm" style={{ color: 'var(--shecare-muted)' }}>
              Next Cycle
            </p>
            <p className="mt-2 text-3xl font-semibold" style={{ color: 'var(--shecare-text-strong)' }}>
              {nextCycleText}
            </p>
            <p className="shecare-text-muted mt-2 text-sm">
              {currentCycleText}
            </p>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="shecare-card rounded-3xl p-5"
          >
            <p className="text-sm" style={{ color: 'var(--shecare-muted)' }}>
              Medicine Reminders
            </p>
            <p className="mt-2 text-3xl font-semibold" style={{ color: 'var(--shecare-text-strong)' }}>
              {todayReminderCount}
            </p>
            <p className="shecare-text-muted mt-2 text-sm">
              {todayReminderCount ? 'Scheduled today' : 'No reminders today'}
            </p>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="shecare-card rounded-3xl p-5"
          >
            <p className="text-sm" style={{ color: 'var(--shecare-muted)' }}>
              Mood Summary
            </p>
            <p className="mt-2 text-3xl font-semibold capitalize" style={{ color: 'var(--shecare-text-strong)' }}>
              {latestJournal ? latestJournal.mood : 'No data'}
            </p>
            <p className="shecare-text-muted mt-2 text-sm">
              {latestJournal ? `Stress: ${latestJournal.stress}/5 | Energy: ${latestJournal.energy}/5` : 'Start journaling'}
            </p>
          </motion.article>
        </div>
      )}

      <WeeklyInsightsCard insights={weeklyInsights} />

      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: settings.dailyQuotes ? 0.18 : 0.12 }}
        className="shecare-card rounded-3xl p-5"
      >
        <h3 className="text-lg font-semibold" style={{ color: 'var(--shecare-text-strong)' }}>
          Cycle Comfort Trend
        </h3>
        <p className="shecare-text-muted mb-4 text-sm">Stress trend from recent mental health journals.</p>

        <div className="h-72">
          <ResponsiveContainer>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="moodFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--shecare-chart-fill-start)" />
                  <stop offset="95%" stopColor="var(--shecare-chart-fill-end)" />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fill: 'var(--shecare-chart-axis)', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
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
              <Area type="monotone" dataKey="stress" stroke="var(--shecare-primary)" fill="url(#moodFill)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.article>
    </PageTransition>
  )
}