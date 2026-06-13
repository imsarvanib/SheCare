/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import type { AuthUser, UserRole } from '../types'
import { API_URL } from '../config/api'
interface LoginResult {
  success: boolean
  message?: string
  role?: UserRole
}

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  setUser: Dispatch<SetStateAction<AuthUser | null>>
  login: (email: string, password: string) => Promise<LoginResult>
  logout: () => void
  isAdmin: boolean
}

const AUTH_STORAGE_KEY = 'shecare-auth-state'
const USER_STORAGE_KEY = 'user'

const readStoredUser = () => {
  const storedUser = window.localStorage.getItem(USER_STORAGE_KEY) ?? window.localStorage.getItem(AUTH_STORAGE_KEY)

  if (!storedUser) {
    return null
  }

  try {
    const parsedUser = JSON.parse(storedUser) as AuthUser
    if (parsedUser.email && parsedUser.role) {
      return {
        userId: parsedUser.userId,
        name: parsedUser.name ?? '',
        email: parsedUser.email,
        role: parsedUser.role,
        settings: parsedUser.settings ?? {},
      }
    }
  } catch {
    window.localStorage.removeItem(USER_STORAGE_KEY)
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  return null
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser())
  const isAuthenticated = Boolean(user)

  const login = async (email: string, password: string): Promise<LoginResult> => {
    console.log('LOGIN CLICKED')
    console.log('Email:', email)
    console.log('Password:', password)

    try {
      console.log('Sending login to:', `${API_URL}/login`)
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      console.log('LOGIN RESPONSE STATUS:', response.status)

      const data = await response.json()
      console.log('LOGIN RESPONSE DATA:', data)

      if (data.success) {
        console.log('LOGIN SUCCESS')

        const nextUser = {
          userId: data.user._id,
          name: data.user.name || '',
          email: data.user.email,
          role: data.user.role,
          settings: data.user.settings ?? {},
        }

        window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser))
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser))
        window.localStorage.setItem('userId', nextUser.userId || '')
        window.localStorage.setItem('email', nextUser.email)
        window.localStorage.setItem('name', nextUser.name || '')
        window.localStorage.setItem('role', nextUser.role)
        setUser(nextUser)

        return { success: true, role: data.user.role }
      }

      console.log('LOGIN FAILED:', data.message)

      return {
        success: false,
        message: data.message || 'Login failed',
      }
    } catch (error) {
      console.error('LOGIN ERROR:', error)
      return { success: false, message: 'Network error' }
    }
  }

  const logout = () => {
    setUser(null)
    window.localStorage.removeItem(USER_STORAGE_KEY)
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    window.localStorage.removeItem('userId')
    window.localStorage.removeItem('email')
    window.localStorage.removeItem('name')
    window.localStorage.removeItem('role')
  }

  const isAdmin = user?.role === 'admin'

  return <AuthContext.Provider value={{ user, isAuthenticated, setUser, login, logout, isAdmin }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}