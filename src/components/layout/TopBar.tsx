import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useSettings } from '../../context/SettingsContext'
import { useState, useEffect } from 'react'

const themeOrder = ['blush', 'rose', 'dark'] as const

export const TopBar = () => {
  const { settings, setSettings } = useSettings()
  const { user, logout } = useAuth()

  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
const [currentToast, setCurrentToast] = useState<any | null>(null)

  const toggleTheme = () => {
    setSettings((prev) => {
      if (!prev) return prev
      const index = themeOrder.indexOf(prev.theme)
      return { ...prev, theme: themeOrder[(index + 1) % themeOrder.length] }
    })
  }

  const formatTime12Hour = (time: string) => {
    let [hours, minutes] = time.split(':').map(Number)
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12 || 12
    return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`
  }

  const playReminderSound = () => {
    const audio = new Audio('/notification.mp3')
    audio.play().catch((error) => {
      console.log('Sound blocked until user interacts:', error)
    })
  }

useEffect(() => {
  const getTodayLocal = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  const checkReminders = () => {
    const now = new Date()
    const today = getTodayLocal()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    const todayKey = today

    const medicineReminders = JSON.parse(
      localStorage.getItem('medicineReminders') || '[]'
    )

    const dueNotifications: any[] = []

    medicineReminders.forEach((reminder: any, reminderIndex: number) => {
      if (!reminder.active) return

      const reminderTimes = reminder.times || []

      reminderTimes.forEach((time: string) => {
        const reminderMinutes = timeToMinutes(time)

        const isTimeMatched =
          currentMinutes === reminderMinutes &&
          now.getSeconds() < 20

        const isDateMatched =
          today >= reminder.startDate && today <= reminder.endDate

        if (!isTimeMatched || !isDateMatched) return

        const reminderUniqueId =
          reminder._id || `${reminder.name}-${reminderIndex}`

        const id = `medicine-${reminderUniqueId}-${today}-${time}`
        const triggerKey = `triggered-${id}-${todayKey}`

        if (localStorage.getItem(triggerKey)) return

        localStorage.setItem(triggerKey, 'true')

        dueNotifications.push({
          id,
          title: 'Medicine Reminder',
          message: `Time to take ${reminder.name}`,
          module: 'Medicine Reminder',
          time: formatTime12Hour(time),
          read: false,
        })
      })
    })

    if (dueNotifications.length === 0) return

    setNotifications((prev) => {
      const existingIds = new Set(prev.map((n: any) => n.id))
      const fresh = dueNotifications.filter((n) => !existingIds.has(n.id))
      return [...fresh, ...prev]
    })

    dueNotifications.forEach((notification, index) => {
  setTimeout(() => {
    setCurrentToast(notification)
    playReminderSound()

    setTimeout(() => {
      setCurrentToast((current: any) =>
        current?.id === notification.id ? null : current
      )
    }, 3000)
  }, index * 4000)
})
  }

  checkReminders()
  const interval = setInterval(checkReminders, 15000)

  window.addEventListener('medicineRemindersUpdated', checkReminders)

  return () => {
    clearInterval(interval)
    window.removeEventListener('medicineRemindersUpdated', checkReminders)
  }
}, [])

  if (!settings) {
    return (
      <header className="shecare-panel flex items-center justify-between gap-3 rounded-3xl p-4">
        <div>
          <p className="font-delta text-3xl text-rose-700">Loading settings...</p>
          <p className="shecare-text-muted text-sm">Syncing your saved preferences.</p>
        </div>
        <button
          onClick={logout}
          className="shecare-button-secondary rounded-full px-4 py-2 text-sm font-medium"
        >
          Logout
        </button>
      </header>
    )
  }

  const themeLabel =
    settings.theme === 'blush'
      ? 'Blush'
      : settings.theme === 'rose'
      ? 'Rose'
      : 'Dark'

  const greetingName =
    user?.role === 'admin'
      ? 'Admin'
      : user?.name?.trim() || user?.email?.split('@')[0] || 'User'

  return (
    <>
      <header className="shecare-panel flex flex-col gap-3 rounded-3xl p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-delta text-3xl text-rose-700">
            Hello, {greetingName}
          </p>
          <p className="shecare-text-muted text-sm">
            Let's make today balanced and kind.
          </p>
        </div>

        <div className="flex items-center gap-3 relative">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowNotifications(!showNotifications)
            }}
            className="relative rounded-full bg-pink-500 px-3 py-2 text-white"
          >
            🔔
            {notifications.filter((n) => !n.read).length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 rounded-full">
                {notifications.filter((n) => !n.read).length}
              </span>
            )}
          </button>

          <button
            onClick={toggleTheme}
            className="shecare-button-secondary rounded-full px-4 py-2 text-sm"
          >
            Theme: {themeLabel}
          </button>

          <Link
            to="/app/home"
            className="shecare-button-primary rounded-full px-4 py-2 text-sm font-medium"
          >
            Home
          </Link>

          <button
            onClick={logout}
            className="shecare-button-secondary rounded-full px-4 py-2 text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </header>

      {showNotifications && (
        <>
          <div
            className="fixed inset-0 z-[10]"
            onClick={() => setShowNotifications(false)}
          />

          <div className="fixed top-20 right-6 w-80 bg-[#1a1a1a] p-4 rounded-2xl shadow-2xl border border-pink-400/20 z-[99999]">
            <h3 className="text-pink-300 font-bold mb-2">Notifications</h3>

            {notifications.length === 0 ? (
              <p className="text-sm text-pink-200">No notifications</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() =>
                    setNotifications((prev) =>
                      prev.map((item) =>
                        item.id === n.id ? { ...item, read: true } : item
                      )
                    )
                  }
                  className={`p-3 mb-2 rounded-xl cursor-pointer ${
                    n.read ? 'bg-black/20' : 'bg-pink-900/40'
                  }`}
                >
                  <p className="font-bold text-pink-200">{n.title}</p>
                  <p className="text-sm text-pink-100">{n.message}</p>
                  <p className="text-xs text-pink-300">
                    {n.module} • {n.time}
                  </p>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {currentToast && (
        <div className="fixed bottom-6 right-6 z-[999999] w-80 rounded-2xl border border-pink-400/30 bg-[#1a1a1a] p-4 shadow-2xl">
          <p className="font-bold text-pink-200">{currentToast.title}</p>
          <p className="text-sm text-pink-100">{currentToast.message}</p>
          <p className="text-xs text-pink-300">
            {currentToast.module} • {currentToast.time}
          </p>
        </div>
      )}
    </>
  )
}