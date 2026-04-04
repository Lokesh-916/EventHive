const express = require('express');
const router = express.Router();
const ClientOffer = require('../models/ClientOffer');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/offers
// @desc    Client sends an offer to an organizer
// @access  Private (Client)
router.post('/', protect, authorize('client'), async (req, res) => {
  try {
    const { organizerId, title, description, budget, eventDate, city } = req.body;
    if (!organizerId || !title) {
      return res.status(400).json({ success: false, error: 'organizerId and title are required' });
    }

    const offer = await ClientOffer.create({
      clientId: req.user.id,
      organizerId,
      title,
      description,
      budget,
      eventDate,
      city
    });

    res.status(201).json({ success: true, data: offer });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /api/offers/my-offers
// @desc    Client sees all offers they sent
// @access  Private (Client)
router.get('/my-offers', protect, authorize('client'), async (req, res) => {
  try {
    const offers = await ClientOffer.find({ clientId: req.user.id })
      .populate('organizerId', 'username profile.orgName profile.leadName ratingAvg eventsHosted')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: offers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /api/offers/incoming
// @desc    Organizer sees offers sent to them
// @access  Private (Organizer)
router.get('/incoming', protect, authorize('organizer'), async (req, res) => {
  try {
    const offers = await ClientOffer.find({ organizerId: req.user.id, status: 'pending' })
      .populate('clientId', 'username profile.clientName profile.clientType email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: offers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   PATCH /api/offers/:id/accept
// @desc    Organizer accepts an offer
// @access  Private (Organizer)
router.patch('/:id/accept', protect, authorize('organizer'), async (req, res) => {
  try {
    const offer = await ClientOffer.findOne({ _id: req.params.id, organizerId: req.user.id });
    if (!offer) return res.status(404).json({ success: false, error: 'Offer not found' });
    if (offer.status !== 'pending') return res.status(400).json({ success: false, error: 'Offer is no longer pending' });

    offer.status = 'accepted';
    await offer.save();

    res.json({ success: true, data: offer });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   PATCH /api/offers/:id/reject
// @desc    Organizer rejects an offer
// @access  Private (Organizer)
router.patch('/:id/reject', protect, authorize('organizer'), async (req, res) => {
  try {
    const offer = await ClientOffer.findOne({ _id: req.params.id, organizerId: req.user.id });
    if (!offer) return res.status(404).json({ success: false, error: 'Offer not found' });
    if (offer.status !== 'pending') return res.status(400).json({ success: false, error: 'Offer is no longer pending' });

    offer.status = 'rejected';
    await offer.save();

    res.json({ success: true, data: offer });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   PATCH /api/offers/:id/complete
// @desc    Organizer marks an accepted offer as completed (event hosted)
// @access  Private (Organizer)
router.patch('/:id/complete', protect, authorize('organizer'), async (req, res) => {
  try {
    const offer = await ClientOffer.findOne({ _id: req.params.id, organizerId: req.user.id });
    if (!offer) return res.status(404).json({ success: false, error: 'Offer not found' });
    if (offer.status !== 'accepted') return res.status(400).json({ success: false, error: 'Only accepted offers can be marked complete' });

    offer.status = 'completed';
    await offer.save();

    // Increment eventsHosted on the organizer
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user.id, { $inc: { eventsHosted: 1 } });

    res.json({ success: true, data: offer });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
