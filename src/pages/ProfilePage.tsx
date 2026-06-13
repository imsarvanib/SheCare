import { useState, useEffect } from 'react'
import { PageTransition } from '../components/common/PageTransition'
import { SectionHeader } from '../components/common/SectionHeader'
import { API_URL } from '../config/api'
import { useAuth } from '../hooks/useAuth'
import { useSettings } from '../context/SettingsContext'

type ProfileSettings = {
  periodReminders: boolean
  medicineReminders: boolean
  cyclePredictions: boolean
  dailyQuotes: boolean
  theme: 'blush' | 'rose' | 'dark'
}

const defaultSettings: ProfileSettings = {
  periodReminders: true,
  medicineReminders: true,
  cyclePredictions: true,
  dailyQuotes: false,
  theme: 'blush',
}

const normalizeProfileSettings = (settings?: Partial<ProfileSettings> | null): ProfileSettings => ({
  periodReminders: settings?.periodReminders ?? defaultSettings.periodReminders,
  medicineReminders: settings?.medicineReminders ?? defaultSettings.medicineReminders,
  cyclePredictions: settings?.cyclePredictions ?? defaultSettings.cyclePredictions,
  dailyQuotes: settings?.dailyQuotes ?? defaultSettings.dailyQuotes,
  theme: settings?.theme ?? defaultSettings.theme,
})

type BackendProfile = {
  userId: string
  name: string
  email?: string
  phone: string
  age: number | null
  city: string
  settings: ProfileSettings
}

type ProfileForm = {
  email: string
  phone: string
  age: string
  city: string
}

export const ProfilePage = () => {
  const { user, setUser } = useAuth()
  const { settings, setSettings } = useSettings()

  const [isProfileLoading, setIsProfileLoading] = useState(true)
  const [savedName, setSavedName] = useState(() => localStorage.getItem('name') || localStorage.getItem('shecare-profile-name') || '')
  const [profile, setProfile] = useState<ProfileForm>({
    email: localStorage.getItem('email') || '',
    phone: '',
    age: '',
    city: '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    if (!saveMessage) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setSaveMessage('')
    }, 2500)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [saveMessage])

  useEffect(() => {
    const fetchProfile = async () => {
      const userId = localStorage.getItem('userId')

      if (!userId) {
        setIsProfileLoading(false)
        return
      }

      try {
        console.log('Fetching profile on mount from:', `${API_URL}/profile?userId=${userId}`)
        const res = await fetch(`${API_URL}/profile?userId=${userId}`)
        console.log('FETCH PROFILE ON MOUNT STATUS:', res.status)

        if (!res.ok) {
          throw new Error('API failed')
        }

        const data = await res.json()
        console.log('FETCH PROFILE ON MOUNT DATA:', data)

        if (data.success && data.profile) {
          const nextProfile: BackendProfile = data.profile
          const nextSettings = normalizeProfileSettings({
  ...nextProfile.settings,
  theme: 'blush',
})
          const nextName = nextProfile.name ?? ''
          setProfile({
            email: nextProfile.email ?? (localStorage.getItem('email') || ''),
            phone: nextProfile.phone ?? '',
            age: nextProfile.age != null ? String(nextProfile.age) : '',
            city: nextProfile.city ?? '',
          })
          setSavedName(nextName)
          setSettings(nextSettings)
          setUser((currentUser) => {
            if (!currentUser || currentUser.name.trim()) {
              return currentUser
            }

            const nextUser = {
              ...currentUser,
              name: nextName,
              settings: nextSettings,
            }

            localStorage.setItem('user', JSON.stringify(nextUser))
            localStorage.setItem('shecare-auth-state', JSON.stringify(nextUser))
            localStorage.setItem('name', nextName)

            return nextUser
          })
        }
      } catch (error) {
        console.error('PROFILE ERROR:', error)
      } finally {
        setIsProfileLoading(false)
      }
    }

    fetchProfile()
  }, [])

  if (!settings) {
    return (
      <PageTransition>
        <div className="shecare-card rounded-3xl p-5 text-sm" style={{ color: 'var(--shecare-muted)' }}>
          Loading settings...
        </div>
      </PageTransition>
    )
  }

  const toggleSetting = async (key: 'periodReminders' | 'medicineReminders' | 'cyclePredictions' | 'dailyQuotes') => {
    const currentSettings = settings

    if (!currentSettings) {
      return
    }

    const userId = localStorage.getItem('userId')

    if (!userId) {
      setSaveError('Unable to save settings: missing user session.')
      return
    }

    const updatedSettings: ProfileSettings = {
      ...currentSettings,
      [key]: !currentSettings[key],
    }

    console.log('TOGGLE CLICK:', key, updatedSettings[key])
    console.log('SENDING TO BACKEND:', updatedSettings)

    setSettings(updatedSettings)
    setIsSavingSettings(true)
    setSaveError('')

    const settingsKey = `settings_${userId}`
    localStorage.setItem(settingsKey, JSON.stringify(updatedSettings))
    localStorage.setItem('settings', JSON.stringify(updatedSettings))

    const nextUser = user ? { ...user, settings: updatedSettings } : null
    if (nextUser) {
      setUser(nextUser)
      localStorage.setItem('user', JSON.stringify(nextUser))
      localStorage.setItem('shecare-auth-state', JSON.stringify(nextUser))
    }

    try {
      const response = await fetch(`${API_URL}/profile/settings/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: updatedSettings }),
      })

      const data = await response.json()
      console.log('RESPONSE FROM BACKEND:', data)

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to save settings')
      }

      const savedSettings = normalizeProfileSettings({
  ...(data.settings ?? data.profile?.settings),
  theme: 'blush',
})
      setSettings(savedSettings)
      localStorage.setItem(settingsKey, JSON.stringify(savedSettings))
      localStorage.setItem('settings', JSON.stringify(savedSettings))

      if (user) {
        const syncedUser = { ...user, settings: savedSettings }
        setUser(syncedUser)
        localStorage.setItem('user', JSON.stringify(syncedUser))
        localStorage.setItem('shecare-auth-state', JSON.stringify(syncedUser))
      }
    } catch (error) {
      console.error('Save failed', error)
      setSettings(currentSettings)
      localStorage.setItem(settingsKey, JSON.stringify(currentSettings))
      localStorage.setItem('settings', JSON.stringify(currentSettings))

      if (user) {
        const rolledBackUser = { ...user, settings: currentSettings }
        setUser(rolledBackUser)
        localStorage.setItem('user', JSON.stringify(rolledBackUser))
        localStorage.setItem('shecare-auth-state', JSON.stringify(rolledBackUser))
      }
    } finally {
      setIsSavingSettings(false)
    }
  }

  const updateField = (key: keyof ProfileForm, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }))
    setSaveMessage('')
    setSaveError('')
  }

  const handleSave = async () => {
    const userId = localStorage.getItem('userId')

    if (!userId) {
      setSaveError('Unable to save: missing user session.')
      return
    }

   const phoneRegex = /^[6-9]\d{9}$/;

if (!phoneRegex.test(profile.phone.trim())) {
  setSaveError('Enter valid phone number')
  return
}

    const updatedProfile = {
      name: user?.name.trim() ?? '',
      phone: profile.phone.trim(),
      age: profile.age.trim() === '' ? null : Number(profile.age),
      city: profile.city.trim(),
      settings,
    }

    // ✅ Optimistic UI: update immediately
    setProfile((prev) => ({
      ...prev,
      phone: profile.phone.trim(),
      age: profile.age.trim(),
      city: profile.city.trim(),
    }))
    setSaveMessage('Saving...')
    setSaveError('')
    setIsSaving(true)

    try {
      console.log('Sending profile update to:', `${API_URL}/profile`)
      const response = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...updatedProfile,
        }),
      })

      console.log('RESPONSE STATUS:', response.status)
      const data = await response.json()
      console.log('RESPONSE DATA:', data)

      if (data.success) {
        console.log('SAVE SUCCESS')
        setSaveMessage('Saved successfully ✅')
        setSavedName(updatedProfile.name || '')
        setUser((currentUser) => {
          if (!currentUser) {
            return currentUser
          }

          const nextUser = {
            ...currentUser,
            name: updatedProfile.name || currentUser.name,
            settings: settings ?? currentUser.settings,
          }

          localStorage.setItem('user', JSON.stringify(nextUser))
          localStorage.setItem('shecare-auth-state', JSON.stringify(nextUser))
          localStorage.setItem('name', nextUser.name)
          localStorage.setItem('shecare-profile-name', nextUser.name)

          return nextUser
        })
      } else {
        throw new Error(data.message || 'Failed to save')
      }
    } catch (error) {
      console.error('SAVE ERROR:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save ❌'
      setSaveError(errorMessage)
      // Revert to previous state on error if needed
    } finally {
      setIsSaving(false)
      // Auto-hide message after 3 seconds
      setTimeout(() => {
        setSaveMessage('')
        setSaveError('')
      }, 3000)
    }
  }

  const SettingRow = ({
    title,
    description,
    enabled,
    onToggle,
  }: {
    title: string
    description: string
    enabled: boolean
    onToggle: () => void
  }) => (
    <div
      className="flex items-start justify-between gap-4 rounded-2xl border px-4 py-4"
      style={{ borderColor: 'var(--shecare-border)', background: 'var(--shecare-primary-soft)' }}
    >
      <div className="min-w-0">
        <h4 className="text-sm font-semibold" style={{ color: 'var(--shecare-text-strong)' }}>{title}</h4>
        <p className="mt-1 text-xs leading-5" style={{ color: 'var(--shecare-muted)' }}>{description}</p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className="relative mt-0.5 h-7 w-12 rounded-full transition"
        style={{ background: enabled ? 'var(--shecare-primary)' : 'var(--shecare-primary-soft-hover)' }}
        aria-pressed={enabled}
        aria-label={title}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full shadow-sm transition ${
            enabled ? 'left-5' : 'left-0.5'
          }`}
          style={{ background: 'var(--shecare-surface-strong)' }}
        />
      </button>
    </div>
  )

  return (
    <PageTransition>
      {isProfileLoading ? (
        <div className="shecare-card rounded-3xl p-5 text-sm" style={{ color: 'var(--shecare-muted)' }}>
          Loading profile...
        </div>
      ) : null}
      <SectionHeader title="Profile" subtitle="Manage personal information and preferences." />
      <article className="shecare-card grid gap-4 rounded-3xl p-5 md:grid-cols-2">
        <label className="space-y-2 text-sm" style={{ color: 'var(--shecare-muted)' }}>
          <span className="capitalize">name</span>
          <input
            value={user?.name ?? ''}
            onChange={(event) => {
              const nextName = event.target.value
              setUser((currentUser) => {
                if (!currentUser) {
                  return currentUser
                }

                return { ...currentUser, name: nextName }
              })
            }}
            className="shecare-input w-full rounded-2xl px-4 py-2.5 outline-none"
          />
          {user?.name && user.name !== savedName ? (
            <p className="text-xs font-medium" style={{ color: 'var(--shecare-primary)' }}>
              Unsaved changes
            </p>
          ) : null}
        </label>

       {Object.entries(profile).map(([key, value]) => (
  <label key={key} className="space-y-2 text-sm" style={{ color: 'var(--shecare-muted)' }}>
    <span className="capitalize">{key}</span>

    {key === 'phone' ? (
      <>
        <input
          type="tel"
          inputMode="numeric"
          maxLength={10}
          value={profile.phone}
          onChange={(event) => {
            const nextValue = event.target.value.replace(/\D/g, '')

            if (nextValue.length <= 10) {
              updateField('phone', nextValue)
            }
          }}
          placeholder="Enter 10-digit phone number"
          className="shecare-input w-full rounded-2xl px-4 py-2.5 outline-none"
        />

        {profile.phone.length > 0 && !/^[6-9]\d{9}$/.test(profile.phone) ? (
          <p style={{ color: 'red' }}>Enter valid phone number</p>
        ) : null}
      </>
    ) : key === 'email' ? (
      <input
        value={String(value)}
        readOnly
        className="shecare-input w-full rounded-2xl px-4 py-2.5 outline-none opacity-70 cursor-not-allowed"
      />
    ) : (
      <input
        value={String(value)}
        onChange={(event) => updateField(key as keyof ProfileForm, event.target.value)}
        className="shecare-input w-full rounded-2xl px-4 py-2.5 outline-none"
      />
    )}
  </label>
))}

        <div className="md:col-span-2 flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleSave}
            disabled={
                  isSaving ||
                  isSavingSettings ||
                  !/^[6-9]\d{9}$/.test(profile.phone)
                  }
            className="shecare-button-primary rounded-full px-5 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          {isSavingSettings ? (
            <p className="text-sm font-medium" style={{ color: 'var(--shecare-primary)' }}>
              Saving preference...
            </p>
          ) : null}
          {saveMessage ? (
            <p className="text-sm font-medium" style={{ color: 'var(--shecare-primary)' }}>
              {saveMessage}
            </p>
          ) : null}
          {saveError ? (
            <p className="text-sm font-medium text-red-600">
              {saveError}
            </p>
          ) : null}
        </div>
      </article>

      <article className="shecare-card rounded-3xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--shecare-text-strong)' }}>Settings</h3>
            <p className="mt-1 text-sm" style={{ color: 'var(--shecare-muted)' }}>Fine-tune reminders, tracking, and visual preferences.</p>
          </div>
        </div>

        <div className="mt-6 space-y-8">
          <section className="space-y-3">
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--shecare-primary)' }}>Notifications</h4>
              <p className="mt-1 text-xs" style={{ color: 'var(--shecare-muted)' }}>Choose which reminders you want to receive.</p>
            </div>
            <div className="space-y-3">
              <SettingRow
                title="Period reminders"
                description="Get notified before your next cycle starts so you can plan ahead."
                enabled={settings.periodReminders}
                onToggle={() => void toggleSetting('periodReminders')}
              />
              <SettingRow
                title="Medicine reminders"
                description="Receive reminders for medicines you track in your health routine."
                enabled={settings.medicineReminders}
                onToggle={() => void toggleSetting('medicineReminders')}
              />
            </div>
          </section>

          <section className="space-y-3 border-t pt-6" style={{ borderColor: 'var(--shecare-border)' }}>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--shecare-primary)' }}>Insights & Tracking</h4>
              <p className="mt-1 text-xs" style={{ color: 'var(--shecare-muted)' }}>Control how much cycle data and predictions you see.</p>
            </div>
            <div className="space-y-3">
              <SettingRow
                title="Enable cycle predictions"
                description="Show predicted cycle dates based on your logged history."
                enabled={settings.cyclePredictions}
                onToggle={() => void toggleSetting('cyclePredictions')}
              />
            </div>
          </section>

          <section className="space-y-3 border-t pt-6" style={{ borderColor: 'var(--shecare-border)' }}>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--shecare-primary)' }}>Personalization</h4>
              <p className="mt-1 text-xs" style={{ color: 'var(--shecare-muted)' }}>Make the experience feel more like yours.</p>
            </div>
            <div className="space-y-3">
              <SettingRow
                title="Daily quotes"
                description="Show a fresh motivational quote on your dashboard each day."
                enabled={settings.dailyQuotes}
                onToggle={() => void toggleSetting('dailyQuotes')}
              />

              <div
                className="flex items-start justify-between gap-4 rounded-2xl border px-4 py-4"
                style={{ borderColor: 'var(--shecare-border)', background: 'var(--shecare-primary-soft)' }}
              >
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold" style={{ color: 'var(--shecare-text-strong)' }}>Theme selector</h4>
                  <p className="mt-1 text-xs leading-5" style={{ color: 'var(--shecare-muted)' }}>Choose the visual style that feels most comfortable.</p>
                </div>
                <select
                  value={settings.theme}
                  onChange={(event) => {
                    const nextTheme = event.target.value as ProfileSettings['theme']
                    setSettings((prev) => (prev ? { ...prev, theme: nextTheme } : prev))
                  }}
                  className="rounded-full border px-4 py-2 text-sm font-medium outline-none"
                  style={{
                    borderColor: 'var(--shecare-border)',
                    background: 'var(--shecare-surface-strong)',
                    color: 'var(--shecare-text-strong)',
                  }}
                >
                  <option value="blush">Blush</option>
                  <option value="rose">Rose</option>
                </select>
              </div>
            </div>
          </section>
        </div>
      </article>
    </PageTransition>
  )
}
