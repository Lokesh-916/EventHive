const mongoose = require('mongoose');

const eventAnalyticsSchema = new mongoose.Schema({
  eventId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, unique: true },
  organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true },

  registeredAttendees:        { type: Number, default: 0 },
  actualAttendees:            { type: Number, default: 0 },
  socialReach:                { type: Number, default: 0 },
  websiteClicks:              { type: Number, default: 0 },
  checkIns:                   { type: Number, default: 0 },
  incidentCount:              { type: Number, default: 0 },
  volunteerSatisfactionScore: { type: Number, default: 0 },
  npsScore:                   { type: Number, default: 0 },

  applicationTimeline: [{ date: Date, count: Number }],
  roleBreakdown: [{
    roleId:   String,
    roleName: String,
    applied:  Number,
    approved: Number,
  }],
}, { timestamps: true });

module.exports = mongoose.model('EventAnalytics', eventAnalyticsSchema);
