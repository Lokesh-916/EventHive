const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roleId: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'withdrawn', 'completed'], default: 'pending' },
  appliedAt: { type: Date, default: Date.now },
  rating: { type: Number, min: 1, max: 5, default: null },
  completedAt: { type: Date, default: null },
  organizerNote: String,
  coverLetter: String,
  
  volunteerSnapshot: {
    fullName: String,
    skills: [String],
    experience: String
  }
});

applicationSchema.index({ eventId: 1, volunteerId: 1, roleId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
