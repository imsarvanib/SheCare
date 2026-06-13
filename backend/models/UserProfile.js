import mongoose from 'mongoose'

const userProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      default: '',
      trim: true,
    },
    email: {
      type: String,
      default: '',
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    age: {
      type: Number,
      default: null,
    },
    city: {
      type: String,
      default: '',
      trim: true,
    },
    settings: {
      periodReminders: {
        type: Boolean,
        default: true,
      },
      medicineReminders: {
        type: Boolean,
        default: true,
      },
      cyclePredictions: {
        type: Boolean,
        default: true,
      },
      dailyQuotes: {
        type: Boolean,
        default: true,
      },
      theme: {
        type: String,
        enum: ['blush', 'rose', 'dark'],
        default: 'blush',
      },
    },
  },
  {
    timestamps: true,
  },
)

const UserProfile = mongoose.model('UserProfile', userProfileSchema)

export default UserProfile
