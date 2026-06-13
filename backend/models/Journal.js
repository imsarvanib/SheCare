import mongoose from 'mongoose';

const journalSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  mood: String,
  stress: Number,
  energy: Number,
  createdAt: {
    type: Date,
    default: Date.now, // auto timestamp
  },
});

export default mongoose.model('Journal', journalSchema);