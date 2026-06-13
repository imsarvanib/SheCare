import mongoose from 'mongoose'
import User from '../models/User.js'
import UserProfile from '../models/UserProfile.js'

export const getProfile = async (req, res) => {
  console.log('PROFILE API HIT')

  const { userId } = req.query

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'userId query param is required',
    })
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid userId',
    })
  }

  try {
    let profile = await UserProfile.findOne({ userId })

    if (!profile) {
      const user = await User.findById(userId).select('name email')

      profile = await UserProfile.create({
        userId,
        name: user?.name ?? '',
        email: user?.email ?? '',
        settings: {
          periodReminders: false,
          medicineReminders: false,
          cyclePredictions: true,
          dailyQuotes: false,
          theme: 'rose',
        },
      })
    }

    return res.json({
      success: true,
      message: 'Profile route working',
      userId,
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
}
