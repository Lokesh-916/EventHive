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
