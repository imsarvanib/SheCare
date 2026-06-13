import { motion } from 'framer-motion'
import { useState } from 'react'
import { PageTransition } from '../components/common/PageTransition'
import { SectionHeader } from '../components/common/SectionHeader'

interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
  status: 'active' | 'inactive'
  joinDate: string
}

interface Quote {
  id: string
  text: string
  author: string
}

interface Scheme {
  id: string
  name: string
  ageRange: string
  eligibility: string
}

export const AdminDashboardPage = () => {
  const stats = [
    { label: 'Active Users', value: '1.2k' },
    { label: 'Tracked Cycles', value: '4.8k' },
    { label: 'Reminder Engagement', value: '92%' },
  ]

  // State management
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'Sarah Chen', email: 'sarah@example.com', role: 'user', status: 'active', joinDate: '2026-01-15' },
    { id: '2', name: 'Emma Wilson', email: 'emma@example.com', role: 'user', status: 'active', joinDate: '2026-02-20' },
    { id: '3', name: 'Priya Sharma', email: 'priya@example.com', role: 'user', status: 'inactive', joinDate: '2026-03-10' },
  ])

  const [quotes, setQuotes] = useState<Quote[]>([
    { id: '1', text: 'You are stronger than you think', author: 'Unknown' },
    { id: '2', text: 'Self-care is not selfish', author: 'Anonymous' },
  ])

  const [schemes, setSchemes] = useState<Scheme[]>([
    { id: '1', name: 'Health Plus', ageRange: '18-30', eligibility: 'Students and young professionals' },
    { id: '2', name: 'Women Wellness', ageRange: '25-50', eligibility: 'Working women' },
  ])

  const [userSearch, setUserSearch] = useState('')
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [featuresEnabled, setFeaturesEnabled] = useState(true)

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearch.toLowerCase())
  )

  const deleteUser = (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter((u) => u.id !== id))
    }
  }

  const toggleUserStatus = (id: string) => {
    setUsers(users.map((u) => (u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u)))
  }

  const deleteQuote = (id: string) => {
    setQuotes(quotes.filter((q) => q.id !== id))
  }

  const deleteScheme = (id: string) => {
    setSchemes(schemes.filter((s) => s.id !== id))
  }

  return (
    <PageTransition>
      <SectionHeader title="Admin Dashboard" subtitle="Manage users, content, and system settings." />

      {/* STATS OVERVIEW */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, index) => (
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

      {/* USER MANAGEMENT */}
      <motion.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="shecare-card rounded-3xl p-6"
      >
        <div className="flex items-center justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--shecare-text-strong)' }}>
            User Management
          </h3>
          <span className="text-sm px-3 py-1 rounded-full bg-rose-100 text-rose-700">
            {users.length} users
          </span>
        </div>

        <input
          type="text"
          placeholder="Search users by name or email..."
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
          className="shecare-input w-full rounded-2xl px-4 py-2.5 mb-4 text-sm"
        />

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--shecare-border)' }}>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--shecare-text-strong)' }}>Name</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--shecare-text-strong)' }}>Email</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--shecare-text-strong)' }}>Role</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--shecare-text-strong)' }}>Status</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: 'var(--shecare-text-strong)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b hover:bg-rose-50/30 transition" style={{ borderColor: 'var(--shecare-border)' }}>
                  <td className="py-3 px-4" style={{ color: 'var(--shecare-text)' }}>{user.name}</td>
                  <td className="py-3 px-4 shecare-text-muted">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-rose-100 text-rose-700">
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => toggleUserStatus(user.id)}
                      className={`px-2 py-1 rounded text-xs font-medium transition ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {user.status}
                    </button>
                  </td>
                  <td className="py-3 px-4 space-x-2">
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="px-3 py-1 rounded text-xs font-medium bg-rose-100 text-rose-700 hover:bg-rose-200 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.article>

      {/* CONTENT MANAGEMENT */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* QUOTES */}
        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="shecare-card rounded-3xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--shecare-text-strong)' }}>
            Mental Health Quotes
          </h3>

          <div className="space-y-3">
            {quotes.map((quote) => (
              <div key={quote.id} className="p-4 rounded-2xl border" style={{ borderColor: 'var(--shecare-border)', background: 'var(--shecare-primary-soft)' }}>
                <p className="text-sm" style={{ color: 'var(--shecare-text)' }}>"{quote.text}"</p>
                <p className="shecare-text-muted text-xs mt-2">— {quote.author}</p>
                <button
                  onClick={() => deleteQuote(quote.id)}
                  className="mt-2 text-xs px-2 py-1 rounded bg-rose-100 text-rose-700 hover:bg-rose-200 transition"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>

          <button className="mt-4 w-full py-2 rounded-2xl text-sm font-medium shecare-button-secondary">
            + Add Quote
          </button>
        </motion.article>

        {/* SCHEMES */}
        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="shecare-card rounded-3xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--shecare-text-strong)' }}>
            Healthcare Schemes
          </h3>

          <div className="space-y-3">
            {schemes.map((scheme) => (
              <div key={scheme.id} className="p-4 rounded-2xl border" style={{ borderColor: 'var(--shecare-border)', background: 'var(--shecare-primary-soft)' }}>
                <p className="font-medium text-sm" style={{ color: 'var(--shecare-text-strong)' }}>{scheme.name}</p>
                <p className="shecare-text-muted text-xs mt-1">{scheme.ageRange}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--shecare-text)' }}>{scheme.eligibility}</p>
                <button
                  onClick={() => deleteScheme(scheme.id)}
                  className="mt-2 text-xs px-2 py-1 rounded bg-rose-100 text-rose-700 hover:bg-rose-200 transition"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>

          <button className="mt-4 w-full py-2 rounded-2xl text-sm font-medium shecare-button-secondary">
            + Add Scheme
          </button>
        </motion.article>
      </div>

      {/* ACTIVITY LOG */}
      <motion.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="shecare-card rounded-3xl p-6"
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--shecare-text-strong)' }}>
          Recent Activity
        </h3>

        <div className="space-y-2">
          <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'var(--shecare-primary-soft)' }}>
            <span className="text-xl">👤</span>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--shecare-text-strong)' }}>New user registered</p>
              <p className="shecare-text-muted text-xs">Sarah Chen joined 2 hours ago</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'var(--shecare-primary-soft)' }}>
            <span className="text-xl">📝</span>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--shecare-text-strong)' }}>Period log created</p>
              <p className="shecare-text-muted text-xs">3 logs added today</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'var(--shecare-primary-soft)' }}>
            <span className="text-xl">🔔</span>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--shecare-text-strong)' }}>Medicine reminder set</p>
              <p className="shecare-text-muted text-xs">5 reminders created this week</p>
            </div>
          </div>
        </div>
      </motion.article>

      {/* SYSTEM SETTINGS */}
      <motion.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="shecare-card rounded-3xl p-6"
      >
        <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--shecare-text-strong)' }}>
          System Settings
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl border" style={{ borderColor: 'var(--shecare-border)' }}>
            <div>
              <p className="font-medium text-sm" style={{ color: 'var(--shecare-text-strong)' }}>Notifications</p>
              <p className="shecare-text-muted text-xs">Enable system notifications</p>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-12 h-6 rounded-full transition ${
                notificationsEnabled ? 'bg-rose-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition transform ${
                  notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl border" style={{ borderColor: 'var(--shecare-border)' }}>
            <div>
              <p className="font-medium text-sm" style={{ color: 'var(--shecare-text-strong)' }}>Premium Features</p>
              <p className="shecare-text-muted text-xs">Enable premium functionality</p>
            </div>
            <button
              onClick={() => setFeaturesEnabled(!featuresEnabled)}
              className={`w-12 h-6 rounded-full transition ${
                featuresEnabled ? 'bg-rose-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition transform ${
                  featuresEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </motion.article>
    </PageTransition>
  )
}