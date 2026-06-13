import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { PageTransition } from '../components/common/PageTransition'
import { BASE_URL } from '../config/api'

type VerifyOtpState = {
  email?: string
}

export const VerifyOtpPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as VerifyOtpState | null) ?? null
  const email = state?.email?.trim().toLowerCase() ?? ''

  const [otp, setOtp] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedOtp = otp.trim()
    if (!email) {
      setError('Missing email context. Start again from Forgot Password.')
      return
    }

    if (!trimmedOtp) {
      setError('Please enter the OTP.')
      return
    }

    try {
      setIsSubmitting(true)
      setError('')
      setMessage('')

      const response = await fetch(`${BASE_URL}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp: trimmedOtp }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.message ?? 'OTP verification failed.')
        return
      }

      setMessage(data.message ?? 'OTP verified successfully.')
      navigate('/reset-password', { replace: true, state: { email } })
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
              Verify OTP
            </h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--shecare-text-muted)' }}>
              Enter the 6-digit OTP sent for {email || 'your account'}.
            </p>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium" style={{ color: 'var(--shecare-text-strong)' }}>
              OTP
            </span>
            <input
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              type="text"
              maxLength={6}
              className="login-input w-full rounded-2xl px-4 py-3 text-sm"
              placeholder="Enter 6-digit OTP"
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
            {isSubmitting ? 'Verifying...' : 'Verify OTP'}
          </button>

          <p className="text-center text-xs" style={{ color: 'var(--shecare-text-strong)' }}>
            Need a new OTP?{' '}
            <Link to="/forgot-password" className="font-semibold" style={{ color: 'var(--shecare-primary)' }}>
              Go back
            </Link>
          </p>
        </form>
      </section>
    </PageTransition>
  )
}
