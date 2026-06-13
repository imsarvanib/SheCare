import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { PageTransition } from '../components/common/PageTransition'
import { BASE_URL } from '../config/api'

type ResetPasswordState = {
  email?: string
}

export const ResetPasswordPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as ResetPasswordState | null) ?? null
  const email = state?.email?.trim().toLowerCase() ?? ''

  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedPassword = newPassword.trim()

    if (!email) {
      setError('Missing email context. Start again from Forgot Password.')
      return
    }

    if (!trimmedPassword) {
      setError('Please enter a new password.')
      return
    }

    try {
      setIsSubmitting(true)
      setError('')
      setMessage('')

      const response = await fetch(`${BASE_URL}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, newPassword: trimmedPassword }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.message ?? 'Password reset failed.')
        return
      }

      setMessage(data.message ?? 'Password reset successful.')
      navigate('/login', { replace: true })
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageTransition>
      <section className="login-page min-h-screen w-full flex items-center justify-center px-4 py-10">
        <form
          onSubmit={handleSubmit}
          className="login-card login-form-card w-full max-w-md space-y-6 rounded-3xl p-8"
          style={{ background: '#fff', border: '1px solid #ffe3ea' }}
        >
          <div>
            <h1 className="font-delta text-3xl" style={{ color: 'var(--shecare-text-strong)' }}>
              Reset Password
            </h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--shecare-text-muted)' }}>
              Set a new password for {email || 'your account'}.
            </p>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium" style={{ color: 'var(--shecare-text-strong)' }}>
              New Password
            </span>
            <input
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              type="password"
              className="login-input w-full rounded-2xl px-4 py-3 text-sm"
              placeholder="Enter new password"
              required
            />
          </label>

          {error ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          ) : null}
          {message ? (
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full px-6 py-3 text-sm font-semibold text-white disabled:opacity-70"
            style={{ background: 'linear-gradient(135deg, #ff8fab, #ff5d8f)' }}
          >
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </button>

          <p className="text-center text-xs" style={{ color: 'var(--shecare-text-strong)' }}>
            Back to{' '}
            <Link to="/login" className="font-semibold" style={{ color: 'var(--shecare-primary)' }}>
              Login
            </Link>
          </p>
        </form>
      </section>
    </PageTransition>
  )
}
