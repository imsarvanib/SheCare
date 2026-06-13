import mongoose from 'mongoose'

const savedQuoteSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    quoteId: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
)

savedQuoteSchema.index({ userId: 1, quoteId: 1 }, { unique: true })

export default mongoose.model('SavedQuote', savedQuoteSchema)