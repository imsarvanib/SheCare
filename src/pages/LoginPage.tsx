import { useRef, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { BrandMark } from '../components/common/BrandMark'
import { PageTransition } from '../components/common/PageTransition'
import { useAuth } from '../hooks/useAuth'

const DASHBOARD_ROUTE = '/app/dashboard'

type PasswordToggleIconProps = {
  visible: boolean
}

const PasswordToggleIcon = ({ visible }: PasswordToggleIconProps) => {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-5 w-5"
      animate={visible ? 'visible' : 'hidden'}
      initial={false}
    >
      <motion.path
        d="M2.5 12s3.2-5.5 9.5-5.5S21.5 12 21.5 12s-3.2 5.5-9.5 5.5S2.5 12 2.5 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={{
          visible: { opacity: 1, scale: 1 },
          hidden: { opacity: 1, scale: 1 },
        }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      />
      <motion.circle
        cx="12"
        cy="12"
        r="3.1"
        stroke="currentColor"
        strokeWidth="1.6"
        variants={{
          visible: { opacity: 1, scale: 1 },
          hidden: { opacity: 0.22, scale: 0.7 },
        }}
        style={{ originX: 12, originY: 12 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      />
      <motion.path
        d="M8.1 6.8l-.9-1.2M10.1 6.1l-.2-1.4M12.2 5.8V4.4M14.3 6.1l.2-1.4M16.3 6.8l.9-1.2"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        variants={{
          visible: { opacity: 1, y: 0 },
          hidden: { opacity: 0.18, y: 0.2 },
        }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      />
      <motion.path
        d="M4.8 19.2 19.2 4.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        variants={{
          visible: { opacity: 0, scale: 0.92 },
          hidden: { opacity: 1, scale: 1 },
        }}
        style={{ originX: 12, originY: 12 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      />
    </motion.svg>
  )
}

export const LoginPage = () => {
  const navigate = useNavigate()
  const { login, isAuthenticated, user } = useAuth()
  const passwordInputRef = useRef<HTMLInputElement | null>(null)
  const passwordSelectionRef = useRef<{ start: number; end: number } | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  if (isAuthenticated && user) {
    return <Navigate to={user.role === 'admin' ? '/app/admin-dashboard' : '/app/dashboard'} replace />
  }
const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault()
  console.log('LOGIN CLICKED')
  console.log('Current path:', window.location.pathname)

  try {
    const result = await login(email, password)

    console.log('LOGIN RESULT:', result)

    if (result.success) {
      console.log('LOGIN SUCCESS → redirecting to', DASHBOARD_ROUTE)
      setErrorMessage('')
      navigate(DASHBOARD_ROUTE, { replace: true })
      return
    }

    setErrorMessage(result.message || 'Login failed')

  } catch (err) {
    console.error("LOGIN ERROR:", err)
    setErrorMessage('Login failed')
  }
}

  return (
    <PageTransition>
      <section className="login-page relative min-h-screen h-auto w-full overflow-y-auto flex items-start justify-center">

        <div className="mx-auto w-full max-w-6xl px-4 py-8 md:py-10">
          <div className="grid w-full items-center gap-6 lg:grid-cols-[1.08fr_0.92fr]">
            {/* LEFT PANEL - Branding */}
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="login-card login-brand-panel relative mx-auto flex w-full max-w-[520px] flex-col items-center justify-center gap-8 overflow-hidden"
              style={{ background: 'linear-gradient(160deg, #fff9fb 0%, #fff2f6 100%)' }}
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="login-logo"
              >
                <BrandMark />
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.6 }}
                className="welcome-text font-delta text-center leading-tight"
                style={{ color: 'var(--shecare-text-strong)' }}
              >
                Welcome back
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.6 }}
                className="shecare-text-muted text-center max-w-sm text-base md:text-lg"
              >
                Your wellness journey, safely stored and always accessible.
              </motion.p>
            </motion.article>

            {/* RIGHT PANEL - Form */}
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
              className="login-card login-form-card relative mx-auto flex w-full max-w-[480px] flex-col justify-center overflow-hidden"
            >
              <div className="w-full">
                <h2 className="font-delta text-4xl" style={{ color: 'var(--shecare-text-strong)' }}>Login</h2>

                <div className="mt-8 space-y-7">
                  <label className="block space-y-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--shecare-text-strong)' }}>Email</span>
                    <input
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      type="email"
                      placeholder="name@gmail.com"
                      className="login-input w-full rounded-2xl px-4 py-3 text-sm transition-all focus:outline-none"
                      style={{
                        background: '#ffffff',
                        border: '1px solid #ffe3ea',
                        color: 'var(--shecare-text-strong)',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#ff6f91'
                        e.target.style.boxShadow = '0 0 0 3px rgba(255, 111, 145, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#ffe3ea'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--shecare-text-strong)' }}>Password</span>
                    <div className="relative">
                      <input
                        ref={passwordInputRef}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter password"
                        className="login-input w-full rounded-2xl py-3 pl-4 pr-12 text-sm transition-all focus:outline-none"
                        style={{
                          background: '#ffffff',
                          border: '1px solid #ffe3ea',
                          color: 'var(--shecare-text-strong)',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#ff6f91'
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 111, 145, 0.1)'
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = '#ffe3ea'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                      />
                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          const input = passwordInputRef.current
                          passwordSelectionRef.current = {
                            start: input?.selectionStart ?? password.length,
                            end: input?.selectionEnd ?? password.length,
                          }

                          setShowPassword((current) => !current)

                          requestAnimationFrame(() => {
                            const updatedInput = passwordInputRef.current
                            const selection = passwordSelectionRef.current

                            if (!updatedInput || !selection) {
                              return
                            }

                            updatedInput.focus()
                            updatedInput.setSelectionRange(selection.start, selection.end)
                          })
                        }}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        aria-pressed={showPassword}
                        className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg transition-all"
                        style={{
                          color: 'var(--shecare-primary)',
                          background: '#f5f5f5',
                          border: '1px solid #ffe3ea',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#f0f0f0'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#f5f5f5'
                        }}
                      >
                        <PasswordToggleIcon visible={showPassword} />
                      </button>
                    </div>
                  </label>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => navigate('/forgot-password')}
                      className="text-xs font-medium transition hover:opacity-80"
                      style={{ color: 'var(--shecare-primary)' }}
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {errorMessage ? (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl px-4 py-3 text-sm"
                      style={{
                        background: '#fee2e2',
                        border: '1px solid #fca5a5',
                        color: '#dc2626',
                      }}
                    >
                      {errorMessage}
                    </motion.p>
                  ) : null}

                  <button
                    type="submit"
                    className="signin-btn w-full rounded-full px-6 py-3 text-sm font-semibold transition-all text-white"
                    style={{
                      display: 'block',
                      position: 'relative',
                      zIndex: 2,
                      background: 'linear-gradient(135deg, #ff8fab, #ff5d8f)',
                      boxShadow: '0 8px 20px rgba(255, 105, 135, 0.25)',
                    }}
                  >
                    Sign In
                  </button>

                  <p className="text-center text-xs" style={{ color: 'var(--shecare-text-strong)' }}>
                    Don&apos;t have an account?{' '}
                    <Link to="/signup" className="font-semibold transition hover:opacity-80" style={{ color: 'var(--shecare-primary)' }}>
                      Sign up
                    </Link>
                  </p>
                </div>
              </div>
            </motion.form>
          </div>
        </div>
      </section>
    </PageTransition>
  )
}