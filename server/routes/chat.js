const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

// GET /api/chat/conversations
// Returns list of users the current user has chatted with + last message + unread count
router.get('/conversations', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all messages involving this user
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    })
      .sort({ createdAt: -1 })
      .populate('senderId', 'username profile.orgName profile.clientName profile.leadName role')
      .populate('receiverId', 'username profile.orgName profile.clientName profile.leadName role');

    // Build conversation map keyed by the other user's id
    const convMap = new Map();
    for (const msg of messages) {
      const other = msg.senderId._id.toString() === userId ? msg.receiverId : msg.senderId;
      const otherId = other._id.toString();
      if (!convMap.has(otherId)) {
        convMap.set(otherId, { user: other, lastMessage: msg, unread: 0 });
      }
      // Count unread messages sent TO current user
      if (msg.receiverId._id.toString() === userId && !msg.read) {
        convMap.get(otherId).unread++;
      }
    }

    res.json({ success: true, data: Array.from(convMap.values()) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/chat/messages/:userId
// Returns messages between current user and :userId, marks them as read
router.get('/messages/:userId', protect, async (req, res) => {
  try {
    const me = req.user.id;
    const other = req.params.userId;

    const messages = await Message.find({
      $or: [
        { senderId: me, receiverId: other },
        { senderId: other, receiverId: me }
      ]
    }).sort({ createdAt: 1 });

    // Mark incoming messages as read
    await Message.updateMany(
      { senderId: other, receiverId: me, read: false },
      { $set: { read: true } }
    );

    res.json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/chat/messages
// Send a message
router.post('/messages', protect, async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    if (!receiverId || !text?.trim()) {
      return res.status(400).json({ success: false, error: 'receiverId and text are required' });
    }

    const message = await Message.create({
      senderId: req.user.id,
      receiverId,
      text: text.trim()
    });

    res.status(201).json({ success: true, data: message });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/chat/unread-count
// Returns total unread message count for current user
router.get('/unread-count', protect, async (req, res) => {
  try {
    const count = await Message.countDocuments({ receiverId: req.user.id, read: false });
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
