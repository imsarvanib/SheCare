import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageTransition } from '../components/common/PageTransition'
import { BASE_URL } from '../config/api'

export const ForgotPasswordPage = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail) {
      setError('Please enter your email address.')
      setMessage('')
      return
    }

    try {
      setIsSubmitting(true)
      setError('')
      setMessage('')

      const response = await fetch(`${BASE_URL}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: normalizedEmail }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.message ?? 'Failed to generate OTP.')
        return
      }

      setMessage(data.message ?? 'OTP sent successfully.')
      navigate('/verify-otp', { replace: true, state: { email: normalizedEmail } })
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
              Forgot Password
            </h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--shecare-text-muted)' }}>
              Enter your email to receive a one-time password.
            </p>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium" style={{ color: 'var(--shecare-text-strong)' }}>
              Email
            </span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              className="login-input w-full rounded-2xl px-4 py-3 text-sm"
              placeholder="name@shecare.com"
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
            {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
          </button>

          <p className="text-center text-xs" style={{ color: 'var(--shecare-text-strong)' }}>
            Remembered your password?{' '}
            <Link to="/login" className="font-semibold" style={{ color: 'var(--shecare-primary)' }}>
              Back to login
            </Link>
          </p>
        </form>
      </section>
    </PageTransition>
  )
}
