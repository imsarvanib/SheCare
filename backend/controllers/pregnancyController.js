import mongoose from 'mongoose'
import PregnancyProfile from '../models/PregnancyProfile.js'

const TOTAL_WEEKS = 40

const normalizeToUtcDay = (date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))

const parseDateOrNull = (value) => {
  if (!value) {
    return null
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return normalizeToUtcDay(parsed)
}

const derivePregnancyMetrics = (lmpDate) => {
  const normalizedLmpDate = normalizeToUtcDay(lmpDate)
  const today = normalizeToUtcDay(new Date())
  const elapsedMs = today.getTime() - normalizedLmpDate.getTime()
  const elapsedWeeks = Math.max(0, Math.floor(elapsedMs / (1000 * 60 * 60 * 24 * 7)))

  let trimester = 'First'
  if (elapsedWeeks >= 28) {
    trimester = 'Third'
  } else if (elapsedWeeks >= 13) {
    trimester = 'Second'
  }

  const dueDate = new Date(normalizedLmpDate)
  dueDate.setUTCDate(dueDate.getUTCDate() + 280)

  const progressPercent = Math.min(100, Math.max(0, Math.round((elapsedWeeks / TOTAL_WEEKS) * 100)))

  return {
    currentWeek: elapsedWeeks,
    trimester,
    dueDate,
    progressPercent,
  }
}

const getOrCreatePregnancyProfile = async (userId) => {
  let profile = await PregnancyProfile.findOne({ userId })

  if (!profile) {
    profile = await PregnancyProfile.create({
      userId,
      lmpDate: null,
      currentWeek: 0,
      trimester: 'First',
      dueDate: null,
      progressPercent: 0,
      appointments: [],
    })
  }

  return profile
}
const isSameAppointment = (appointment, { title, doctor, date, time }) => {
  const existingDate = normalizeToUtcDay(new Date(appointment.date)).getTime()
  const newDate = normalizeToUtcDay(date).getTime()

  return (
    String(appointment.title).trim().toLowerCase() === title.trim().toLowerCase() &&
    String(appointment.doctor).trim().toLowerCase() === doctor.trim().toLowerCase() &&
    existingDate === newDate &&
    String(appointment.time).trim() === time.trim()
  )
}

const validateAppointmentDate = (date) => {
  const parsedDate = parseDateOrNull(date)

  if (!parsedDate) {
    return { ok: false, message: 'Invalid appointment date' }
  }

  const today = normalizeToUtcDay(new Date())

  if (parsedDate < today) {
    return { ok: false, message: 'Appointment date cannot be in the past' }
  }

  return { ok: true, parsedDate }
}
export const getPregnancyProfile = async (req, res) => {
  try {
    const { userId } = req.params

    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' })
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid userId' })
    }

    const profile = await getOrCreatePregnancyProfile(userId)

    return res.json({
      success: true,
      data: profile,
    })
  } catch (error) {
    console.error('GET PREGNANCY PROFILE ERROR:', error)
    return res.status(500).json({ success: false, message: 'Failed to load pregnancy data' })
  }
}

export const upsertLmpDate = async (req, res) => {
  try {
    const { userId, lmpDate } = req.body

    if (!userId || !lmpDate) {
      return res.status(400).json({ success: false, message: 'userId and lmpDate are required' })
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid userId' })
    }

    const parsedLmpDate = parseDateOrNull(lmpDate)

    if (!parsedLmpDate) {
      return res.status(400).json({ success: false, message: 'Invalid lmpDate' })
    }

    const metrics = derivePregnancyMetrics(parsedLmpDate)

    const profile = await PregnancyProfile.findOneAndUpdate(
      { userId },
      {
        userId,
        lmpDate: parsedLmpDate,
        currentWeek: metrics.currentWeek,
        trimester: metrics.trimester,
        dueDate: metrics.dueDate,
        progressPercent: metrics.progressPercent,
      },
      { upsert: true, new: true },
    )

    return res.json({ success: true, data: profile })
  } catch (error) {
    console.error('UPSERT LMP ERROR:', error)
    return res.status(500).json({ success: false, message: 'Failed to update LMP' })
  }
}

export const addPregnancyAppointment = async (req, res) => {
  try {
    const { userId, title, doctor, date, time } = req.body

    if (!userId || !title || !doctor || !date || !time) {
      return res.status(400).json({ success: false, message: 'userId, title, doctor, date and time are required' })
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid userId' })
    }

    const validation = validateAppointmentDate(date)

    if (!validation.ok) {
      return res.status(400).json({ success: false, message: validation.message })
    }

    const profile = await getOrCreatePregnancyProfile(userId)

    const cleanedAppointment = {
      title: String(title).trim(),
      doctor: String(doctor).trim(),
      date: validation.parsedDate,
      time: String(time).trim(),
    }

    const duplicateAppointment = profile.appointments.some((appointment) =>
      isSameAppointment(appointment, cleanedAppointment),
    )

    if (duplicateAppointment) {
      return res.status(409).json({
        success: false,
        message: 'This appointment already exists',
      })
    }

    profile.appointments.push(cleanedAppointment)

    await profile.save()

    return res.json({ success: true, data: profile })
  } catch (error) {
    console.error('ADD APPOINTMENT ERROR:', error)
    return res.status(500).json({ success: false, message: 'Failed to add appointment' })
  }
}
export const updatePregnancyAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params
    const { userId, title, doctor, date, time } = req.body

    if (!appointmentId || !userId || !title || !doctor || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'appointmentId, userId, title, doctor, date and time are required',
      })
    }

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ success: false, message: 'Invalid id' })
    }

    const validation = validateAppointmentDate(date)

    if (!validation.ok) {
      return res.status(400).json({ success: false, message: validation.message })
    }

    const profile = await PregnancyProfile.findOne({ userId })

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Pregnancy profile not found' })
    }

    const appointment = profile.appointments.id(appointmentId)

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' })
    }

    const cleanedAppointment = {
      title: String(title).trim(),
      doctor: String(doctor).trim(),
      date: validation.parsedDate,
      time: String(time).trim(),
    }

    const duplicateAppointment = profile.appointments.some((existingAppointment) => {
      if (String(existingAppointment._id) === String(appointmentId)) {
        return false
      }

      return isSameAppointment(existingAppointment, cleanedAppointment)
    })

    if (duplicateAppointment) {
      return res.status(409).json({
        success: false,
        message: 'This appointment already exists',
      })
    }

    appointment.title = cleanedAppointment.title
    appointment.doctor = cleanedAppointment.doctor
    appointment.date = cleanedAppointment.date
    appointment.time = cleanedAppointment.time

    await profile.save()

    return res.json({ success: true, data: profile })
  } catch (error) {
    console.error('UPDATE APPOINTMENT ERROR:', error)
    return res.status(500).json({ success: false, message: 'Failed to update appointment' })
  }
}

export const deletePregnancyAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params
    const { userId } = req.body

    if (!appointmentId || !userId) {
      return res.status(400).json({ success: false, message: 'appointmentId and userId are required' })
    }

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ success: false, message: 'Invalid id' })
    }

    const profile = await PregnancyProfile.findOne({ userId })

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Pregnancy profile not found' })
    }

    const appointment = profile.appointments.id(appointmentId)

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' })
    }

    profile.appointments.pull(appointmentId)

    await profile.save()

    return res.json({ success: true, data: profile })
  } catch (error) {
    console.error('DELETE APPOINTMENT ERROR:', error)
    return res.status(500).json({ success: false, message: 'Failed to delete appointment' })
  }
}

export const resetPregnancyTracking = async (req, res) => {
  try {
    const { userId } = req.params

    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' })
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid userId' })
    }

    const profile = await PregnancyProfile.findOneAndUpdate(
      { userId },
      {
        userId,
        lmpDate: null,
        currentWeek: 0,
        trimester: 'First',
        dueDate: null,
        progressPercent: 0,
        appointments: [],
      },
      { upsert: true, new: true },
    )

    return res.json({ success: true, data: profile })
  } catch (error) {
    console.error('RESET PREGNANCY ERROR:', error)
    return res.status(500).json({ success: false, message: 'Failed to reset pregnancy tracking' })
  }
}
