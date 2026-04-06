const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const User = require('../models/User');
const Event = require('../models/Event');
const { protect, authorize } = require('../middleware/auth');
const { applyReputation } = require('../services/reputation');

// @route   POST /api/applications
// @desc    Apply for an event role
// @access  Private (Volunteer)
router.post('/', protect, authorize('volunteer'), async (req, res) => {
  try {
    const { eventId, roleId, coverLetter } = req.body;
    
    // Get snapshot of user skills/exp
    const user = await User.findById(req.user.id);
    const volunteerSnapshot = {
      fullName: user.profile.fullName,
      skills: user.profile.skills.map(s => s.name),
      experience: user.profile.bio || ''
    };

    const application = await Application.create({
      eventId,
      volunteerId: req.user.id,
      roleId,
      coverLetter,
      volunteerSnapshot
    });

    res.status(201).json({ success: true, data: application });
  } catch (err) {
    // 11000 is Mongo duplicate key error index
    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: 'You have already applied for this role' });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /api/applications/my-applications
// @desc    Get volunteer's applications
// @access  Private (Volunteer)
router.get('/my-applications', protect, authorize('volunteer'), async (req, res) => {
  try {
    const applications = await Application.find({ volunteerId: req.user.id })
                                        .populate('eventId', 'title banner schedule type location');
    res.status(200).json({ success: true, count: applications.length, data: applications });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /api/applications/event/:eventId
// @desc    Get applications for a specific event
// @access  Private (Organizer)
router.get('/event/:eventId', protect, authorize('organizer'), async (req, res) => {
  try {
    const applications = await Application.find({ eventId: req.params.eventId })
                                        .populate('volunteerId', 'profile.fullName profile.skills profile.profilePic email');
    res.status(200).json({ success: true, count: applications.length, data: applications });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /api/applications/:id/complete
// @desc    Mark a volunteer's application as completed and award reputation
// @access  Private (Organizer)
router.post('/:id/complete', protect, authorize('organizer'), async (req, res) => {
  try {
    const { rating } = req.body;

    // Validate rating if provided
    if (rating !== undefined && rating !== null) {
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, error: 'Rating must be an integer between 1 and 5' });
      }
    }

    // Fetch the application
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    // Verify the event belongs to the requesting organizer
    const event = await Event.findById(application.eventId);
    if (!event || event.organizerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to complete this application' });
    }

    // Guard against double-completion
    if (application.completedAt) {
      return res.status(400).json({ success: false, error: 'Application already completed' });
    }

    // Mark application as completed
    application.status = 'completed';
    application.rating = rating || null;
    application.completedAt = new Date();
    await application.save();

    // Award reputation
    const updatedReputation = await applyReputation(
      application.volunteerId,
      application._id,
      rating,
      application.eventId
    );

    res.status(200).json({ message: 'Volunteer marked as completed', reputation: updatedReputation });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
