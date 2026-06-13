import { AnimatePresence } from 'framer-motion'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { ScrollToTop } from './components/common/ScrollToTop'
import { RequireAuth } from './components/common/RequireAuth'
import { RequireRole } from './components/common/RequireRole'
import { AppLayout } from './layouts/AppLayout'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { DashboardPage } from './pages/DashboardPage'
import { LandingPage } from './pages/LandingPage'
import { MedicineReminderPage } from './pages/MedicineReminderPage'
import { MentalHealthPage } from './pages/MentalHealthPage'
import { PcosTrackerPage } from './pages/PcosTrackerPage'
import { PeriodTrackerPage } from './pages/PeriodTrackerPage'
import { PregnancyCarePage } from './pages/PregnancyCarePage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { LoginPage } from './pages/LoginPage'
import { ProfilePage } from './pages/ProfilePage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { SchemesPage } from './pages/SchemesPage'
import { SignupPage } from './pages/SignupPage'
import { VerifyOtpPage } from './pages/VerifyOtpPage'
import { useAuth } from './hooks/useAuth'
import { SettingsProvider } from './context/SettingsContext'

function App() {
  const location = useLocation()
  const { isAuthenticated, isAdmin } = useAuth()

  return (
    <SettingsProvider>
      <AnimatePresence mode="wait">
        <ScrollToTop />
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route element={<RequireAuth />}>
            <Route path="/app" element={isAuthenticated && isAdmin ? <Navigate to="/app/admin-dashboard" replace /> : <Navigate to="/app/dashboard" replace />} />
            <Route path="/app" element={<AppLayout />}>
              <Route index element={isAdmin ? <Navigate to="admin-dashboard" replace /> : <Navigate to="dashboard" replace />} />
              <Route path="home" element={<LandingPage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="wellness-dashboard" element={<Navigate to="dashboard" replace />} />
              <Route path="period-tracker" element={<PeriodTrackerPage />} />
              <Route path="pregnancy-care" element={<PregnancyCarePage />} />
              <Route path="medicine-reminder" element={<MedicineReminderPage />} />
              <Route path="pcos-tracker" element={<PcosTrackerPage />} />
              <Route path="mental-health" element={<MentalHealthPage />} />
              <Route path="schemes" element={<SchemesPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route element={<RequireRole allowedRole="admin" />}>
                <Route path="admin-dashboard" element={<AdminDashboardPage />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AnimatePresence>
    </SettingsProvider>
  )
}

export default App
