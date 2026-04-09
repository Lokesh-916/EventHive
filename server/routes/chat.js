const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Event = require('../models/Event');
const Application = require('../models/Application');
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

// EVENT CHAT ROUTES

// GET /api/chat/event/:eventId/messages
// Get all messages for an event (organizer and enrolled volunteers only)
router.get('/event/:eventId/messages', protect, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Check if user has access to this event chat
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    const isOrganizer = event.organizerId.toString() === userId;
    let isEnrolledVolunteer = false;

    if (!isOrganizer) {
      // Check if user is an enrolled volunteer
      const application = await Application.findOne({
        eventId,
        volunteerId: userId,
        status: 'approved'
      });
      isEnrolledVolunteer = !!application;
    }

    if (!isOrganizer && !isEnrolledVolunteer) {
      return res.status(403).json({ success: false, error: 'Access denied to event chat' });
    }

    // Get event messages
    const messages = await Message.find({ eventId, messageType: 'event' })
      .sort({ createdAt: 1 })
      .populate('senderId', 'username profile.fullName profile.orgName role profile.profilePic');

    // Mark messages as read for current user
    await Message.updateMany(
      { eventId, receiverId: userId, read: false },
      { $set: { read: true } }
    );

    res.json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/chat/event/:eventId/messages
// Send a message to event chat
router.post('/event/:eventId/messages', protect, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    if (!text?.trim()) {
      return res.status(400).json({ success: false, error: 'Message text is required' });
    }

    // Check if user has access to this event chat
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    const isOrganizer = event.organizerId.toString() === userId;
    let isEnrolledVolunteer = false;

    if (!isOrganizer) {
      const application = await Application.findOne({
        eventId,
        volunteerId: userId,
        status: 'approved'
      });
      isEnrolledVolunteer = !!application;
    }

    if (!isOrganizer && !isEnrolledVolunteer) {
      return res.status(403).json({ success: false, error: 'Access denied to event chat' });
    }

    // Get all participants (organizer + enrolled volunteers) for broadcast
    const applications = await Application.find({
      eventId,
      status: 'approved'
    }).populate('volunteerId', '_id');

    const participants = [event.organizerId];
    applications.forEach(app => {
      if (app.volunteerId && !participants.includes(app.volunteerId._id)) {
        participants.push(app.volunteerId._id);
      }
    });

    // Create message for each participant (broadcast style)
    const messages = [];
    for (const participantId of participants) {
      if (participantId.toString() !== userId) { // Don't send to self
        const message = await Message.create({
          senderId: userId,
          receiverId: participantId,
          eventId,
          text: text.trim(),
          messageType: 'event'
        });
        messages.push(message);
      }
    }

    // Return the message with sender info
    const messageWithSender = await Message.findById(messages[0]?._id || null)
      .populate('senderId', 'username profile.fullName profile.orgName role profile.profilePic');

    res.status(201).json({ success: true, data: messageWithSender });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/chat/event/:eventId/participants
// Get all participants in event chat (organizer + enrolled volunteers)
router.get('/event/:eventId/participants', protect, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Check if user has access to this event chat
    const event = await Event.findById(eventId).populate('organizerId', 'username profile.fullName profile.orgName role profile.profilePic');
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    const isOrganizer = event.organizerId._id.toString() === userId;
    let isEnrolledVolunteer = false;

    if (!isOrganizer) {
      const application = await Application.findOne({
        eventId,
        volunteerId: userId,
        status: 'approved'
      });
      isEnrolledVolunteer = !!application;
    }

    if (!isOrganizer && !isEnrolledVolunteer) {
      return res.status(403).json({ success: false, error: 'Access denied to event chat' });
    }

    // Get enrolled volunteers grouped by role
    const applications = await Application.find({
      eventId,
      status: 'approved'
    }).populate('volunteerId', 'username profile.fullName profile.skills role profile.profilePic');

    // Group volunteers by role
    const roleGroups = {};
    applications.forEach(app => {
      if (app.volunteerId) {
        const roleName = app.roleName || 'General Volunteer';
        if (!roleGroups[roleName]) {
          roleGroups[roleName] = [];
        }
        roleGroups[roleName].push({
          id: app.volunteerId._id,
          username: app.volunteerId.username,
          fullName: app.volunteerId.profile?.fullName || app.volunteerId.username,
          role: app.volunteerId.role,
          profilePic: app.volunteerId.profile?.profilePic,
          skills: app.volunteerId.profile?.skills || []
        });
      }
    });

    res.json({
      success: true,
      data: {
        organizer: {
          id: event.organizerId._id,
          username: event.organizerId.username,
          fullName: event.organizerId.profile?.orgName || event.organizerId.profile?.fullName || event.organizerId.username,
          role: event.organizerId.role,
          profilePic: event.organizerId.profile?.profilePic
        },
        volunteerGroups: roleGroups
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/chat/event/:eventId/unread-count
// Get unread message count for current user in event chat
router.get('/event/:eventId/unread-count', protect, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Check if user has access to this event chat
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    const isOrganizer = event.organizerId.toString() === userId;
    let isEnrolledVolunteer = false;

    if (!isOrganizer) {
      const application = await Application.findOne({
        eventId,
        volunteerId: userId,
        status: 'approved'
      });
      isEnrolledVolunteer = !!application;
    }

    if (!isOrganizer && !isEnrolledVolunteer) {
      return res.status(403).json({ success: false, error: 'Access denied to event chat' });
    }

    // Count unread event messages for this user
    const count = await Message.countDocuments({
      eventId,
      receiverId: userId,
      messageType: 'event',
      read: false
    });

    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
