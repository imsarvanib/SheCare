import { motion } from 'framer-motion'
import { Link, NavLink } from 'react-router-dom'
import { BrandMark } from '../common/BrandMark'
import { useAuth } from '../../hooks/useAuth'

interface NavItem {
  label: string
  path: string
}

export const Sidebar = () => {
  const { isAdmin } = useAuth()

  const adminNavItems: NavItem[] = [
    { label: 'Dashboard', path: '/app/admin-dashboard' },
    { label: 'Cycle Insights', path: '/app/period-tracker' },
    { label: 'Pregnancy Insights', path: '/app/pregnancy-care' },
    { label: 'Medication Logs', path: '/app/medicine-reminder' },
    { label: 'Symptom Analytics', path: '/app/pcos-tracker' },
    { label: 'Mood Analytics', path: '/app/mental-health' },
    { label: 'Schemes', path: '/app/schemes' },
    { label: 'Profile', path: '/app/profile' },
  ]

  const userNavItems: NavItem[] = [
    { label: 'Dashboard', path: '/app/dashboard' },
    { label: 'Period Tracker', path: '/app/period-tracker' },
    { label: 'Pregnancy Care', path: '/app/pregnancy-care' },
    { label: 'Medicine Reminder', path: '/app/medicine-reminder' },
    { label: 'PCOS/PCOD Tracker', path: '/app/pcos-tracker' },
    { label: 'Mental Health', path: '/app/mental-health' },
    { label: 'Healthcare Schemes', path: '/app/schemes' },
    { label: 'Profile', path: '/app/profile' },
  ]

  const navItems = isAdmin ? adminNavItems : userNavItems

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="shecare-panel-strong sticky top-4 h-[calc(100vh-2rem)] rounded-3xl p-5"
    >
      <Link to={isAdmin ? '/app/admin-dashboard' : '/app/dashboard'} className="inline-block">
        <BrandMark />
      </Link>
      <p className="shecare-text-muted mt-1 text-sm">Complete Wellness Companion</p>
      {isAdmin ? (
        <p className="mt-4 px-2 text-xs font-semibold uppercase tracking-wide text-rose-600">Admin Panel</p>
      ) : null}
      <nav className="mt-6 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block rounded-2xl px-4 py-2.5 text-sm transition ${
                isActive
                  ? 'shecare-button-secondary'
                  : 'shecare-text-muted hover:bg-[var(--shecare-primary-soft)] hover:text-[var(--shecare-text-strong)]'
              }`
            }
          >
            <span className="inline-flex items-center gap-2">
              {item.label}
              {isAdmin && item.path === '/app/profile' ? (
                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-700">
                  Admin
                </span>
              ) : null}
            </span>
          </NavLink>
        ))}
      </nav>
    </motion.aside>
  )
}
