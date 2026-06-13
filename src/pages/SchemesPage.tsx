import { useEffect, useMemo, useState } from 'react'
import { PageTransition } from '../components/common/PageTransition'
import { SectionHeader } from '../components/common/SectionHeader'

type Scheme = {
  _id: string
  name: string
  ageRange: string
  description: string
  eligibility: string
  benefits: string
  category: string
  officialLink: string
  source: string
}

export const SchemesPage = () => {
  const [schemes, setSchemes] = useState<Scheme[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/schemes')

        if (!res.ok) {
          throw new Error('Failed to fetch schemes')
        }

        const data = await res.json()
        setSchemes(data)
      } catch (err) {
        setError('Unable to load healthcare schemes')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchSchemes()
  }, [])

  const categories = useMemo(() => {
    return ['All', ...new Set(schemes.map((scheme) => scheme.category).filter(Boolean))]
  }, [schemes])

  const filteredSchemes = schemes.filter((scheme) => {
    const matchesSearch =
      scheme.name.toLowerCase().includes(search.toLowerCase()) ||
      scheme.description.toLowerCase().includes(search.toLowerCase()) ||
      scheme.eligibility.toLowerCase().includes(search.toLowerCase())

    const matchesCategory = category === 'All' || scheme.category === category

    return matchesSearch && matchesCategory
  })

  return (
    <PageTransition>
      <div className="w-full max-w-6xl mx-auto px-4 space-y-6">
        <SectionHeader
          title="Healthcare Schemes"
          subtitle="Explore verified government healthcare schemes and benefits."
        />

        <div className="rounded-3xl border border-rose-100 bg-white p-5 shadow-[0_14px_34px_rgba(231,84,128,0.10)]">
          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="text"
              placeholder="Search schemes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-rose-200 bg-white px-4 py-3 text-rose-700 placeholder:text-rose-400 outline-none focus:ring-2 focus:ring-rose-200"
            />

           <div className="relative">
  <button
    type="button"
    onClick={() => setCategoryOpen((prev) => !prev)}
    className="w-full rounded-2xl border border-rose-200 bg-white px-4 py-3 text-left text-rose-700 outline-none focus:ring-2 focus:ring-rose-200"
  >
    {category}
  </button>

  {categoryOpen && (
    <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-lg">
      {categories.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => {
            setCategory(item)
            setCategoryOpen(false)
          }}
          className={`block w-full px-4 py-3 text-left text-rose-700 hover:bg-rose-100 ${
            category === item ? 'bg-rose-100 font-semibold' : ''
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  )}
</div>
          </div>
        </div>

        {loading && (
          <div className="rounded-3xl border border-rose-100 bg-white p-5 text-rose-700">
            Loading schemes...
          </div>
        )}

        {error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && filteredSchemes.length === 0 && (
          <div className="rounded-3xl border border-rose-100 bg-white p-5 text-rose-700">
            No schemes found.
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          {filteredSchemes.map((scheme) => (
            <article
              key={scheme._id}
              className="rounded-3xl border border-rose-100 bg-white p-5 shadow-[0_14px_34px_rgba(231,84,128,0.10)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                  {scheme.category}
                </span>

                <span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-semibold text-rose-600">
                  {scheme.ageRange}
                </span>
              </div>

              <h3 className="mt-4 text-xl font-semibold text-rose-700">
                {scheme.name}
              </h3>

              <p className="mt-2 text-sm text-rose-700/75">
                {scheme.description}
              </p>

              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-rose-700">Eligibility</p>
                  <p className="text-rose-700/75">{scheme.eligibility}</p>
                </div>

                <div>
                  <p className="font-semibold text-rose-700">Benefits</p>
                  <p className="text-rose-700/75">{scheme.benefits}</p>
                </div>

                <div>
                  <p className="font-semibold text-rose-700">Source</p>
                  <p className="text-rose-700/75">{scheme.source}</p>
                </div>
              </div>

              {scheme.officialLink && (
                <a
                  href={scheme.officialLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-block rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600"
                >
                  View Official Source
                </a>
              )}
            </article>
          ))}
        </div>
      </div>
    </PageTransition>
  )
}