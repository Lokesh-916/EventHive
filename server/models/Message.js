const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null }, // null for direct messages, eventId for event chat
  text:       { type: String, required: true, maxlength: 2000 },
  read:       { type: Boolean, default: false },
  messageType: { type: String, enum: ['direct', 'event'], default: 'direct' }
}, { timestamps: true });

// Index for fast conversation lookup
messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ receiverId: 1, read: 1 });
messageSchema.index({ eventId: 1, createdAt: -1 }); // For event chat messages

module.exports = mongoose.model('Message', messageSchema);
