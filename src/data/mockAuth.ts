import type { UserRole } from '../types'

export interface MockLoginAccount {
  email: string
  password: string
  role: UserRole
}

export const mockLoginAccounts: MockLoginAccount[] = [
  {
    email: 'user@shecare.com',
    password: 'user123',
    role: 'user',
  },
  {
    email: 'admin@shecare.com',
    password: 'admin123',
    role: 'admin',
  },
]