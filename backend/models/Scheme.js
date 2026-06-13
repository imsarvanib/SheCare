import mongoose from 'mongoose'

const schemeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    ageRange: { type: String },
    description: { type: String, required: true },
    eligibility: { type: String, required: true },
    benefits: { type: String },
    category: { type: String },
    officialLink: { type: String },
    source: { type: String },
  },
  { timestamps: true }
)

export default mongoose.model('Scheme', schemeSchema)