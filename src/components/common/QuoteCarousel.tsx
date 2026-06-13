import { motion } from 'framer-motion'
import type { Quote } from '../../types'

interface QuoteCarouselProps {
  quotes: Quote[]
  favorites: string[]
  onFavorite: (id: string) => void
}

export const QuoteCarousel = ({ quotes, favorites, onFavorite }: QuoteCarouselProps) => {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-3">
      <motion.div
        className="flex min-w-max gap-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
        }}
      >
        {quotes.map((quote) => (
          <motion.article
            key={quote.id}
            variants={{ hidden: { opacity: 0, x: 12 }, visible: { opacity: 1, x: 0 } }}
            className="shecare-card w-[320px] rounded-3xl p-6"
          >
            <p className="font-delta text-2xl leading-relaxed text-rose-700">"{quote.text}"</p>
            <div className="shecare-text-muted mt-4 flex items-center justify-between text-sm">
              <span>{quote.author}</span>
              <button
                onClick={() => onFavorite(quote.id)}
                className="shecare-button-secondary rounded-full px-4 py-1"
              >
                {favorites.includes(quote.id) ? 'Favorited' : 'Save quote'}
              </button>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </div>
  )
}
