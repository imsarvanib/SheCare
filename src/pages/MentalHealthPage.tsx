import { useMemo, useState, useEffect } from 'react'
import { PageTransition } from '../components/common/PageTransition'
import { SectionHeader } from '../components/common/SectionHeader'
import { wellnessCards } from '../data/mockData'
import { supportiveQuotes } from '../data/quotes'
import { useSettings } from '../context/SettingsContext'
import type { MoodTag } from '../types'

const JOURNAL_API = 'http://localhost:5000/api/journals'
const SAVED_QUOTES_API = 'http://localhost:5000/api/saved-quotes'
const USER_ID = 'user123'

const moodOptions: MoodTag[] = ['happy', 'sad', 'anxious', 'tired', 'motivated', 'calm', 'stressed']

const moodEmoji: Record<MoodTag, string> = {
  happy: '😊',
  sad: '😔',
  anxious: '😰',
  tired: '😴',
  motivated: '💪',
  calm: '🧘',
  stressed: '😣',
}

type JournalEntry = {
  _id: string
  text: string
  mood: MoodTag
  stress: number
  energy: number
  createdAt: string
  updatedAt?: string
}

type QuoteItem = {
  id: string
  text: string
  tags: string[]
}

type SavedQuote = {
  _id: string
  userId: string
  quoteId: string
  text: string
  createdAt: string
}

const getRandomItems = <T,>(items: T[], count: number): T[] => {
  return [...items].sort(() => Math.random() - 0.5).slice(0, count)
}

export const MentalHealthPage = () => {
  const { settings } = useSettings()

  const [mood, setMood] = useState<MoodTag>('calm')
  const [stress, setStress] = useState(3)
  const [energy, setEnergy] = useState(3)
  const [journal, setJournal] = useState('')
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [editingJournalId, setEditingJournalId] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([])
  const [refreshKey, setRefreshKey] = useState(0)

  const autoSetLevels = (text: string, selectedMood: MoodTag) => {
    const msg = text.toLowerCase()
    let newStress = 3
    let newEnergy = 3

    switch (selectedMood) {
      case 'happy':
        newStress = 1
        newEnergy = 5
        break
      case 'sad':
        newStress = 4
        newEnergy = 2
        break
      case 'anxious':
        newStress = 5
        newEnergy = 2
        break
      case 'tired':
        newStress = 3
        newEnergy = 1
        break
      case 'motivated':
        newStress = 2
        newEnergy = 5
        break
      case 'calm':
        newStress = 1
        newEnergy = 4
        break
      case 'stressed':
        newStress = 5
        newEnergy = 2
        break
    }

    if (msg.includes('happy') || msg.includes('good') || msg.includes('great') || msg.includes('energetic')) {
      newStress = 1
      newEnergy = 5
    }

    if (msg.includes('sad') || msg.includes('lonely') || msg.includes('upset')) {
      newStress = 4
      newEnergy = 2
    }

    if (msg.includes('tired') || msg.includes('sleep') || msg.includes('exhausted')) {
      newEnergy = 1
    }

    if (
      msg.includes('exam') ||
      msg.includes('exams') ||
      msg.includes('deadline') ||
      msg.includes('pressure') ||
      msg.includes('stress') ||
      msg.includes('stressed')
    ) {
      newStress = 5
    }

    setStress(newStress)
    setEnergy(newEnergy)
  }

const fetchJournals = async () => {
  try {
    const res = await fetch(`${JOURNAL_API}/${USER_ID}`)

    const data = await res.json()

    console.log('JOURNALS:', data)

    setJournalEntries(Array.isArray(data) ? data : [])
  } catch (error) {
    console.error('Error fetching journals:', error)
  }
}

const fetchSavedQuotes = async () => {
  try {
    const res = await fetch(`${SAVED_QUOTES_API}/${USER_ID}`)

    const data = await res.json()

    console.log('QUOTES:', data)

    setSavedQuotes(Array.isArray(data) ? data : [])

    setFavorites(
      Array.isArray(data)
        ? data.map((quote: SavedQuote) => quote.quoteId)
        : [],
    )
  } catch (error) {
    console.error('Error fetching saved quotes:', error)
  }
}

  useEffect(() => {
    fetchJournals()
    fetchSavedQuotes()
  }, [])

  const handleSaveJournal = async () => {
    if (!journal.trim()) return

    try {
      const url = editingJournalId ? `${JOURNAL_API}/${editingJournalId}` : JOURNAL_API
      const method = editingJournalId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: USER_ID,
          text: journal,
          mood,
          stress,
          energy,
        }),
      })

      if (!res.ok) throw new Error('Failed to save journal')

      setJournal('')
      setEditingJournalId(null)
      fetchJournals()
    } catch (error) {
      console.error('Error saving journal:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${JOURNAL_API}/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete journal')
      fetchJournals()
    } catch (error) {
      console.error('Error deleting journal:', error)
    }
  }

  const handleEdit = (entry: JournalEntry) => {
    setJournal(entry.text)
    setMood(entry.mood)
    setStress(entry.stress)
    setEnergy(entry.energy)
    setEditingJournalId(entry._id)
  }

  const filteredQuotes = useMemo(() => {
    const matchedQuotes = supportiveQuotes.filter((quote) => {
      const moodMatch = quote.tags.includes(mood)
      const stressMatch = stress >= 4 ? quote.tags.includes('calm') || quote.tags.includes('motivated') : true
      const energyMatch = energy <= 2 ? quote.tags.includes('tired') || quote.tags.includes('calm') : true
      return moodMatch && stressMatch && energyMatch
    })

    return getRandomItems(matchedQuotes.length > 0 ? matchedQuotes : supportiveQuotes, 5) as QuoteItem[]
  }, [mood, stress, energy, refreshKey])

  const filteredTips = useMemo(() => {
    return getRandomItems(wellnessCards, 3)
  }, [mood, stress, energy, refreshKey])

  const handleSaveQuote = async (quote: QuoteItem) => {
    try {
      const alreadySaved = favorites.includes(quote.id)

      if (alreadySaved) return

      const res = await fetch(SAVED_QUOTES_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: storedUserId,
          quoteId: quote.id,
          text: quote.text,
        }),
      })

      if (!res.ok) throw new Error('Failed to save quote')

      fetchSavedQuotes()
    } catch (error) {
      console.error('Error saving quote:', error)
    }
  }

  const handleDeleteSavedQuote = async (id: string) => {
    try {
      const res = await fetch(`${SAVED_QUOTES_API}/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to remove saved quote')

      fetchSavedQuotes()
    } catch (error) {
      console.error('Error deleting saved quote:', error)
    }
  }

  if (!settings) {
    return (
      <PageTransition>
        <div className="w-full max-w-5xl mx-auto px-4">Loading settings...</div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="w-full max-w-5xl mx-auto px-4 space-y-6">
        <SectionHeader
          title="Mental Health"
          subtitle="Log emotions, journal your day, and receive quotes tailored to your mood profile."
        />

        <article className="grid gap-4 w-full min-w-0 rounded-3xl border border-rose-100 bg-white p-5 shadow lg:grid-cols-2">
          <div>
            <p className="text-sm text-rose-700/70">How are you feeling today?</p>

            <div className="mt-3 flex flex-wrap gap-2">
              {moodOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setMood(option)
                    autoSetLevels(journal, option)
                    setRefreshKey((prev) => prev + 1)
                  }}
                  className={`rounded-full px-4 py-2 text-sm capitalize transition ${
                    mood === option ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                  }`}
                >
                  {moodEmoji[option]} {option}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 w-full max-w-sm lg:ml-auto">
            <label className="block text-sm text-rose-700">Stress: {stress}</label>
            <input
              type="range"
              min={1}
              max={5}
              value={stress}
              onChange={(e) => {
                setStress(Number(e.target.value))
                setRefreshKey((prev) => prev + 1)
              }}
              className="w-full accent-rose-500"
            />

            <label className="block text-sm text-rose-700">Energy: {energy}</label>
            <input
              type="range"
              min={1}
              max={5}
              value={energy}
              onChange={(e) => {
                setEnergy(Number(e.target.value))
                setRefreshKey((prev) => prev + 1)
              }}
              className="w-full accent-rose-500"
            />
          </div>
        </article>

        <article className="max-w-4xl mx-auto rounded-3xl border border-rose-100 bg-white p-5 shadow min-w-0">
          <h3 className="text-lg font-semibold text-rose-700">Journal</h3>

          <textarea
            value={journal}
            onChange={(e) => {
              const value = e.target.value
              setJournal(value)
              autoSetLevels(value, mood)
            }}
            rows={5}
            className="mt-3 w-full max-w-3xl rounded-xl border border-rose-200 p-3 text-rose-700 outline-none focus:ring-2 focus:ring-rose-200"
            placeholder="Write your thoughts..."
          />

          <button
            onClick={handleSaveJournal}
            className="mt-3 rounded-full bg-rose-500 px-4 py-2 text-white hover:bg-rose-600"
          >
            {editingJournalId ? 'Update Journal' : 'Save Journal'}
          </button>

          <div className="mt-4 grid gap-3 md:grid-cols-2 min-w-0">
            {journalEntries.map((entry) => (
              <div key={entry._id} className="rounded-xl border border-rose-100 p-3">
                <p className="text-xs text-gray-500">{new Date(entry.createdAt).toLocaleString()}</p>

                <p className="mt-2 text-sm text-rose-700 break-words">{entry.text}</p>

                <p className="mt-2 text-xs text-rose-600">
                  Mood: {entry.mood} | Stress: {entry.stress} | Energy: {entry.energy}
                </p>

                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleEdit(entry)}
                    className="rounded bg-blue-500 px-2 py-1 text-xs text-white"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(entry._id)}
                    className="rounded bg-red-500 px-2 py-1 text-xs text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>

        {settings.dailyQuotes && (
          <section className="w-full min-w-0">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-delta text-3xl md:text-4xl text-rose-700 break-words">
                Quotes For You
              </h3>

              <button
                onClick={() => setRefreshKey((prev) => prev + 1)}
                className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600"
              >
                Refresh
              </button>
            </div>

            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredQuotes.map((quote) => (
                <article
                  key={quote.id}
                  className="rounded-3xl border border-rose-100 bg-white p-4 shadow-[0_10px_24px_rgba(231,84,128,0.08)]"
                >
                  <p className="font-delta text-2xl leading-relaxed text-rose-700 break-words">
                    “{quote.text}”
                  </p>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-rose-600">SheCare</span>

                    <button
                      onClick={() => handleSaveQuote(quote)}
                      className="rounded-full bg-rose-100 px-3 py-1 text-sm font-semibold text-rose-700 hover:bg-rose-200"
                    >
                      {favorites.includes(quote.id) ? 'Saved' : 'Save quote'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="w-full min-w-0">
          <h3 className="font-delta text-3xl md:text-4xl text-rose-700 break-words">
            Wellness Tips
          </h3>

          <div className="mt-3 grid gap-4 md:grid-cols-3 min-w-0">
            {filteredTips.map((card) => (
              <article
                key={card.title}
                className="rounded-3xl border border-rose-100 bg-white p-5 shadow-[0_10px_24px_rgba(231,84,128,0.08)]"
              >
                <h4 className="text-lg font-semibold text-rose-700">{card.title}</h4>
                <p className="mt-2 text-sm text-rose-700/75">{card.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="w-full min-w-0 rounded-3xl border border-rose-100 bg-white p-5 shadow">
          <h3 className="font-delta text-3xl md:text-4xl text-rose-700 break-words">
            Saved Quotes
          </h3>

          {savedQuotes.length === 0 ? (
            <p className="mt-2 text-sm text-rose-700/70">No saved quotes yet.</p>
          ) : (
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {savedQuotes.map((quote) => (
                <article key={quote._id} className="rounded-2xl border border-rose-100 p-4">
                  <p className="font-delta text-2xl text-rose-700 break-words">
                    “{quote.text}”
                  </p>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-xs text-gray-500">
                      {new Date(quote.createdAt).toLocaleString()}
                    </span>

                    <button
                      onClick={() => handleDeleteSavedQuote(quote._id)}
                      className="rounded bg-red-500 px-2 py-1 text-xs text-white"
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </PageTransition>
  )
}