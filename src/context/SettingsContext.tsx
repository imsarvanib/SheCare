import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'
import { API_URL } from '../config/api'
import { useAuth } from '../hooks/useAuth'

export type AppTheme = 'blush' | 'rose' | 'dark'

export type AppSettings = {
  periodReminders: boolean
  medicineReminders: boolean
  cyclePredictions: boolean
  dailyQuotes: boolean
  theme: AppTheme
}

type SettingsContextValue = {
  settings: AppSettings | null
  setSettings: Dispatch<SetStateAction<AppSettings | null>>
}

const defaultSettings: AppSettings = {
  periodReminders: true,
  medicineReminders: true,
  cyclePredictions: true,
  dailyQuotes: false,
  theme: 'rose',
}

const normalizeSettings = (candidate?: Partial<AppSettings> | null): AppSettings => ({
  periodReminders: candidate?.periodReminders ?? defaultSettings.periodReminders,
  medicineReminders: candidate?.medicineReminders ?? defaultSettings.medicineReminders,
  cyclePredictions: candidate?.cyclePredictions ?? defaultSettings.cyclePredictions,
  dailyQuotes: candidate?.dailyQuotes ?? defaultSettings.dailyQuotes,
  theme: candidate?.theme ?? defaultSettings.theme,
})

const readStoredSettings = (userId?: string | null) => {
  const settingsKey = userId ? `settings_${userId}` : null

  if (!settingsKey) {
    return null
  }

  const cached = localStorage.getItem(settingsKey) ?? localStorage.getItem('settings')

  if (!cached) {
    return null
  }

  try {
    return normalizeSettings(JSON.parse(cached) as Partial<AppSettings>)
  } catch {
    localStorage.removeItem(settingsKey)
    return null
  }
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined)

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth()
  const [settings, setSettings] = useState<AppSettings | null>(null)

  const activeUserId = useMemo(() => {
    return user?.userId ?? localStorage.getItem('userId')
  }, [user?.userId])

  const getSettingsKey = (userId?: string | null) => {
    if (!userId) {
      return null
    }

    return `settings_${userId}`
  }

  useEffect(() => {
    const settingsKey = getSettingsKey(activeUserId)

    if (!settingsKey) {
      setSettings(null)
      return
    }

    const cachedSettings = readStoredSettings(activeUserId)

    if (cachedSettings) {
      setSettings(cachedSettings)
    } else {
      setSettings(null)
    }

    try {
      const legacyStored = localStorage.getItem('settings')

      if (legacyStored) {
        const migratedSettings = normalizeSettings(JSON.parse(legacyStored) as Partial<AppSettings>)
        localStorage.setItem(settingsKey, JSON.stringify(migratedSettings))
      }
    } catch {
      localStorage.removeItem(settingsKey)
    }
  }, [activeUserId])

  useEffect(() => {
    if (!settings) {
      return
    }

    const settingsKey = getSettingsKey(activeUserId)

    if (settingsKey) {
      localStorage.setItem(settingsKey, JSON.stringify(settings))
    }

    document.body.setAttribute('data-theme', settings.theme)
    document.documentElement.setAttribute('data-theme', settings.theme)
    document.body.className = settings.theme
  }, [activeUserId, settings])

  useEffect(() => {
    const syncSettingsFromBackend = async () => {
      if (!activeUserId) {
        return
      }

      try {
        const response = await fetch(`${API_URL}/profile?userId=${activeUserId}`)

        if (!response.ok) {
          return
        }

        const data = await response.json()

        if (data.success && data.profile?.settings) {
          const nextSettings = normalizeSettings(data.profile.settings as Partial<AppSettings>)
          setSettings(nextSettings)

          const settingsKey = getSettingsKey(activeUserId)
          if (settingsKey) {
            localStorage.setItem(settingsKey, JSON.stringify(nextSettings))
          }
        }
      } catch (error) {
        console.error('SETTINGS SYNC ERROR:', error)
      }
    }

    syncSettingsFromBackend()
  }, [activeUserId])

  return <SettingsContext.Provider value={{ settings, setSettings }}>{children}</SettingsContext.Provider>
}

export const useSettings = () => {
  const context = useContext(SettingsContext)

  if (!context) {
    throw new Error('useSettings must be used inside SettingsProvider')
  }

  return context
}