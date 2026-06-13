import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import type { UserRole } from '../../types'

export const RequireRole = ({ allowedRole }: { allowedRole: UserRole }) => {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== allowedRole) {
    return <Navigate to="/app/dashboard" replace />
  }

  return <Outlet />
}