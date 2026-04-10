const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   POST /api/events
// @desc    Create a new event
// @access  Private (Organizer)
router.post('/', protect, authorize('organizer'), upload.single('banner'), async (req, res) => {
  try {
    const eventData = { ...req.body, organizerId: req.user.id };
    
    // Parse JSON strings back to objects/arrays
    if(req.body.tags) eventData.tags = JSON.parse(req.body.tags);
    if(req.body.schedule) eventData.schedule = JSON.parse(req.body.schedule);
    if(req.body.location) eventData.location = JSON.parse(req.body.location);
    if(req.body.volunteerRequirements) eventData.volunteerRequirements = JSON.parse(req.body.volunteerRequirements);
    if(req.body.volunteerRoles) eventData.volunteerRoles = JSON.parse(req.body.volunteerRoles);
    if(req.body.media) eventData.media = JSON.parse(req.body.media);
    if(req.body.timetable) eventData.timetable = JSON.parse(req.body.timetable);
    
    if (req.file) {
      eventData.banner = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    const event = await Event.create(eventData);
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /api/events/my
// @desc    Get events created by the logged-in organizer
// @access  Private (Organizer)
router.get('/my', protect, authorize('organizer'), async (req, res) => {
  try {
    const events = await Event.find({ organizerId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /api/events
// @desc    Get all events
// @access  Public
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().populate('organizerId', 'username profile.orgName profile.organization');
    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /api/events/:id/overview
// @desc    Get event overview with volunteer assignments
// @access  Public (role-based UI rendering handled on client)
router.get('/:id/overview', async (req, res) => {
  try {
    const Application = require('../models/Application');
    const event = await Event.findById(req.params.id)
      .populate('organizerId', 'username email profile.orgName profile.organization profile.profilePic');
    if (!event) return res.status(404).json({ success: false, error: 'Event not found' });

    const applications = await Application.find({ eventId: req.params.id })
      .populate('volunteerId', 'username email profile.fullName profile.skills profile.profilePic profile.bio');

    res.status(200).json({
      success: true,
      data: {
        event,
        applications
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   PATCH /api/events/:id/status
// @desc    Update event status (organizer only)
// @access  Private (Organizer)
router.patch('/:id/status', protect, authorize('organizer'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, error: 'Event not found' });
    if (event.organizerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    event.status = req.body.status;
    await event.save();
    res.status(200).json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   PATCH /api/events/:id/role-notes
// @desc    Update volunteer role notes (organizer only)
// @access  Private (Organizer)
router.patch('/:id/role-notes', protect, authorize('organizer'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, error: 'Event not found' });
    if (event.organizerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    const { roleId, notes } = req.body;
    const role = event.volunteerRoles.find(r => r.roleId === roleId);
    if (!role) return res.status(404).json({ success: false, error: 'Role not found' });
    role.notes = notes;
    await event.save();
    res.status(200).json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   PATCH /api/events/:id/timetable
// @desc    Update event timetable (organizer only)
// @access  Private (Organizer)
router.patch('/:id/timetable', protect, authorize('organizer'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, error: 'Event not found' });
    if (event.organizerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    
    event.timetable = req.body.timetable;
    await event.save();
    res.status(200).json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /api/events/:id
// @desc    Get event by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizerId', 'username profile.orgName profile.organization');
    if (!event) return res.status(404).json({ success: false, error: 'Event not found' });
    res.status(200).json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
