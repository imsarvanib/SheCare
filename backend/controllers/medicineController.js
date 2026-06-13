import mongoose from 'mongoose'
import MedicineReminder from '../models/MedicineReminder.js'

const parseDate = (value) => {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export const getMedicineReminders = async (req, res) => {
  try {
    const { userId } = req.params

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid userId' })
    }

    const reminders = await MedicineReminder.find({ userId }).sort({ createdAt: -1 })
    return res.json({ success: true, data: reminders })
  } catch (error) {
    console.error('GET MEDICINE REMINDERS ERROR:', error)
    return res.status(500).json({ success: false, message: 'Failed to load reminders' })
  }
}

export const createMedicineReminder = async (req, res) => {
  try {
    const { userId, name, dosage, frequency, times, startDate, endDate, notes, active } = req.body

    if (!userId || !name || !dosage || !frequency || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'All required fields must be filled' })
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid userId' })
    }

    const parsedStartDate = parseDate(startDate)
    const parsedEndDate = parseDate(endDate)

    if (!parsedStartDate || !parsedEndDate) {
      return res.status(400).json({ success: false, message: 'Invalid date' })
    }
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (parsedStartDate < today) {
      return res.status(400).json({
      success: false,
      message: 'Start date cannot be in the past',
  })
}
      if (parsedEndDate < parsedStartDate) {
        return res.status(400).json({ success: false, message: 'End date must be after start date' })
      }
      const reminderTimes = Array.isArray(times) ? times : []

      const existingReminder = await MedicineReminder.findOne({
        userId,
        name: String(name).trim(),
        startDate: parsedStartDate,
        times: { $in: reminderTimes },
      })

  if (existingReminder) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate reminder already exists for same medicine and time',
    })
  }
    const reminder = await MedicineReminder.create({
      userId,
      name: String(name).trim(),
      dosage: String(dosage).trim(),
      frequency,
      times: reminderTimes,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      notes: String(notes ?? '').trim(),
      active: active ?? true,
    })

    return res.status(201).json({ success: true, data: reminder })
  } catch (error) {
    console.error('CREATE MEDICINE REMINDER ERROR:', error)
    return res.status(500).json({ success: false, message: 'Failed to create reminder' })
  }
}

export const updateMedicineReminder = async (req, res) => {
  try {
    const { id } = req.params
    const { userId, name, dosage, frequency, times, startDate, endDate, notes, active } = req.body

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid id' })
    }

    const parsedStartDate = parseDate(startDate)
    const parsedEndDate = parseDate(endDate)

    if (!parsedStartDate || !parsedEndDate) {
      return res.status(400).json({ success: false, message: 'Invalid date' })
    }
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (parsedStartDate < today) {
      return res.status(400).json({
    success: false,
    message: 'Start date cannot be in the past',
  })
}
    if (parsedEndDate < parsedStartDate) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date',
      })
    }

    const updated = await MedicineReminder.findOneAndUpdate(
      { _id: id, userId },
      {
        name: String(name).trim(),
        dosage: String(dosage).trim(),
        frequency,
        times: Array.isArray(times) ? times : [],
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        notes: String(notes ?? '').trim(),
        active,
      },
      { new: true },
    )

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Reminder not found' })
    }

    return res.json({ success: true, data: updated })
  } catch (error) {
    console.error('UPDATE MEDICINE REMINDER ERROR:', error)
    return res.status(500).json({ success: false, message: 'Failed to update reminder' })
  }
}

export const toggleMedicineReminder = async (req, res) => {
  try {
    const { id } = req.params
    const { userId, active } = req.body

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid id' })
    }

    const updated = await MedicineReminder.findOneAndUpdate(
      { _id: id, userId },
      { active: Boolean(active) },
      { new: true },
    )

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Reminder not found' })
    }

    return res.json({ success: true, data: updated })
  } catch (error) {
    console.error('TOGGLE MEDICINE REMINDER ERROR:', error)
    return res.status(500).json({ success: false, message: 'Failed to update reminder status' })
  }
}

export const deleteMedicineReminder = async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.body

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid id' })
    }

    const deleted = await MedicineReminder.findOneAndDelete({ _id: id, userId })

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Reminder not found' })
    }

    return res.json({ success: true, message: 'Reminder deleted' })
  } catch (error) {
    console.error('DELETE MEDICINE REMINDER ERROR:', error)
    return res.status(500).json({ success: false, message: 'Failed to delete reminder' })
  }
}