import express from 'express'
import SavedQuote from '../models/SavedQuote.js'

const router = express.Router()

router.post('/', async (req, res) => {
  try {
    const { userId, quoteId, text } = req.body

    const existing = await SavedQuote.findOne({ userId, quoteId })

    if (existing) {
      return res.status(200).json(existing)
    }

    const savedQuote = new SavedQuote({
      userId,
      quoteId,
      text,
    })

    const saved = await savedQuote.save()
    res.status(201).json(saved)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:userId', async (req, res) => {
  try {
    const quotes = await SavedQuote.find({ userId: req.params.userId }).sort({
      createdAt: -1,
    })

    res.json(quotes)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await SavedQuote.findByIdAndDelete(req.params.id)

    if (!deleted) {
      return res.status(404).json({ error: 'Saved quote not found' })
    }

    res.json({ message: 'Saved quote removed successfully' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router