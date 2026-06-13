export type MoodTag = 'happy' | 'sad' | 'anxious' | 'tired' | 'motivated' | 'calm' | 'stressed'
export type UserRole = 'user' | 'admin'

export interface AuthUser {
  userId?: string
  name: string
  email: string
  role: UserRole
  settings?: Record<string, unknown>
}

export interface NavItem {
  label: string
  path: string
}

export interface FeatureCard {
  title: string
  description: string
  tag: string
}

export interface Quote {
  id: string
  text: string
  author: string
  tags: MoodTag[]
}

export interface Scheme {
  _id?: string
  id?: string
  name: string
  ageRange: string
  eligibility: string
  description: string
  benefits?: string
  category?: string
  officialLink?: string
  source?: string
  summary?: string
}
