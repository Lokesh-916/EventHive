const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roleId: { type: String, required: true },
  roleName: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'withdrawn'], default: 'pending' },
  appliedAt: { type: Date, default: Date.now },
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
