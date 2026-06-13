import express from 'express'
import Journal from '../models/Journal.js'

const router = express.Router()

// SAVE journal
router.post('/', async (req, res) => {
  try {
    const { userId, text, mood, stress, energy } = req.body

    const newJournal = new Journal({
      userId,
      text,
      mood,
      stress,
      energy,
    })

    const savedJournal = await newJournal.save()
    res.status(201).json(savedJournal)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET journals by user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    const journals = await Journal.find({ userId }).sort({
      createdAt: -1,
    })

    res.json(journals)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
// UPDATE journal
router.put('/:id', async (req, res) => {
  try {
    const { text, mood, stress, energy } = req.body

    const updatedJournal = await Journal.findByIdAndUpdate(
      req.params.id,
      {
        text,
        mood,
        stress,
        energy,
        updatedAt: new Date(),
      },
      { new: true }
    )

    if (!updatedJournal) {
      return res.status(404).json({ error: 'Journal not found' })
    }

    res.json(updatedJournal)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE journal
router.delete('/:id', async (req, res) => {
  try {
    const deletedJournal = await Journal.findByIdAndDelete(req.params.id)

    if (!deletedJournal) {
      return res.status(404).json({ error: 'Journal not found' })
    }

    res.json({ message: 'Journal deleted successfully' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router