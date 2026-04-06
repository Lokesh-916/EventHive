const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const badgeSchema = new mongoose.Schema({
  badgeId:   { type: String, required: true },
  awardedAt: { type: Date, default: Date.now },
  eventId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null }
}, { _id: false });

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
    clientRole: String,
    profilePic: String,
    // Volunteer
    fullName: String,
    dob: Date,
    gender: String,
    languages: [String],
    experience: String,
    skills: [{ name: String, rating: Number }],
    availability: {
      mon: [String], tue: [String], wed: [String], thu: [String], fri: [String], sat: [String], sun: [String]
    },
    location: {
      city: String, state: String, country: String, coordinates: [Number]
    }
  },
  reputation: {
    xp:              { type: Number, default: 0 },
    rank:            { type: String, default: 'Newcomer' },
    eventsCompleted: { type: Number, default: 0 },
    badges: {
      type: [badgeSchema],
      default: [],
      validate: {
        validator: function(arr) { return arr.length <= 50; },
        message: 'Badge array exceeds maximum of 50 entries'
      }
    }
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
