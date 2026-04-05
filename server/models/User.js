const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password_hash: { type: String, required: true },
  role: { type: String, enum: ['volunteer', 'organizer', 'client'], required: true },
  profile: {
    // Organizer
    orgName: String,
    logo: String,
    leadName: String,
    organization: String,
    eventTypes: [String],
    officialEmail: String,
    mobile: String,
    website: String,
    bio: String,
    portfolio: [String],
    // Client
    clientName: String,
    clientType: String,
    clientRole: String, // mapped to role in frontend form logic
    profilePic: String,
    // Volunteer
    fullName: String,
    skills: [{ name: String, rating: Number }],
    availability: {
      mon: [String], tue: [String], wed: [String], thu: [String], fri: [String], sat: [String], sun: [String]
    },
    location: {
      city: String, state: String, country: String, coordinates: [Number]
    }
  },
  // Organizer rating data
  ratings: [{
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    offerId:  { type: mongoose.Schema.Types.ObjectId, ref: 'ClientOffer' },
    score:    { type: Number, min: 1, max: 5 },
    review:   { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  ratingAvg:    { type: Number, default: 0 },
  eventsHosted: { type: Number, default: 0 },

  // Volunteer reputation & badges
  reputation: {
    xp:              { type: Number, default: 0 },
    rank:            { type: String, default: 'Newcomer' },
    eventsCompleted: { type: Number, default: 0 },
    badges: [{
      badgeId:   { type: String },
      awardedAt: { type: Date, default: Date.now },
      eventId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null }
    }]
  }
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (!this.isModified('password_hash')) return;
  this.password_hash = await bcrypt.hash(this.password_hash, 10);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password_hash);
};

module.exports = mongoose.model('User', userSchema);
