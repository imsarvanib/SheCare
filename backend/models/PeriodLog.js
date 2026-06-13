import mongoose from 'mongoose'

const periodLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    symptoms: {
      type: [String],
      default: [],
    },
    flow: {
      type: String,
      enum: ['Light', 'Medium', 'Heavy'],
      default: 'Medium',
    },
    pain: {
      type: String,
      enum: ['None', 'Mild', 'Moderate', 'Severe'],
      default: 'Mild',
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)


const PeriodLog = mongoose.model('PeriodLog', periodLogSchema)

export default PeriodLog
