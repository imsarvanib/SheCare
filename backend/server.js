console.log('🚀 THIS SERVER IS ACTIVE')

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import User from './models/User.js'
import UserProfile from './models/UserProfile.js'
import routes from './routes/index.js'

dotenv.config()

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB Atlas Connected:', conn.connection.host)
    console.log('CONNECTED DB:', mongoose.connection.name)
  } catch (error) {
    console.error('MongoDB Connection Failed:', error.message)
    process.exit(1)
  }
}

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())
app.use((req, res, next) => {
  console.log('GLOBAL HIT:', req.method, req.url)
  next()
})

const defaultProfileSettings = {
  periodReminders: false,
  medicineReminders: false,
  cyclePredictions: true,
  dailyQuotes: false,
  theme: 'rose',
}

const getOrCreateProfile = async (userId) => {
  let profile = await UserProfile.findOne({ userId })

  if (!profile) {
    const user = await User.findById(userId).select('name email')

    profile = await UserProfile.create({
      userId,
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      age: null,
      city: '',
      settings: defaultProfileSettings,
    })
  }

  return profile
}

app.get('/profile', async (req, res) => {
  console.log('PROFILE ROUTE HIT')

  const { userId } = req.query

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'userId is required',
    })
  }

  try {
    const profile = await getOrCreateProfile(userId)

    return res.json({
      success: true,
      email: profile.email || '',
      settings: profile.settings || {},
      profile,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message,
    })
  }
})

app.get('/profile/:userId', async (req, res) => {
  const { userId } = req.params

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'userId is required',
    })
  }

  try {
    const profile = await getOrCreateProfile(userId)

    return res.json({
      success: true,
      email: profile.email || '',
      settings: profile.settings || {},
      profile,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message,
    })
  }
})

app.put('/profile', async (req, res) => {
  console.log('PROFILE SAVE HIT', req.body)

  const { userId, name, phone, age, city, settings } = req.body
  const trimmedPhone = String(phone ?? '').trim()
  const phoneRegex = /^[6-9]\d{9}$/

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'userId required',
    })
  }

  if (!phoneRegex.test(trimmedPhone)) {
    return res.status(400).json({
      success: false,
      message: 'Enter valid phone number',
    })
  }

  try {
    const update = {
      name: String(name ?? '').trim(),
      phone: trimmedPhone,
      age: age === '' || age == null ? null : Number(age),
      city: String(city ?? '').trim(),
    }

    if (settings) {
      update.settings = settings
    }

    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      update,
      { returnDocument: 'after', upsert: true },
    )

    console.log('Saved Profile Data:', profile)

    res.json({
      success: true,
      profile,
      user: {
        userId,
        name: profile.name || '',
        email: profile.email || '',
        settings: profile.settings || {},
      },
    })
  } catch (err) {
    console.error('PROFILE SAVE ERROR:', err)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

app.put('/profile/settings/:userId', async (req, res) => {
  const { userId } = req.params
  const { settings } = req.body

  console.log('PROFILE SETTINGS SAVE HIT', { userId, settings })

  if (!userId) {
    return res.status(400).json({ success: false, message: 'userId required' })
  }

  if (!settings || typeof settings !== 'object') {
    return res.status(400).json({ success: false, message: 'settings required' })
  }

  try {
    const user = await User.findById(userId).select('name email')

    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      {
        userId,
        name: user?.name || '',
        email: user?.email || '',
        settings,
      },
      { new: true, upsert: true },
    )

    return res.json({
      success: true,
      profile,
      settings: profile.settings || {},
    })
  } catch (error) {
    console.error('PROFILE SETTINGS SAVE ERROR:', error)
    return res.status(500).json({ success: false, message: 'Failed to save settings' })
  }
})

app.use('/', routes)

// TEST ROUTE
app.get('/test', (req, res) => {
  console.log('TEST ROUTE HIT')
  res.send('OK')
})

connectDB().then(() => {
  app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on 5000")
})
})