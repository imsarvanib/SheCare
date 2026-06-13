import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { pageVariant } from '../../utils/animations'

export const PageTransition = ({ children }: { children: ReactNode }) => {
  return (
    <motion.div
      variants={pageVariant}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="relative space-y-6"
      style={{ pointerEvents: 'auto' }}
    >
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true" style={{ pointerEvents: 'none' }} />
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true" style={{ pointerEvents: 'none' }} />
      <div className="relative z-10" style={{ pointerEvents: 'auto' }}>
        {children}
      </div>
    </motion.div>
  )
}
