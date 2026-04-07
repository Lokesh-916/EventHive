const mongoose = require('mongoose');

const clientOfferSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  budgetMin: { type: Number },
  budgetMax: { type: Number },
  expenses: [{
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false }
  }],
  eventDate: { type: Date },
  city: { type: String },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending'
  },
  isRated: { type: Boolean, default: false }  // prevents double-rating
}, { timestamps: true });

module.exports = mongoose.model('ClientOffer', clientOfferSchema);
