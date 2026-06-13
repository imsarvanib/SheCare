import { motion } from 'framer-motion'
import type { WeeklyInsight } from '../../utils/weeklyInsights'

type WeeklyInsightsCardProps = {
  insights: WeeklyInsight[]
}

export const WeeklyInsightsCard = ({ insights }: WeeklyInsightsCardProps) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut', delay: 0.12 }}
      className="shecare-card rounded-3xl p-5"
    >
      <h3 className="text-lg font-semibold text-rose-700">Weekly Insights</h3>
      <p className="shecare-text-muted mt-1 text-sm">A quick, supportive snapshot of your week.</p>

      <div className="mt-4 space-y-3">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.28, delay: 0.16 + index * 0.06, ease: 'easeOut' }}
            className="flex items-center gap-3 rounded-2xl bg-rose-50/55 px-3 py-2"
          >
            <span className="text-base leading-none" aria-hidden="true">
              {insight.icon}
            </span>
            <p className="text-sm text-rose-700/90">{insight.text}</p>
          </motion.div>
        ))}
      </div>
    </motion.article>
  )
}