const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  tagline: String,
  description: String,
  banner: String,
  category: String,
  tags: [String],
  type: { type: String, enum: ['physical', 'virtual', 'hybrid'] },
  
  schedule: {
    start: Date,
    end: Date,
    timezone: String,
    applicationDeadline: Date
  },

  timetable: [{
    day: Number,
    startTime: String,
    endTime: String,
    title: String,
    description: String
  }],
  
  location: {
    venueName: String,
    city: String,
    stateCountry: String,
    coordinates: [Number],
    virtualLink: String
  },
  
  volunteerRequirements: {
    totalVolunteers: Number,
    minAge: Number,
    perks: String,
    preferredSkills: [String],
    generalNote: String
  },
  
  volunteerRoles: [{
    roleId: String,
    title: String,
    count: Number,
    notes: String,
    acceptedCount: { type: Number, default: 0 }
  }],
  
  media: {
    promoVideo: String,
    supportContact: String,
    socials: {
      twitter: String,
      instagram: String,
      linkedin: String,
      facebook: String
    }
  },
  
  status: { type: String, default: 'draft' } // draft, published, ongoing, completed, cancelled
}, { timestamps: true });

eventSchema.index({ status: 1 });
eventSchema.index({ category: 1 });

module.exports = mongoose.model('Event', eventSchema);
