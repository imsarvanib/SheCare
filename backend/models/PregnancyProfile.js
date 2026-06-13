import mongoose from 'mongoose'

const appointmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    doctor: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: true },
)

const pregnancyProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    lmpDate: {
      type: Date,
      default: null,
    },
    currentWeek: {
      type: Number,
      default: 0,
      min: 0,
    },
    trimester: {
      type: String,
      enum: ['First', 'Second', 'Third'],
      default: 'First',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    progressPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    appointments: {
      type: [appointmentSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
)

const PregnancyProfile = mongoose.model('PregnancyProfile', pregnancyProfileSchema)

export default PregnancyProfile
