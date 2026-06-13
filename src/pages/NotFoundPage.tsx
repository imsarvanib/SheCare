import { Link } from 'react-router-dom'
import { PageTransition } from '../components/common/PageTransition'

export const NotFoundPage = () => {
  return (
    <PageTransition>
      <section className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <h1 className="font-delta text-6xl text-rose-700">Oops</h1>
        <p className="text-rose-700/70">The page you requested was not found.</p>
        <Link to="/" className="rounded-full bg-rose-500 px-6 py-2.5 text-sm font-medium text-white">
          Return Home
        </Link>
      </section>
    </PageTransition>
  )
}
