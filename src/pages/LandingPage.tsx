import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { BrandMark } from '../components/common/BrandMark'
import { PageTransition } from '../components/common/PageTransition'

export const LandingPage = () => {
  const modules = [
    {
      title: 'Dashboard',
      description: 'Your main wellness overview and daily health hub.',
      path: '/app/dashboard',
      primary: true,
    },
    {
      title: 'Period Tracker',
      description: 'Log cycles, symptoms, and prediction trends with clarity.',
      path: '/app/period-tracker',
    },
    {
      title: 'Pregnancy Care',
      description: 'Follow week-by-week milestones with guided support.',
      path: '/app/pregnancy-care',
    },
    {
      title: 'Medicine Reminder',
      description: 'Stay consistent with elegant, daily medication schedules.',
      path: '/app/medicine-reminder',
    },
    {
      title: 'PCOS/PCOD Tracker',
      description: 'Track symptoms and discover personalized insights.',
      path: '/app/pcos-tracker',
    },
    {
      title: 'Mental Health',
      description: 'Monitor mood and access supportive wellness content.',
      path: '/app/mental-health',
    },
    {
      title: 'Healthcare Schemes',
      description: 'Find eligibility-based schemes with quick filtering.',
      path: '/app/schemes',
    },
    {
      title: 'Profile',
      description: 'Manage personal information and app preferences.',
      path: '/app/profile',
    },
  ]

  return (
    <PageTransition>
      <section className="mx-auto flex min-h-screen w-full max-w-[1200px] flex-col justify-center gap-10 px-4 py-8 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="shecare-panel-strong rounded-[2.5rem] bg-gradient-to-r from-white/85 via-white/75 to-white/70 p-8 md:p-12"
        >
          <BrandMark size="sm" />
          <h1 className="mt-4 font-delta text-5xl leading-tight text-rose-700 md:text-7xl">
            Your Complete Women's Health Companion
          </h1>
          <p className="shecare-text-muted mt-4 max-w-2xl md:text-lg">
            Unified support for periods, pregnancy, medicine, PCOS, emotional wellness, and healthcare access.
          </p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-5 font-delta text-3xl text-rose-700 md:text-4xl"
          >
            All your health. One place.
          </motion.p>
        </motion.div>

        <div className="space-y-4">
          <h2 className="font-delta text-4xl text-rose-700">Explore All Modules</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((module, index) => (
              <motion.div
                key={module.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index, duration: 0.24, ease: 'easeInOut' }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.99 }}
              >
                <Link
                  to={module.path}
                  className={`block h-full rounded-3xl border bg-white/95 p-5 shadow-[0_14px_36px_rgba(231,84,128,0.11)] transition duration-200 ease-in-out hover:-translate-y-1 hover:bg-rose-50 hover:shadow-[0_18px_42px_rgba(231,84,128,0.16)] ${
                    module.primary
                      ? 'border-rose-200 bg-rose-50 shadow-[0_16px_34px_rgba(231,84,128,0.13)] ring-1 ring-rose-100 cursor-pointer'
                      : 'border-rose-100'
                  }`}
                >
                  <p className={`text-xs uppercase tracking-[0.2em] ${module.primary ? 'text-rose-500' : 'text-rose-500'}`}>
                    {module.primary ? 'Primary Action' : 'Module'}
                  </p>
                  <h3 className={`mt-2 text-xl font-semibold ${module.primary ? 'text-rose-800' : 'text-rose-700'}`}>
                    {module.title}
                  </h3>
                  <p className={`mt-2 text-sm ${module.primary ? 'text-rose-700/75' : 'text-rose-700/70'}`}>{module.description}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </PageTransition>
  )
}
