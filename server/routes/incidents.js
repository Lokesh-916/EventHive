const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident');
const Application = require('../models/Application');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   POST /api/incidents
// @desc    Report an incident
// @access  Private (Volunteer with approved application for the event)
router.post('/', protect, authorize('volunteer'), upload.array('evidence', 5), async (req, res) => {
  try {
    const eventId = req.body.eventId;

    // Verify the volunteer has an approved application for this event
    if (!eventId) {
      return res.status(400).json({ success: false, error: 'eventId is required to report an incident' });
    }

    const approvedApp = await Application.findOne({
      eventId,
      volunteerId: req.user.id,
      status: 'approved'
    });

    if (!approvedApp) {
      return res.status(403).json({ success: false, error: 'Only approved volunteers for this event can report incidents' });
    }

    const evidencePaths = req.files ? req.files.map(file => `data:${file.mimetype};base64,${file.buffer.toString('base64')}`) : [];

    let issueType = req.body.type;
    let customIssueType = '';
    if (req.body.category === 'other' || req.body.type === 'other') {
      customIssueType = req.body.custom_type || req.body.type_input;
      issueType = 'other';
    }

    const incident = await Incident.create({
      eventId,
      reporterId: req.user.id,
      category: req.body.category,
      issueType: issueType,
      customIssueType: customIssueType,
      description: req.body.description,
      severity: req.body.severity,
      timestamp: req.body.timestamp || Date.now(),
      evidence: evidencePaths,
      impact: req.body.impact ? (Array.isArray(req.body.impact) ? req.body.impact : [req.body.impact]) : []
    });

    res.status(201).json({ success: true, data: incident });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /api/incidents/event/:eventId
// @desc    Get incidents for an event
// @access  Private (Organizer/Admin)
router.get('/event/:eventId', protect, async (req, res) => {
  try {
    const incidents = await Incident.find({ eventId: req.params.eventId })
                                    .populate('reporterId', 'username role')
                                    .populate('assignedTo', 'username');
    res.status(200).json({ success: true, count: incidents.length, data: incidents });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /api/incidents
// @desc    Get all incidents (could be restricted to admins or system users)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const incidents = await Incident.find()
                                    .populate('reporterId', 'username role')
                                    .populate('eventId', 'title');
    res.status(200).json({ success: true, count: incidents.length, data: incidents });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
