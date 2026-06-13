import mongoose from 'mongoose'
import PeriodLog from '../models/PeriodLog.js'
import UserProfile from '../models/UserProfile.js'

const DAY_MS = 24 * 60 * 60 * 1000

const isStrictDateString = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)

const parseLocalDate = (dateStr) => {
  if (!isStrictDateString(dateStr)) {
    return null
  }

  const [year, month, day] = dateStr.split('-').map(Number)
  const parsed = new Date(year, month - 1, day)

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null
  }

  return parsed
}

const formatLocalDate = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return null
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const normalizeStoredDateValue = (value) => {
  if (isStrictDateString(value)) {
    return value
  }

  if (value instanceof Date) {
    return formatLocalDate(value)
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    const datePrefix = trimmed.slice(0, 10)

    if (isStrictDateString(datePrefix)) {
      return datePrefix
    }
  }

  return null
}

const serializePeriodLog = (log) => {
  const plainLog = log.toObject?.() ?? log
  const startDate = normalizeStoredDateValue(plainLog.startDate)
  const endDate = normalizeStoredDateValue(plainLog.endDate)

  return {
    ...plainLog,
    startDate: startDate ?? plainLog.startDate,
    endDate: endDate ?? plainLog.endDate,
  }
}

const toConflictLogPayload = (log) => {
  const serialized = serializePeriodLog(log)

  return {
    _id: serialized._id?.toString?.() ?? serialized._id,
    userId: serialized.userId?.toString?.() ?? serialized.userId,
    startDate: serialized.startDate,
    endDate: serialized.endDate,
    createdAt: serialized.createdAt ?? null,
  }
}

const compareDateStrings = (left, right) => {
  const leftDate = parseLocalDate(normalizeStoredDateValue(left))
  const rightDate = parseLocalDate(normalizeStoredDateValue(right))

  if (!leftDate && !rightDate) {
    return 0
  }

  if (!leftDate) {
    return -1
  }

  if (!rightDate) {
    return 1
  }

  return leftDate.getTime() - rightDate.getTime()
}

const daysBetweenDateStrings = (startDate, endDate) => {
  const parsedStartDate = parseLocalDate(startDate)
  const parsedEndDate = parseLocalDate(endDate)

  if (!parsedStartDate || !parsedEndDate) {
    return null
  }

  return Math.round((parsedEndDate.getTime() - parsedStartDate.getTime()) / DAY_MS)
}

const addDaysToDateString = (dateStr, days) => {
  const parsedDate = parseLocalDate(dateStr)

  if (!parsedDate) {
    return null
  }

  const shiftedDate = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate() + days)
  return formatLocalDate(shiftedDate)
}

const getLocalTodayString = () => {
  const now = new Date()
  return formatLocalDate(new Date(now.getFullYear(), now.getMonth(), now.getDate()))
}

const getMinimumAllowedDateForAge = (age) => {
  if (!Number.isFinite(age) || age < 9) {
    return null
  }

  const currentYear = new Date().getFullYear()
  return `${currentYear - age + 9}-01-01`
}

const findConflictingLog = async (userId, startDate, endDate, excludeId = null) => {
  const requestedStartDate = parseLocalDate(startDate)
  const requestedEndDate = parseLocalDate(endDate)

  if (!requestedStartDate || !requestedEndDate) {
    return null
  }

  const logs = await PeriodLog.find({ userId })

  console.log('🔍 OVERLAP VALIDATION:', {
    userId: userId.toString(),
    startDate,
    endDate,
    excludeId: excludeId?.toString() || 'none',
    candidateCount: logs.length,
  })

  console.log('🗂️ ALL SAVED PERIOD LOGS BEFORE VALIDATION:', logs.map((log) => toConflictLogPayload(log)))

  for (const log of logs) {
    const logId = log._id.toString()

    if (excludeId && mongoose.Types.ObjectId.isValid(excludeId) && logId === excludeId.toString()) {
      continue
    }

    const serializedLog = serializePeriodLog(log)
    const existingStartDate = parseLocalDate(serializedLog.startDate)
    const existingEndDate = parseLocalDate(serializedLog.endDate)

    if (!existingStartDate || !existingEndDate) {
      console.warn('⚠️  SKIPPING INVALID PERIOD LOG DOCUMENT:', {
        _id: logId,
        startDate: serializedLog.startDate,
        endDate: serializedLog.endDate,
      })
      continue
    }

    const overlaps =
      requestedStartDate.getTime() <= existingEndDate.getTime() &&
      requestedEndDate.getTime() >= existingStartDate.getTime()

    console.log('🔎 OVERLAP CHECK:', {
      requested: { startDate, endDate },
      existing: {
        _id: logId,
        startDate: serializedLog.startDate,
        endDate: serializedLog.endDate,
      },
      overlaps,
    })

    if (overlaps) {
      const conflictType =
        serializedLog.startDate === startDate && serializedLog.endDate === endDate
          ? 'exact-match'
          : 'overlap'

      console.error('❌ CONFLICTING LOG FOUND:', {
        conflictType,
        ...toConflictLogPayload(log),
      })

      return {
        ...serializedLog,
        conflictType,
      }
    }
  }

  console.log('✅ NO OVERLAPS FOUND')
  return null
}

const calculateStandardDeviation = (values) => {
  if (values.length < 2) {
    return 0
  }

  const mean = values.reduce((sum, value) => sum + value, 0) / values.length
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

const buildPredictionPayload = (logs) => {
  const normalizedLogs = (logs || [])
    .map((log) => serializePeriodLog(log))
    .filter((log) => isStrictDateString(log.startDate))
    .sort((left, right) => compareDateStrings(left.startDate, right.startDate))

  if (normalizedLogs.length === 0) {
    const fallbackPrediction = addDaysToDateString(getLocalTodayString(), 28)

    return {
      predictedNextCycle: fallbackPrediction,
      confidence: 'low',
      warning: 'Not enough cycle data to predict next cycle.',
    }
  }

  const cycleLengths = []

  for (let index = 1; index < normalizedLogs.length; index += 1) {
    const previousStartDate = normalizedLogs[index - 1].startDate
    const currentStartDate = normalizedLogs[index].startDate
    const diffInDays = daysBetweenDateStrings(previousStartDate, currentStartDate)

    if (diffInDays !== null && diffInDays > 0) {
      cycleLengths.push(diffInDays)
    }
  }

  const averageCycleLength =
    cycleLengths.length > 0
      ? Math.round(cycleLengths.reduce((sum, days) => sum + days, 0) / cycleLengths.length)
      : 28

  const stdDeviation = calculateStandardDeviation(cycleLengths)
  const shortestCycle = cycleLengths.length > 0 ? Math.min(...cycleLengths) : null

  let confidence = 'low'
  if (cycleLengths.length >= 2) {
    if (shortestCycle !== null && shortestCycle < 15) {
      confidence = 'low'
    } else if (stdDeviation < 2) {
      confidence = 'high'
    } else if (stdDeviation <= 5) {
      confidence = 'medium'
    }
  }

  const latestLog = normalizedLogs[normalizedLogs.length - 1]
  const predictedNextCycle = addDaysToDateString(latestLog.startDate, averageCycleLength)

  let warning = null
  if (shortestCycle !== null && shortestCycle < 15) {
    warning = 'Short cycle detected — consider tracking more data'
  } else if (confidence === 'low') {
    warning = 'Predictions may be less accurate due to irregular cycle.'
  }

  return {
    predictedNextCycle,
    confidence,
    warning,
  }
}

const validatePeriodLogDates = async ({ userId, startDate, endDate, excludeId = null }) => {
  if (!startDate || !endDate) {
    return { ok: false, status: 400, message: 'startDate and endDate are required' }
  }

  if (!isStrictDateString(startDate) || !isStrictDateString(endDate)) {
    return { ok: false, status: 400, message: 'Invalid date format' }
  }

  const normalizedStartDate = startDate
  const normalizedEndDate = endDate
  const parsedStartDate = parseLocalDate(normalizedStartDate)
  const parsedEndDate = parseLocalDate(normalizedEndDate)

  if (!parsedStartDate || !parsedEndDate) {
    return { ok: false, status: 400, message: 'Invalid date format' }
  }

  if (parsedEndDate.getTime() < parsedStartDate.getTime()) {
    return { ok: false, status: 400, message: 'End date must be after start date' }
  }

  const logSpanInDays =
    Math.round((parsedEndDate.getTime() - parsedStartDate.getTime()) / DAY_MS) + 1

  if (logSpanInDays < 3) {
    return {
      ok: false,
      status: 400,
      message: 'Period log must be at least 3 days long',
    }
  }

  const today = getLocalTodayString()

  if (normalizedStartDate > today) {
    return {
      ok: false,
      status: 400,
      message: 'Start date cannot be in the future',
    }
  }

  const profile = await UserProfile.findOne({ userId }).select('age')
  const minimumDate = getMinimumAllowedDateForAge(profile?.age)

  if (minimumDate && normalizedStartDate < minimumDate) {
    return {
      ok: false,
      status: 400,
      message: 'Date is not realistic for the saved profile age',
    }
  }

  const conflictingLog = await findConflictingLog(
    userId,
    normalizedStartDate,
    normalizedEndDate,
    excludeId,
  )

  if (conflictingLog) {
    return {
      ok: false,
      status: 409,
      message: 'This date range overlaps an existing period log. Edit the existing log instead.',
      conflictingLogId: conflictingLog._id?.toString?.() ?? conflictingLog._id,
      conflictingLog,
      conflictType: conflictingLog.conflictType ?? 'overlap',
    }
  }

  return { ok: true, normalizedStartDate, normalizedEndDate }
}

export const createPeriodLog = async (req, res) => {
  try {
    const { userId, startDate, endDate, symptoms, flow, pain, notes } = req.body

    if (!userId || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'userId, startDate and endDate are required' })
    }

    console.log('📝 CREATE PERIOD LOG REQUEST:', {
      userId,
      startDate,
      endDate,
    })

    const validation = await validatePeriodLogDates({ userId, startDate, endDate })
    if (!validation.ok) {
      if (validation.conflictingLog) {
        console.error('❌ CREATE CONFLICT DOCUMENT:', toConflictLogPayload(validation.conflictingLog))
      }

      console.warn('❌ CREATE VALIDATION FAILED:', validation.message)
      return res.status(validation.status).json({
        success: false,
        message: validation.message,
        conflictingLogId: validation.conflictingLogId,
        conflictType: validation.conflictType,
        conflictingLog: validation.conflictingLog ? toConflictLogPayload(validation.conflictingLog) : null,
      })
    }

    const newLog = await PeriodLog.create({
      userId,
      startDate: validation.normalizedStartDate,
      endDate: validation.normalizedEndDate,
      symptoms,
      flow,
      pain,
      notes,
    })

    console.log('✅ LOG CREATED SUCCESSFULLY:', serializePeriodLog(newLog))
    return res.status(201).json({ success: true, data: serializePeriodLog(newLog) })
  } catch (error) {
    if (error?.code === 11000) {
      console.error('⚠️  UNIQUE INDEX VIOLATION (11000 error):', {
        message: error.message,
        keyPattern: error.keyPattern,
        keyValue: error.keyValue,
      })

      const { userId, startDate, endDate } = req.body || {}
      const conflictingLog = await findConflictingLog(userId, startDate, endDate)
      if (conflictingLog) {
        console.error('❌ POST 409 CONFLICTING PERIOD LOG:', toConflictLogPayload(conflictingLog))
      }

      return res.status(409).json({
        success: false,
        message: 'This date range overlaps an existing period log. Edit the existing log instead.',
        conflictingLog: conflictingLog ? toConflictLogPayload(conflictingLog) : null,
        conflictType: conflictingLog?.conflictType ?? 'overlap',
      })
    }

    console.error('🔴 PERIOD LOG ERROR:', error.message || error)
    console.error('Stack:', error.stack)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const getPeriodLogsByUserId = async (req, res) => {
  try {
    const { userId } = req.params

    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' })
    }

    console.log('📊 FETCH LOGS FOR USER:', userId)
    const logs = await PeriodLog.find({ userId })
    const normalizedLogs = logs
      .map((log) => serializePeriodLog(log))
      .sort((left, right) => compareDateStrings(right.startDate, left.startDate))

    console.log(`✅ FOUND ${normalizedLogs.length} LOGS FOR USER ${userId}:`, normalizedLogs)

    const prediction = buildPredictionPayload(normalizedLogs)

    return res.json({
      success: true,
      data: normalizedLogs,
      predictedNextCycle: prediction.predictedNextCycle,
      confidence: prediction.confidence,
      warning: prediction.warning,
    })
  } catch (error) {
    console.error('🔴 FETCH LOGS ERROR:', error.message || error)
    console.error('Stack:', error.stack)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const getDebugPeriodLogsByUserId = async (req, res) => {
  try {
    const { userId } = req.params

    console.log('DEBUG USER ID:', userId)

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId missing',
      })
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid userId',
      })
    }

    const logs = await PeriodLog.find({
      userId: new mongoose.Types.ObjectId(userId),
    }).sort({ startDate: 1 })

    console.log('DEBUG LOGS:', logs)

    return res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    })
  } catch (error) {
    console.error('DEBUG ROUTE ERROR:', error)
    console.error(error.stack)

    return res.status(500).json({
      success: false,
      message: error.message || 'Debug fetch failed',
    })
  }
}

export const updatePeriodLog = async (req, res) => {
  try {
    const { id } = req.params
    const { userId, startDate, endDate, symptoms, flow, pain, notes } = req.body

    if (!id) {
      return res.status(400).json({ success: false, message: 'id is required' })
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid log id' })
    }

    const existingLog = await PeriodLog.findById(id)
    if (!existingLog) {
      return res.status(404).json({ success: false, message: 'Log not found' })
    }

    const ownerUserId = userId || existingLog.userId.toString()
    const validation = await validatePeriodLogDates({
      userId: ownerUserId,
      startDate,
      endDate,
      excludeId: id,
    })

    if (!validation.ok) {
      if (validation.conflictingLog) {
        console.error('❌ UPDATE CONFLICT DOCUMENT:', validation.conflictingLog)
      }

      return res.status(validation.status).json({
        success: false,
        message: validation.message,
        conflictingLogId: validation.conflictingLogId,
      })
    }

    const updatedLog = await PeriodLog.findByIdAndUpdate(
      id,
      {
        startDate: validation.normalizedStartDate,
        endDate: validation.normalizedEndDate,
        symptoms,
        flow,
        pain,
        notes,
      },
      { new: true },
    )

    console.log('✅ PERIOD LOG UPDATED:', serializePeriodLog(updatedLog))
    return res.json({ success: true, data: serializePeriodLog(updatedLog) })
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This date range overlaps an existing period log. Edit the existing log instead.',
      })
    }

    console.error('UPDATE PERIOD LOG ERROR:', error)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const deletePeriodLog = async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.body

    console.log('🗑️  DELETE REQUEST:', { logId: id, requestingUserId: userId })

    if (!id) {
      console.warn('❌ DELETE FAILED: id is required')
      return res.status(400).json({ success: false, message: 'id is required' })
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.warn('❌ DELETE FAILED: Invalid log id format')
      return res.status(400).json({ success: false, message: 'Invalid log id' })
    }

    const existingLog = await PeriodLog.findById(id)
    if (!existingLog) {
      console.warn('❌ DELETE FAILED: Log not found in DB')
      return res.status(404).json({ success: false, message: 'Log not found' })
    }

    if (userId && userId !== existingLog.userId.toString()) {
      console.warn('❌ DELETE FAILED: User trying to delete another user\'s log', {
        requestingUserId: userId,
        logOwnerId: existingLog.userId.toString(),
      })
      return res.status(403).json({ success: false, message: 'Unauthorized: You can only delete your own logs' })
    }

    console.log('📝 LOG TO DELETE:', serializePeriodLog(existingLog))

    const deletedLog = await PeriodLog.findByIdAndDelete(id)

    if (!deletedLog) {
      console.error('❌ DELETE FAILED: findByIdAndDelete returned null')
      return res.status(500).json({ success: false, message: 'Failed to delete log from database' })
    }

    console.log('✅ LOG DELETED SUCCESSFULLY:', deletedLog._id.toString())

    const verifyDelete = await PeriodLog.findById(id)
    if (verifyDelete) {
      console.error('🚨 VERIFICATION FAILED: Log still exists after deletion!', serializePeriodLog(verifyDelete))
      return res.status(500).json({ success: false, message: 'Deletion verification failed - log still exists' })
    }

    console.log('✅ DELETION VERIFIED: Log no longer in database')
    return res.json({ success: true, message: 'Log deleted successfully', deletedId: deletedLog._id.toString() })
  } catch (error) {
    console.error('🔴 DELETE PERIOD LOG ERROR:', error.message || error)
    console.error('Stack:', error.stack)
    return res.status(500).json({ success: false, message: 'Server error during deletion' })
  }
  
}

