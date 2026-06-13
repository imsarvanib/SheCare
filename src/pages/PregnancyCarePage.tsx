import { motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useEffect, useMemo, useState } from 'react'
import { PageTransition } from '../components/common/PageTransition'
import { SectionHeader } from '../components/common/SectionHeader'
import { SkeletonCard, SkeletonRows } from '../components/common/Skeleton'
import { BASE_URL } from '../config/api'
import { weeklyGuidance } from '../utils/pregnancyTracker'
import { useAuth } from '../hooks/useAuth'

type PregnancyTrimester = 'First' | 'Second' | 'Third'

type PregnancyAppointment = {
  _id?: string
  title: string
  doctor: string
  date: string
  time: string
}

type PregnancyProfile = {
  userId: string
  lmpDate: string | null
  currentWeek: number
  trimester: PregnancyTrimester
  dueDate: string | null
  progressPercent: number
  appointments: PregnancyAppointment[]
}

const TOTAL_WEEKS = 40

const buildStorageKey = (userId: string) => `shecare-pregnancy-tracking-${userId}`

const toDateInputValue = (value: string | null | undefined) => {
  if (!value) {
    return ''
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return ''
  }

  return parsed.toISOString().slice(0, 10)
}

const formatDateDisplay = (value: string | null | undefined) => {
  if (!value) {
    return '—'
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return '—'
  }

  const day = String(parsed.getDate()).padStart(2, '0')
  const month = String(parsed.getMonth() + 1).padStart(2, '0')
  const year = parsed.getFullYear()

  return `${day}/${month}/${year}`
}
const formatAppointmentTime = (time: string) => {
  if (!time) return ''

  const [hourValue, minuteValue] = time.split(':')
  const hour = Number(hourValue)
  const minute = minuteValue || '00'

  if (Number.isNaN(hour)) return time

  const period = hour >= 12 ? 'PM' : 'AM'
  const formattedHour = hour % 12 || 12

  return `${formattedHour}:${minute} ${period}`
}

const normalizeProfile = (raw: any): PregnancyProfile => {
  const trimester = raw?.trimester === 'Second' || raw?.trimester === 'Third' ? raw.trimester : 'First'

  return {
    userId: String(raw?.userId ?? ''),
    lmpDate: raw?.lmpDate ? new Date(raw.lmpDate).toISOString() : null,
    currentWeek: Number.isFinite(Number(raw?.currentWeek)) ? Number(raw.currentWeek) : 0,
    trimester,
    dueDate: raw?.dueDate ? new Date(raw.dueDate).toISOString() : null,
    progressPercent: Number.isFinite(Number(raw?.progressPercent)) ? Number(raw.progressPercent) : 0,
    appointments: Array.isArray(raw?.appointments)
      ? raw.appointments
          .map((appointment: any) => ({
            _id: appointment?._id,
            title: String(appointment?.title ?? '').trim(),
            doctor: String(appointment?.doctor ?? '').trim(),
            date: appointment?.date ? new Date(appointment.date).toISOString() : '',
            time: String(appointment?.time ?? '').trim(),
          }))
          .filter((appointment: PregnancyAppointment) => appointment.title && appointment.doctor && appointment.date)
      : [],
  }
}

const loadStoredPregnancy = (storageKey: string): PregnancyProfile | null => {
  const raw = localStorage.getItem(storageKey)
  if (!raw) {
    return null
  }

  try {
    return normalizeProfile(JSON.parse(raw))
  } catch {
    return null
  }
}

export const PregnancyCarePage = () => {
  const { isAdmin } = useAuth()

  if (isAdmin) {
    return <AdminPregnancyInsightsView />
  }

  return <UserPregnancyTrackerView />
}

const AdminPregnancyInsightsView = () => {
  const pregnancyStats = [
    { label: 'Active Pregnancies', value: '384' },
    { label: 'High-Risk Cases', value: '12' },
    { label: 'Average Trimester', value: 'T2' },
  ]

  const trimesterDistribution = [
    { trimester: 'Trimester 1', count: 45, percentage: 12 },
    { trimester: 'Trimester 2', count: 210, percentage: 55 },
    { trimester: 'Trimester 3', count: 129, percentage: 33 },
  ]

  const riskAlerts = [
    { id: 1, patient: 'Sarah M.', risk: 'High', condition: 'Gestational Diabetes' },
    { id: 2, patient: 'Emma L.', risk: 'Medium', condition: 'Elevated BP' },
    { id: 3, patient: 'Priya S.', risk: 'High', condition: 'Low Platelets' },
  ]

  return (
    <PageTransition>
      <SectionHeader title="Admin Pregnancy Insights" subtitle="Aggregate pregnancy tracking and risk management across all users." />
      
      <div className="grid gap-4 md:grid-cols-3">
        {pregnancyStats.map((stat, index) => (
          <motion.article
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * index }}
            className="shecare-card rounded-3xl p-5"
          >
            <p className="text-sm text-rose-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold text-rose-700">{stat.value}</p>
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
            Trimester Distribution
          </h3>
          <div className="mt-4 space-y-3">
            {trimesterDistribution.map((item) => (
              <div key={item.trimester}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-sm" style={{ color: 'var(--shecare-text)' }}>{item.trimester}</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--shecare-text-strong)' }}>{item.count} users</p>
                </div>
                <div className="h-3 rounded-full bg-rose-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-400 to-rose-600"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.article>

        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="shecare-card rounded-3xl p-5"
        >
          <h3 className="text-lg font-semibold" style={{ color: 'var(--shecare-text-strong)' }}>
            Pregnancy Milestones
          </h3>
          <div className="mt-4 space-y-2">
            {[
              { week: 16, title: 'Mid-pregnancy screening' },
              { week: 20, title: 'Anatomy scan' },
              { week: 28, title: 'Glucose testing' },
              { week: 36, title: 'Final positioning check' },
            ].map((milestone) => (
              <div key={milestone.week} className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: 'var(--shecare-primary-soft)' }}>
                <div className="w-10 h-10 rounded-full bg-rose-300 flex items-center justify-center font-semibold text-sm" style={{ color: 'var(--shecare-text-strong)' }}>W{milestone.week}</div>
                <p className="text-sm" style={{ color: 'var(--shecare-text)' }}>{milestone.title}</p>
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
          Risk Alerts
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--shecare-border)' }}>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--shecare-text-strong)' }}>Patient</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--shecare-text-strong)' }}>Risk Level</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--shecare-text-strong)' }}>Condition</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--shecare-text-strong)' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {riskAlerts.map((alert) => (
                <tr key={alert.id} className="border-b hover:bg-rose-50/30 transition" style={{ borderColor: 'var(--shecare-border)' }}>
                  <td className="py-3 px-4" style={{ color: 'var(--shecare-text)' }}>{alert.patient}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      alert.risk === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {alert.risk}
                    </span>
                  </td>
                  <td className="py-3 px-4 shecare-text-muted">{alert.condition}</td>
                  <td className="py-3 px-4">
                    <button className="px-3 py-1 rounded text-xs font-medium bg-rose-100 text-rose-700 hover:bg-rose-200 transition">
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.article>
    </PageTransition>
  )
}

const UserPregnancyTrackerView = () => {
  const { user } = useAuth()
  const userId = user?.userId ?? localStorage.getItem('userId') ?? ''
  const storageKey = userId ? buildStorageKey(userId) : 'shecare-pregnancy-tracking-anon'

  const [pregnancyData, setPregnancyData] = useState<PregnancyProfile | null>(() => loadStoredPregnancy(storageKey))
  const [isLmpModalOpen, setIsLmpModalOpen] = useState(false)
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false)
  const [lmpDate, setLmpDate] = useState(toDateInputValue(pregnancyData?.lmpDate))
  const [appointmentTitle, setAppointmentTitle] = useState('')
  const [appointmentDoctor, setAppointmentDoctor] = useState('')
  const [appointmentDate, setAppointmentDate] = useState('')
  const [appointmentTime, setAppointmentTime] = useState('')
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    const hydrated = loadStoredPregnancy(storageKey)
    if (hydrated) {
      setPregnancyData(hydrated)
      setLmpDate(toDateInputValue(hydrated.lmpDate))
    }
  }, [storageKey])

  const persistPregnancyData = (nextData: PregnancyProfile) => {
    setPregnancyData(nextData)
    localStorage.setItem(storageKey, JSON.stringify(nextData))
  }

  const showSuccess = (message: string) => {
    setSaveMessage(message)
    setTimeout(() => setSaveMessage(''), 2500)
  }

  const fetchPregnancyData = async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      setError('')
      const response = await fetch(`${BASE_URL}/api/pregnancy/${userId}`)
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to load pregnancy data')
      }

      const normalized = normalizeProfile(data.data)
      persistPregnancyData(normalized)
      setLmpDate(toDateInputValue(normalized.lmpDate))
    } catch (fetchError) {
      console.error('FETCH PREGNANCY ERROR:', fetchError)
      setError('Failed to load pregnancy data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPregnancyData()
  }, [userId])

  const snapshot = useMemo(() => {
    if (!pregnancyData?.lmpDate) {
      return null
    }

    return {
      weeks: pregnancyData.currentWeek,
      trimester: pregnancyData.trimester,
      dueDateLabel: formatDateDisplay(pregnancyData.dueDate),
      progressPercent: Math.max(0, Math.min(100, Math.round(pregnancyData.progressPercent))),
      weeksLeft: Math.max(0, TOTAL_WEEKS - pregnancyData.currentWeek),
    }
  }, [pregnancyData])

  const handleUpdateLmp = async () => {
    if (!userId) {
      setError('Please login again to update pregnancy data')
      return
    }

    if (!lmpDate) {
      setError('LMP date is required')
      return
    }

    const parsedLmpDate = new Date(`${lmpDate}T00:00:00`)
    if (Number.isNaN(parsedLmpDate.getTime())) {
      setError('Invalid LMP date')
      return
    }
    const today = new Date()
today.setHours(0, 0, 0, 0)
parsedLmpDate.setHours(0, 0, 0, 0)

if (parsedLmpDate > today) {
  setError('LMP date cannot be in the future')
  return
}

    try {
      setError('')
      const response = await fetch(`${BASE_URL}/api/pregnancy/lmp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          lmpDate: parsedLmpDate.toISOString(),
        }),
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update LMP')
      }

      const normalized = normalizeProfile(data.data)
      persistPregnancyData(normalized)
      setLmpDate(toDateInputValue(normalized.lmpDate))
      setIsLmpModalOpen(false)
      showSuccess('LMP updated successfully')
    } catch (saveError) {
      console.error('UPDATE LMP ERROR:', saveError)
      setError('Failed to update LMP')
    }
  }


   const resetAppointmentForm = () => {
  setEditingAppointmentId(null)
  setAppointmentTitle('')
  setAppointmentDoctor('')
  setAppointmentDate('')
  setAppointmentTime('')
  setError('')
}
  const openEditAppointmentModal = (appt: PregnancyAppointment) => {
  setEditingAppointmentId(appt._id ?? null)
  setAppointmentTitle(appt.title)
  setAppointmentDoctor(appt.doctor)
  setAppointmentDate(toDateInputValue(appt.date))
  setAppointmentTime(appt.time)
  setError('')
  setIsAppointmentModalOpen(true)
}
const handleAddAppointment = async () => {
  if (!userId) {
    setError('Please login again to update appointments')
    return
  }

  if (!appointmentTitle || !appointmentDoctor || !appointmentDate || !appointmentTime) {
    setError('All appointment fields are required')
    return
  }

  const parsedAppointmentDate = new Date(`${appointmentDate}T00:00:00`)

  if (Number.isNaN(parsedAppointmentDate.getTime())) {
    setError('Invalid appointment date')
    return
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  parsedAppointmentDate.setHours(0, 0, 0, 0)

  if (parsedAppointmentDate < today) {
    setError('Appointment date cannot be in the past')
    return
  }

  const isDuplicate = pregnancyData?.appointments?.some(
    (appt) =>
      appt.title.trim().toLowerCase() === appointmentTitle.trim().toLowerCase() &&
      appt.doctor.trim().toLowerCase() === appointmentDoctor.trim().toLowerCase() &&
      toDateInputValue(appt.date) === appointmentDate &&
      appt.time === appointmentTime &&
      appt._id !== editingAppointmentId
  )
  const appointmentTimeToMinutes = (time: string) => {
  const [hour, minute] = time.split(':').map(Number)
  return hour * 60 + minute
}

const newAppointmentMinutes = appointmentTimeToMinutes(appointmentTime)

const hasTimeConflict = pregnancyData?.appointments?.some((appt) => {
  if (appt._id === editingAppointmentId) {
    return false
  }

  if (toDateInputValue(appt.date) !== appointmentDate) {
    return false
  }

  const existingMinutes = appointmentTimeToMinutes(appt.time)
  return Math.abs(existingMinutes - newAppointmentMinutes) <= 2
})

if (hasTimeConflict) {
  setError('There is another appointment at this time')
  return
}

  if (isDuplicate) {
    setError('This appointment already exists')
    return
  }

  try {
    setError('')

    const url = editingAppointmentId
      ? `${BASE_URL}/api/pregnancy/appointment/${editingAppointmentId}`
      : `${BASE_URL}/api/pregnancy/appointment`

    const response = await fetch(url, {
      method: editingAppointmentId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        title: appointmentTitle,
        doctor: appointmentDoctor,
        date: appointmentDate,
        time: appointmentTime,
      }),
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to save appointment')
    }

    const normalized = normalizeProfile(data.data)
    persistPregnancyData(normalized)
    setIsAppointmentModalOpen(false)
    resetAppointmentForm()
    showSuccess(editingAppointmentId ? 'Appointment updated' : 'Appointment added')
  } catch (saveError) {
    console.error('ADD/EDIT APPOINTMENT ERROR:', saveError)
    setError(saveError instanceof Error ? saveError.message : 'Failed to save appointment')
  }
}
const handleDeleteAppointment = async (appointmentId?: string) => {
  if (!appointmentId) {
    setError('Appointment id missing')
    return
  }

  if (!userId) {
    setError('Please login again')
    return
  }

  if (!window.confirm('Delete this appointment?')) return

  try {
    setError('')

    const response = await fetch(`${BASE_URL}/api/pregnancy/appointment/${appointmentId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to delete appointment')
    }

    const normalized = normalizeProfile(data.data)
    persistPregnancyData(normalized)

    showSuccess('Appointment deleted')
  } catch (deleteError) {
    console.error('DELETE APPOINTMENT ERROR:', deleteError)
    setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete appointment')
  }
}
  const resetTracking = async () => {
    if (!userId) {
      setError('Please login again to reset pregnancy tracking')
      return
    }

    try {
      setError('')
      const response = await fetch(`${BASE_URL}/api/pregnancy/reset/${userId}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to reset tracking')
      }

      const normalized = normalizeProfile(data.data)
      persistPregnancyData(normalized)
      setLmpDate('')
      showSuccess('Pregnancy tracking reset')
    } catch (resetError) {
      console.error('RESET PREGNANCY ERROR:', resetError)
      setError('Failed to reset pregnancy data')
    }
  }

  const lmpModalContent = (
    <>
      <div className="medicine-modal-overlay fixed inset-0 z-[120]" />
      <div className="medicine-modal-shell fixed inset-0 z-[130] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="medicine-modal-card w-full max-w-[640px] rounded-[2rem] p-7 md:p-8"
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h3 className="medicine-modal-title text-2xl font-semibold">Update LMP</h3>
              <p className="medicine-modal-subtitle mt-1 text-sm">Set your latest menstrual date to recalculate week, trimester and due date.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsLmpModalOpen(false)}
              className="medicine-modal-close rounded-full px-3 py-1.5 text-sm font-medium"
            >
              Close
            </button>
          </div>

          <label className="block space-y-1.5">
            <span className="medicine-modal-label text-sm">Last Menstrual Period (LMP Date)</span>
           <input
  type="date"
  value={lmpDate}
  onChange={(event) => setLmpDate(event.target.value)}
  max={new Date().toISOString().split('T')[0]}
  className="medicine-modal-input w-full rounded-2xl px-4 py-2.5"
  required
/>
          </label>

          {error ? (
            <p className="mt-3 rounded-xl bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p>
          ) : null}

          <button
            type="button"
            onClick={handleUpdateLmp}
            className="medicine-modal-submit mt-6 w-full rounded-full px-5 py-3 text-sm font-semibold"
          >
            Save LMP
          </button>
        </motion.div>
      </div>
    </>
  )

  const appointmentModalContent = (
    <>
      <div className="medicine-modal-overlay fixed inset-0 z-[120]" />
      <div className="medicine-modal-shell fixed inset-0 z-[130] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="medicine-modal-card w-full max-w-[640px] rounded-[2rem] p-7 md:p-8"
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h3 className="medicine-modal-title text-2xl font-semibold">
  {editingAppointmentId ? 'Edit Appointment' : 'Add Appointment'}
</h3>
              <p className="medicine-modal-subtitle mt-1 text-sm">Appointments are saved for your account and synced after refresh.</p>
            </div>
            <button
              type="button"
              onClick={() => {
setIsAppointmentModalOpen(false)
  setError('')
}}
              className="medicine-modal-close rounded-full px-3 py-1.5 text-sm font-medium"
            >
              Close
            </button>
          </div>

          <div className="grid gap-3">
            <input
              type="text"
              value={appointmentTitle}
              onChange={(event) => setAppointmentTitle(event.target.value)}
              placeholder="Appointment title"
              className="medicine-modal-input w-full rounded-2xl px-4 py-2.5"
            />
            <input
              type="text"
              value={appointmentDoctor}
              onChange={(event) => setAppointmentDoctor(event.target.value)}
              placeholder="Doctor name"
              className="medicine-modal-input w-full rounded-2xl px-4 py-2.5"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="date"
                value={appointmentDate}
                onChange={(event) => setAppointmentDate(event.target.value)}
                className="medicine-modal-input w-full rounded-2xl px-4 py-2.5"
              />
              <input
                type="time"
                value={appointmentTime}
                onChange={(event) => setAppointmentTime(event.target.value)}
                className="medicine-modal-input w-full rounded-2xl px-4 py-2.5"
              />
            </div>
          </div>

          {error ? (
            <p className="mt-3 rounded-xl bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p>
          ) : null}

          <button
            type="button"
            onClick={handleAddAppointment}
            className="medicine-modal-submit mt-6 w-full rounded-full px-5 py-3 text-sm font-semibold"
          >
           {editingAppointmentId ? 'Update Appointment' : 'Save Appointment'}
          </button>
        </motion.div>
      </div>
    </>
  )

  return (
    <PageTransition>
      <SectionHeader title="Pregnancy Care" subtitle="Week-wise support, reminders, and appointment tracking in one place." />
      {saveMessage ? (
        <div className="mb-4 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          {saveMessage}
        </div>
      ) : null}
      {error && !isLmpModalOpen && !isAppointmentModalOpen ? (
        <div className="mb-4 rounded-2xl border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      ) : null}
      {loading ? (
        <div className="grid gap-4">
          <article className="shecare-card rounded-3xl p-5"><SkeletonCard /></article>
          <article className="shecare-card rounded-3xl p-5"><SkeletonRows /></article>
        </div>
      ) : !snapshot ? (
        <article className="shecare-card rounded-3xl p-6 text-center">
          <p className="mx-auto max-w-xl text-sm" style={{ color: 'var(--shecare-muted)' }}>
            Start by adding your LMP date. SheCare will calculate your current week, trimester, due date, and progress.
          </p>
          <button
            type="button"
            onClick={() => setIsLmpModalOpen(true)}
            className="shecare-button-primary mt-4 rounded-full px-6 py-3 text-sm font-semibold"
          >
            Track Pregnancy
          </button>
        </article>
      ) : (
        <>
          <motion.article
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="pregnancy-dashboard-card rounded-[2rem] p-6 md:p-7"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="pregnancy-eyebrow text-xs uppercase tracking-[0.2em]">Pregnancy Care</p>
                <h3 className="mt-2 font-delta text-4xl leading-tight">You are doing beautifully 🌱</h3>
                <p className="pregnancy-subtext mt-2 text-sm">Steady care and small habits are making a meaningful difference each week.</p>
              </div>
              <div className="pregnancy-illustration rounded-2xl px-4 py-2 text-2xl">👶</div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="pregnancy-stat rounded-2xl p-4">
                <p className="text-xs uppercase tracking-[0.18em]">Trimester</p>
                <p className="mt-2 text-xl font-semibold">{snapshot.trimester}</p>
              </div>
              <div className="pregnancy-stat rounded-2xl p-4">
                <p className="text-xs uppercase tracking-[0.18em]">Current Week</p>
                <p className="mt-2 text-xl font-semibold">Week {snapshot.weeks}</p>
              </div>
              <div className="pregnancy-stat rounded-2xl p-4">
                <p className="text-xs uppercase tracking-[0.18em]">LMP Date</p>
                <p className="mt-2 text-sm font-medium">{formatDateDisplay(pregnancyData?.lmpDate)}</p>
              </div>
              <div className="pregnancy-stat rounded-2xl p-4">
                <p className="text-xs uppercase tracking-[0.18em]">Due Date</p>
                <p className="mt-2 text-sm font-medium">{snapshot.dueDateLabel}</p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border p-4" style={{ borderColor: 'rgba(131,24,67,0.18)', background: 'rgba(255,255,255,0.45)' }}>
              <div className="mb-2 flex items-center justify-between text-sm" style={{ color: '#831843' }}>
                <span>Progress</span>
                <span>{snapshot.progressPercent}% complete • {snapshot.weeksLeft} weeks left</span>
              </div>
              <div className="pregnancy-progress-track relative h-3 overflow-hidden rounded-full">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${snapshot.progressPercent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="pregnancy-progress-fill h-full rounded-full"
                />
                <motion.span
                  initial={{ left: '0%' }}
                  animate={{ left: `calc(${snapshot.progressPercent}% - 8px)` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-white bg-[#ec4899] shadow-[0_0_0_4px_rgba(236,72,153,0.2)]"
                  aria-hidden="true"
                />
              </div>
              <div className="mt-2 grid grid-cols-4 text-xs" style={{ color: '#9d174d' }}>
                <span>Week 0</span>
                <span className="text-center">Week 12</span>
                <span className="text-center">Week 26</span>
                <span className="text-right">Week 40</span>
              </div>
            </div>
          </motion.article>

          <article className="shecare-card rounded-3xl p-5">
            <h4 className="text-lg font-semibold" style={{ color: 'var(--shecare-text-strong)' }}>Weekly Guidance</h4>
            <p className="shecare-text-muted mt-1 text-sm">Focused tips for your {snapshot.trimester.toLowerCase()} trimester.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {(weeklyGuidance[snapshot.weeks] || ['Take care and consult your doctor']).map((tip) => (
  <div
    key={tip}
    className="rounded-2xl border p-3"
    style={{ borderColor: 'var(--shecare-border)', background: 'var(--shecare-primary-soft)' }}
  >
    <p className="text-sm" style={{ color: 'var(--shecare-text-strong)' }}>
      {tip}
    </p>
  </div>
))}
            </div>
          </article>

          <article className="shecare-card rounded-3xl p-5">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-lg font-semibold" style={{ color: 'var(--shecare-text-strong)' }}>Upcoming Appointments</h4>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
  resetAppointmentForm()
  setIsAppointmentModalOpen(true)
}}
                  
                  className="shecare-button-secondary rounded-full px-4 py-2 text-xs font-semibold"
                >
                  Add Appointment
                </button>
                <button
                  type="button"
                  onClick={() => setIsLmpModalOpen(true)}
                  className="shecare-button-secondary rounded-full px-4 py-2 text-xs font-semibold"
                >
                  Update LMP
                </button>
              </div>
            </div>
            <div className="mt-3 space-y-3">
              {pregnancyData?.appointments?.length ? (
                pregnancyData.appointments
                  .slice()
                  .sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime())
                  .map((appt) => (
                    <div
  key={appt._id ?? `${appt.title}-${appt.date}-${appt.time}`}
  className="rounded-2xl p-4"
  style={{ background: 'var(--shecare-primary-soft)' }}
>
  <div className="flex items-start justify-between gap-3">
    <div>
      <p className="font-medium" style={{ color: 'var(--shecare-text-strong)' }}>
        {appt.title}
      </p>
      <p className="shecare-text-muted text-sm">{appt.doctor}</p>
      <p className="shecare-text-muted text-sm">
        {formatDateDisplay(appt.date)} • {formatAppointmentTime(appt.time)}
      </p>
    </div>

    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => openEditAppointmentModal(appt)}
        className="shecare-button-secondary rounded-full px-3 py-1 text-xs font-semibold"
      >
        ✏️ Edit
      </button>

      <button
  type="button"
  onClick={() => {
    console.log('DELETE CLICKED ID:', appt._id)
    handleDeleteAppointment(appt._id)
  }}
  className="rounded-full px-3 py-1 text-xs font-semibold"
  style={{ background: '#111', color: 'var(--shecare-primary)' }}
>
  Delete
</button>
    </div>
  </div>
</div>
                  ))
              ) : (
                <p className="shecare-text-muted text-sm">No appointments added yet.</p>
              )}
            </div>

            <button
              type="button"
              onClick={resetTracking}
              className="mt-4 rounded-full border px-4 py-2 text-xs font-semibold"
              style={{ borderColor: 'var(--shecare-border)', color: 'var(--shecare-text-strong)', background: 'transparent' }}
            >
              Reset Tracking
            </button>
          </article>
        </>
      )}

      {isLmpModalOpen ? createPortal(lmpModalContent, document.body) : null}
      {isAppointmentModalOpen ? createPortal(appointmentModalContent, document.body) : null}
    </PageTransition>
  )
}
