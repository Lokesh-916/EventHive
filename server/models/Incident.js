const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  issueType: String,
  customIssueType: String,
  description: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
  timestamp: { type: Date, default: Date.now },
  evidence: [String],
  impact: [String],
  status: { type: String, enum: ['open', 'investigating', 'resolved', 'closed'], default: 'open' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolution: String,
  resolvedAt: Date,
  actionsTaken: [String]
}, { timestamps: true });

module.exports = mongoose.model('Incident', incidentSchema);
