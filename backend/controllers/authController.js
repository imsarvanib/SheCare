import User from '../models/User.js'
import UserProfile from '../models/UserProfile.js'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)

const sanitizeUser = (userDoc) => {
  const user = userDoc.toObject()
  delete user.password
  return user
}

export const signup = async (req, res) => {
  try {
    let { name = '', email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' })
    }

    email = email.trim().toLowerCase()

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    const role = email === 'test@shecare.com' ? 'admin' : 'user'

    const user = await User.create({
      name,
      email,
      password,
      role,
    })

    return res.status(201).json({
      message: 'Signup successful',
      user: sanitizeUser(user),
    })
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Signup failed' })
  }
}

export const login = async (req, res) => {
  try {
    let { email, password } = req.body

    console.log('LOGIN API HIT')
    console.log('BODY:', req.body)

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'email and password are required' })
    }

    email = email.trim().toLowerCase()

    console.log('LOGIN ATTEMPT:', email, password)
    console.log('LOGIN HANDLER FROM:', __filename)
    console.log('LOGIN EMAIL:', email)

    const user = await User.findOne({ email })
    console.log('USER FOUND:', user)

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' })
    }

    console.log('INPUT PASSWORD:', password)
    console.log('DB PASSWORD:', user?.password)
    console.log('Stored password:', user.password)

    const isMatch = password === user.password

    console.log('Password match:', isMatch)

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password' })
    }

    const profile = await UserProfile.findOne({ userId: user._id })

    console.log('LOGIN SUCCESS RESPONSE SENDING')

    return res.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        settings: profile?.settings || {},
      },
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Login failed' })
  }
}

export const forgotPassword = async (req, res) => {
  try {
    let { email } = req.body

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' })
    }

    email = email.trim().toLowerCase()

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000))

    user.resetOtp = otp
    user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000)
    user.resetOtpVerified = false
    await user.save()

    console.log('OTP for user:', otp)

    return res.json({ success: true, message: 'OTP generated successfully' })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to generate OTP' })
  }
}

export const verifyOtp = async (req, res) => {
  try {
    let { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' })
    }

    email = email.trim().toLowerCase()
    otp = String(otp).trim()

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    if (!user.resetOtp || !user.resetOtpExpiry) {
      return res.status(400).json({ success: false, message: 'No OTP request found' })
    }

    if (user.resetOtp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' })
    }

    if (new Date(user.resetOtpExpiry).getTime() < Date.now()) {
      return res.status(400).json({ success: false, message: 'OTP expired' })
    }

    user.resetOtpVerified = true
    await user.save()

    return res.json({ success: true, message: 'OTP verified successfully' })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to verify OTP' })
  }
}

export const resetPassword = async (req, res) => {
  try {
    let { email, newPassword } = req.body

    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email and new password are required' })
    }

    email = email.trim().toLowerCase()

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    if (!user.resetOtpVerified) {
      return res.status(403).json({ success: false, message: 'OTP verification required' })
    }

    if (!user.resetOtpExpiry || new Date(user.resetOtpExpiry).getTime() < Date.now()) {
      return res.status(400).json({ success: false, message: 'OTP session expired' })
    }

    user.password = newPassword
    user.resetOtp = null
    user.resetOtpExpiry = null
    user.resetOtpVerified = false
    await user.save()

    return res.json({ success: true, message: 'Password reset successful' })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to reset password' })
  }
}
