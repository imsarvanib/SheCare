import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { PageTransition } from '../components/common/PageTransition'
import { SectionHeader } from '../components/common/SectionHeader'
import { useAuth } from '../hooks/useAuth'
import { useSettings } from '../context/SettingsContext'
import { BASE_URL } from '../config/api'

const frequencyOptions = ['Once Daily', 'Twice Daily', 'Three Times', 'Weekly', 'As Needed'] as const
type Frequency = (typeof frequencyOptions)[number]

interface MedicineItem {
  _id?: string
  name: string
  dosage: string
  frequency: Frequency
  times: string[]
  startDate: string
  endDate: string
  notes: string
  active: boolean
}

export const MedicineReminderPage = () => {
  const { isAdmin } = useAuth()

  if (isAdmin) {
    return <AdminMedicationLogsView />
  }

  return <UserMedicineReminderView />
}

const AdminMedicationLogsView = () => {
  const medicationStats = [
    { label: 'Adherence Rate', value: '87%' },
    { label: 'Missed Doses', value: '2,340' },
    { label: 'Active Users', value: '1,240' },
  ]

  const mostUsedMedicines = [
    { name: 'Vitamin D Supplements', count: 540, adherence: 92 },
    { name: 'Iron Tablets', count: 480, adherence: 85 },
    { name: 'Calcium Supplements', count: 420, adherence: 78 },
    { name: 'Folic Acid', count: 380, adherence: 88 },
    { name: 'Prenatal Vitamins', count: 320, adherence: 91 },
  ]

  return (
    <PageTransition>
      <SectionHeader title="Admin Medication Logs" subtitle="Medication adherence tracking and compliance analytics." />

      <div className="grid gap-4 md:grid-cols-3">
        {medicationStats.map((stat, index) => (
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

      <motion.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="shecare-card rounded-3xl p-5"
      >
        <h3 className="text-lg font-semibold" style={{ color: 'var(--shecare-text-strong)' }}>
          Most Used Medications
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--shecare-border)' }}>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--shecare-text-strong)' }}>Medicine</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--shecare-text-strong)' }}>User Count</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--shecare-text-strong)' }}>Adherence</th>
              </tr>
            </thead>
            <tbody>
              {mostUsedMedicines.map((medicine, index) => (
                <tr key={index} className="border-b hover:bg-rose-50/30 transition" style={{ borderColor: 'var(--shecare-border)' }}>
                  <td className="py-3 px-4" style={{ color: 'var(--shecare-text)' }}>{medicine.name}</td>
                  <td className="py-3 px-4">{medicine.count}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-full h-2 rounded-full bg-rose-100 max-w-[100px]">
                        <div className="h-full bg-rose-500 rounded-full" style={{ width: `${medicine.adherence}%` }} />
                      </div>
                      <span className="text-xs font-medium" style={{ color: 'var(--shecare-text-strong)' }}>{medicine.adherence}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.article>

      <motion.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="shecare-card rounded-3xl p-5"
      >
        <h3 className="text-lg font-semibold" style={{ color: 'var(--shecare-text-strong)' }}>
          Compliance Insights
        </h3>
        <div className="mt-4 space-y-3">
          <div className="p-4 rounded-2xl border" style={{ borderColor: 'var(--shecare-border)', background: 'var(--shecare-primary-soft)' }}>
            <p className="text-sm font-medium" style={{ color: 'var(--shecare-text-strong)' }}>Peak Reminder Time</p>
            <p className="shecare-text-muted text-xs mt-1">8:00 AM - 64% of doses taken</p>
          </div>
          <div className="p-4 rounded-2xl border" style={{ borderColor: 'var(--shecare-border)', background: 'var(--shecare-primary-soft)' }}>
            <p className="text-sm font-medium" style={{ color: 'var(--shecare-text-strong)' }}>Low Adherence Window</p>
            <p className="shecare-text-muted text-xs mt-1">Evening doses (8 PM) - 12% missed</p>
          </div>
          <div className="p-4 rounded-2xl border" style={{ borderColor: 'var(--shecare-border)', background: 'var(--shecare-primary-soft)' }}>
            <p className="text-sm font-medium" style={{ color: 'var(--shecare-text-strong)' }}>Improvement Area</p>
            <p className="shecare-text-muted text-xs mt-1">Weekend compliance 15% lower than weekdays</p>
          </div>
        </div>
      </motion.article>
    </PageTransition>
  )
}

const toDateInputValue = (value: string) => {
  if (!value) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toISOString().slice(0, 10)
}

const UserMedicineReminderView = () => {
  const { settings } = useSettings()
  const { user } = useAuth()
  const userId = user?.userId ?? localStorage.getItem('userId') ?? ''
  const today = new Date().toISOString().split('T')[0]
  const [items, setItems] = useState<MedicineItem[]>([])
  const syncMedicineReminders = (updatedItems: MedicineItem[]) => {
  setItems(updatedItems)
  localStorage.setItem('medicineReminders', JSON.stringify(updatedItems))
  window.dispatchEvent(new Event('medicineRemindersUpdated'))
}
 useEffect(() => {
  window.dispatchEvent(new Event('medicineRemindersUpdated'))
}, [items])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [dosage, setDosage] = useState('')
  const [frequency, setFrequency] = useState<Frequency>('Once Daily')
  const [timeInput, setTimeInput] = useState('08:00')
  const [timeSlots, setTimeSlots] = useState<string[]>(['08:00'])
  const [startDate, setStartDate] = useState('2026-04-10')
  const [endDate, setEndDate] = useState('2026-05-10')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [saveMessage, setSaveMessage] = useState('')

const formatTime12Hour = (time?: string) => {
  if (!time || typeof time !== 'string' || !time.includes(':')) {
    return ''
  }

  let [hours, minutes] = time.split(':').map(Number)

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return ''
  }

  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12

  return `${hours}:${String(minutes).padStart(2, '0')} ${ampm}`
}
  const fetchReminders = async () => {
    if (!userId) return

    try {
      setError('')
      const response = await fetch(`${BASE_URL}/api/medicine-reminders/${userId}`)
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to load reminders')
      }

      const mappedItems = data.data.map((item: any) => ({
  _id: item._id,
  name: item.name,
  dosage: item.dosage,
  frequency: item.frequency,
  times: item.times || [],
  startDate: toDateInputValue(item.startDate),
  endDate: toDateInputValue(item.endDate),
  notes: item.notes || '',
  active: Boolean(item.active),
}))

syncMedicineReminders(mappedItems)
    } catch (err) {
      console.error('FETCH MEDICINE REMINDERS ERROR:', err)
      setError('Failed to load medicine reminders')
    }
  }

  useEffect(() => {
    fetchReminders()
  }, [userId])

  if (!settings) {
    return (
      <PageTransition>
        <div className="shecare-card rounded-3xl p-5 text-sm" style={{ color: 'var(--shecare-muted)' }}>
          Loading settings...
        </div>
      </PageTransition>
    )
  }

  const resetForm = () => {
    setEditingId(null)
    setName('')
    setDosage('')
    setFrequency('Once Daily')
    setTimeInput('08:00')
    setTimeSlots(['08:00'])
    setStartDate('2026-04-10')
    setEndDate('2026-05-10')
    setNotes('')
    setError('')
  }

  const showSuccess = (message: string) => {
    setSaveMessage(message)
    setTimeout(() => setSaveMessage(''), 2500)
  }

  const addTimeSlot = () => {
    if (!timeInput || timeSlots.includes(timeInput)) {
      return
    }

    setTimeSlots((prev) => [...prev, timeInput].sort())
  }

  const removeTimeSlot = (time: string) => {
    setTimeSlots((prev) => {
      if (prev.length === 1) {
        return prev
      }

      return prev.filter((item) => item !== time)
    })
  }

  const openEditReminder = (item: MedicineItem) => {
    setEditingId(item._id ?? null)
    setName(item.name)
    setDosage(item.dosage)
    setFrequency(item.frequency)
    setTimeSlots(item.times.length ? item.times : ['08:00'])
    setTimeInput(item.times[0] || '08:00')
    setStartDate(item.startDate)
    setEndDate(item.endDate)
    setNotes(item.notes)
    setError('')
    setIsModalOpen(true)
  }

  const saveMedicine = async () => {
    if (!userId) {
      setError('Please login again')
      return
    }

    if (!name.trim()) {
      setError('Medicine name is required')
      return
    }

    if (!dosage.trim()) {
      setError('Dosage is required')
      return
    }

    if (!startDate || !endDate) {
      setError('Start date and end date are required')
      return
    }
    const today = new Date().toISOString().slice(0, 10)

    if (startDate < today) {
      setError('Start date cannot be in the past')
      return
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError('End date must be after start date')
      return
    }
        const alreadyExists = items.some(
      (item) =>
        item._id !== editingId &&
        item.name.trim().toLowerCase() === name.trim().toLowerCase() &&
        item.times.some((time) => timeSlots.includes(time))
    )

    if (alreadyExists) {
      setError('Duplicate reminder already exists for same medicine and time')
      return
    }
    try {
      setError('')

      const url = editingId
        ? `${BASE_URL}/api/medicine-reminders/${editingId}`
        : `${BASE_URL}/api/medicine-reminders`
      console.log('MEDICINE API URL:', url)
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name: name.trim(),
          dosage: dosage.trim(),
          frequency,
          times: timeSlots,
          startDate,
          endDate,
          notes: notes.trim(),
          active: true,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to save reminder')
      }

      await fetchReminders()
      resetForm()
      setIsModalOpen(false)
      showSuccess(editingId ? 'Reminder updated' : 'Reminder added')
    } catch (err) {
      console.error('SAVE MEDICINE REMINDER ERROR:', err)
      setError(err instanceof Error ? err.message : 'Failed to save reminder')
    }
  }

  const toggleItem = async (idx: number) => {
    const item = items[idx]

    if (!item._id || !userId) {
      setError('Reminder id missing')
      return
    }

    const nextActive = !item.active

    try {
      const response = await fetch(`${BASE_URL}/api/medicine-reminders/${item._id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          active: nextActive,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update reminder')
      }

      const updatedItems = items.map((reminder, index) =>
  idx === index ? { ...reminder, active: nextActive } : reminder
)

syncMedicineReminders(updatedItems)
    } catch (err) {
      console.error('TOGGLE MEDICINE REMINDER ERROR:', err)
      setError('Failed to update reminder')
    }
  }

  const deleteReminder = async (id?: string) => {
    if (!id || !userId) {
      setError('Reminder id missing')
      return
    }

    if (!window.confirm('Delete this reminder?')) return

    try {
      const response = await fetch(`${BASE_URL}/api/medicine-reminders/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete reminder')
      }

      const updatedItems = items.filter((item) => item._id !== id)
syncMedicineReminders(updatedItems)
      showSuccess('Reminder deleted')
    } catch (err) {
      console.error('DELETE MEDICINE REMINDER ERROR:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete reminder')
    }
  }

  const modalContent = (
    <>
      <div className="medicine-modal-overlay fixed inset-0 z-[120]" />
      <div className="medicine-modal-shell fixed inset-0 z-[130] flex items-center justify-center p-4 sm:p-6">
        <div className="medicine-modal-card w-full max-w-[640px] rounded-[2rem] p-7 md:p-8 max-h-[90vh] overflow-y-auto">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h3 className="medicine-modal-title text-2xl font-semibold">
                {editingId ? 'Edit Medicine Reminder' : 'Add Medicine Reminder'}
              </h3>
              <p className="medicine-modal-subtitle mt-1 text-sm">Create a calm, clear routine with gentle reminders.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false)
                resetForm()
              }}
              className="medicine-modal-close rounded-full px-3 py-1.5 text-sm font-medium"
            >
              Close
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1.5">
              <span className="medicine-modal-label text-sm">Medicine Name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Iron Supplement"
                className="medicine-modal-input w-full rounded-2xl px-4 py-2.5"
              />
            </label>

            <label className="space-y-1.5">
              <span className="medicine-modal-label text-sm">Dosage</span>
              <input
                value={dosage}
                onChange={(event) => setDosage(event.target.value)}
                placeholder="e.g. 1 tablet"
                className="medicine-modal-input w-full rounded-2xl px-4 py-2.5"
              />
            </label>
          </div>

          <div className="mt-4 space-y-2">
            <span className="medicine-modal-label text-sm">Frequency</span>
            <div className="grid gap-2 sm:grid-cols-3">
              {frequencyOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFrequency(option)}
                  className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                    frequency === option ? 'medicine-modal-chip-active' : 'medicine-modal-chip'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <span className="medicine-modal-label text-sm">Reminder Times</span>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
  type="time"
  value={timeInput}
  onChange={(event) => {
    const newTime = event.target.value
    setTimeInput(newTime)

    setTimeSlots((prev) => {
      if (prev.length === 1) {
        return [newTime]
      }

      return prev
    })
  }}
  className="medicine-modal-input medicine-modal-time w-full rounded-2xl px-4 py-2.5"
/>
              <button
                type="button"
                onClick={addTimeSlot}
                className="medicine-modal-add-time rounded-xl px-4 py-2.5 text-sm font-medium"
              >
                + Add Time Slot
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => removeTimeSlot(slot)}
                  className="medicine-modal-chip rounded-full px-3 py-1.5 text-xs"
                  title="Remove time slot"
                >
                  {formatTime12Hour(slot)} x
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="space-y-1.5">
              <span className="medicine-modal-label text-sm">Start Date</span>
              <input
                  type="date"
                  value={startDate}
                  min={today}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="medicine-modal-input w-full rounded-2xl px-4 py-2.5"
                />
            </label>
            <label className="space-y-1.5">
              <span className="medicine-modal-label text-sm">End Date</span>
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="medicine-modal-input w-full rounded-2xl px-4 py-2.5"
              />
            </label>
          </div>

          <label className="mt-4 block space-y-1.5">
            <span className="medicine-modal-label text-sm">Notes</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              placeholder="Add any special instructions..."
              className="medicine-modal-input w-full rounded-2xl px-4 py-2.5"
            />
          </label>

          {error ? (
            <p className="mt-3 rounded-xl bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p>
          ) : null}

          <button
            type="button"
            onClick={saveMedicine}
            className="medicine-modal-submit mt-6 w-full rounded-full px-5 py-3 text-sm font-semibold"
          >
            {editingId ? 'Update Reminder' : '✨ Add Reminder'}
          </button>
        </div>
      </div>
    </>
  )

  return (
    <PageTransition>
      <SectionHeader title="Medicine Reminder" subtitle="Create medication schedules and switch reminders on or off instantly." />

      {saveMessage ? (
        <div className="mb-4 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          {saveMessage}
        </div>
      ) : null}

      {error && !isModalOpen ? (
        <div className="mb-4 rounded-2xl border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {!settings.medicineReminders ? (
        <article className="shecare-card rounded-3xl p-5">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--shecare-text-strong)' }}>Medicine reminders are off</h3>
          <p className="mt-2 text-sm" style={{ color: 'var(--shecare-muted)' }}>Enable Medicine reminders in Profile settings to show active reminders and add new ones.</p>
        </article>
      ) : (
        <>
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => {
                resetForm()
                setIsModalOpen(true)
              }}
              className="shecare-button-primary rounded-full px-5 py-2.5 text-sm font-semibold"
            >
              New Reminder
            </button>
          </div>

          {isModalOpen ? createPortal(modalContent, document.body) : null}

          <div className="space-y-3">
            {items.length === 0 ? (
              <article className="shecare-card rounded-3xl p-5">
                <p className="shecare-text-muted text-sm">No medicine reminders added yet.</p>
              </article>
            ) : (
              items.map((item, index) => (
                <article
                  key={item._id ?? `${item.name}-${index}`}
                  className="shecare-card flex items-center justify-between rounded-3xl p-4"
                >
                  <div>
                    <p className="font-medium" style={{ color: 'var(--shecare-text-strong)' }}>{item.name}</p>
                    <p className="shecare-text-muted text-sm">{item.dosage} • {item.frequency}</p>
                    <p className="shecare-text-muted text-xs">
  Times: {(item.times || []).map(formatTime12Hour).filter(Boolean).join(', ')}
</p>
                    <p className="shecare-text-muted text-xs">
                      {item.startDate} to {item.endDate}
                    </p>
                    {item.notes ? <p className="shecare-text-muted text-xs">Notes: {item.notes}</p> : null}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditReminder(item)}
                      className="shecare-button-secondary rounded-full px-3 py-1 text-xs font-semibold"
                    >
                      ✏️ Edit
                    </button>

                    <button
                      onClick={() => deleteReminder(item._id)}
                      className="rounded-full px-3 py-1 text-xs font-semibold"
                      style={{ background: '#111', color: 'var(--shecare-primary)' }}
                    >
                      Delete
                    </button>

                    <button
                      onClick={() => toggleItem(index)}
                      className={`rounded-full px-4 py-1 text-sm ${item.active ? 'shecare-button-primary' : 'shecare-button-secondary'}`}
                    >
                      {item.active ? 'On' : 'Off'}
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </>
      )}
    </PageTransition>
  )
}