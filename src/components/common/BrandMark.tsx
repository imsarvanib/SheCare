import { useId } from 'react'
import { motion } from 'framer-motion'

interface BrandMarkProps {
  size?: 'sm' | 'md'
}

export const BrandMark = ({ size = 'md' }: BrandMarkProps) => {
  const isSmall = size === 'sm'
  const textSizeClass = isSmall ? 'text-2xl' : 'text-3xl'
  const lotusSizeClass = isSmall ? 'h-10 w-[4.5rem]' : 'h-12 w-[5.25rem]'
  const gradientId = useId()
  const filterId = useId()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="group relative inline-flex items-center justify-center"
    >
      <motion.svg
        aria-hidden="true"
        viewBox="0 0 160 100"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.05 }}
        className={`absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-[60%] ${lotusSizeClass}`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ee9fbb" stopOpacity="1" />
            <stop offset="100%" stopColor="#cc5d85" stopOpacity="1" />
          </linearGradient>
          <filter id={filterId} x="-15%" y="-15%" width="130%" height="130%">
            <feGaussianBlur stdDeviation="0.22" />
          </filter>
        </defs>
        <g
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${filterId})`}
          opacity="0.34"
        >
          <path d="M80 16c8 9 11 18 10 26-1 7-4 12-10 17-6-5-9-10-10-17-1-8 2-17 10-26Z" />
          <path d="M58 20c7 4 11 10 13 17 2 7 0 13-4 18-7-2-11-6-13-12-2-7-1-14 4-23Z" />
          <path d="M102 20c5 9 6 16 4 23-2 6-6 10-13 12-4-5-6-11-4-18 2-7 6-13 13-17Z" />
          <path d="M42 35c7 3 12 8 15 13 3 6 3 11 0 16-7 0-12-2-15-7-4-5-4-11 0-22Z" />
          <path d="M118 35c4 11 4 17 0 22-3 5-8 7-15 7-3-5-3-10 0-16 3-5 8-10 15-13Z" />
          <path d="M66 28c4 4 6 8 6 13 0 4-2 8-6 11-4-3-5-7-5-11 0-5 2-9 5-13Z" />
          <path d="M94 28c3 4 5 8 5 13 0 4-1 8-5 11-4-3-6-7-6-11 0-5 2-9 6-13Z" />
        </g>
      </motion.svg>

      <span className={`relative z-10 font-delta ${textSizeClass} text-rose-700`}>SheCare</span>
    </motion.div>
  )
}