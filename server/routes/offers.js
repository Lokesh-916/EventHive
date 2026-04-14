const express = require('express');
const router = express.Router();
const ClientOffer = require('../models/ClientOffer');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/offers
// @desc    Client sends an offer to an organizer
// @access  Private (Client)
router.post('/', protect, authorize('client'), async (req, res) => {
  try {
    const { organizerId, title, description, budgetMin, budgetMax, eventDate, city } = req.body;
    if (!organizerId || !title) {
      return res.status(400).json({ success: false, error: 'organizerId and title are required' });
    }

    const offer = await ClientOffer.create({
      clientId: req.user.id,
      organizerId,
      title,
      description,
      budgetMin,
      budgetMax,
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
    const offers = await ClientOffer.find({ organizerId: req.user.id, status: { $in: ['pending', 'accepted', 'completed'] } })
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

// @route   POST /api/offers/:id/expenses
// @desc    Organizer adds an expense to an active offer
// @access  Private (Organizer)
router.post('/:id/expenses', protect, authorize('organizer'), async (req, res) => {
  try {
    const { description, amount } = req.body;
    if (!description || amount === undefined) {
      return res.status(400).json({ success: false, error: 'Description and amount are required' });
    }

    const offer = await ClientOffer.findOne({ _id: req.params.id, organizerId: req.user.id });
    if (!offer) return res.status(404).json({ success: false, error: 'Offer not found' });
    if (offer.status !== 'accepted') {
      return res.status(400).json({ success: false, error: 'Expenses can only be added to actively accepted offers' });
    }

    offer.expenses.push({ description, amount: Number(amount) });
    await offer.save();

    res.json({ success: true, data: offer });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   DELETE /api/offers/:id/expenses/:expenseId
// @desc    Organizer marks an expense as deleted (soft delete)
// @access  Private (Organizer)
router.delete('/:id/expenses/:expenseId', protect, authorize('organizer'), async (req, res) => {
  try {
    const offer = await ClientOffer.findOne({ _id: req.params.id, organizerId: req.user.id });
    if (!offer) return res.status(404).json({ success: false, error: 'Offer not found' });
    if (offer.status !== 'accepted') {
      return res.status(400).json({ success: false, error: 'Expenses can only be deleted from actively accepted offers' });
    }

    const expense = offer.expenses.id(req.params.expenseId);
    if (!expense) return res.status(404).json({ success: false, error: 'Expense not found' });

    expense.isDeleted = true;
    await offer.save();

    res.json({ success: true, data: offer });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   PUT /api/offers/:id/advance
// @desc    Organizer sets or updates the advance amount
// @access  Private (Organizer)
router.put('/:id/advance', protect, authorize('organizer'), async (req, res) => {
  try {
    const { amount } = req.body;
    if (amount === undefined || amount < 0) {
      return res.status(400).json({ success: false, error: 'Valid amount is required' });
    }

    const offer = await ClientOffer.findOne({ _id: req.params.id, organizerId: req.user.id });
    if (!offer) return res.status(404).json({ success: false, error: 'Offer not found' });
    if (offer.status !== 'accepted') {
      return res.status(400).json({ success: false, error: 'Advance can only be set on accepted offers' });
    }

    // Set or update the advance and reset status to pending (client needs to pay or negotiate)
    offer.advance = {
      amount: Number(amount),
      status: 'pending',
      requestedAmount: undefined,
      negotiationMessage: undefined
    };
    
    await offer.save();
    res.json({ success: true, data: offer });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   PUT /api/offers/:id/advance/negotiate
// @desc    Client requests negotiation for the advance format
// @access  Private (Client)
router.put('/:id/advance/negotiate', protect, authorize('client'), async (req, res) => {
  try {
    const { requestedAmount, message } = req.body;
    if (requestedAmount === undefined || requestedAmount < 0 || !message) {
      return res.status(400).json({ success: false, error: 'Valid requestedAmount and message are required' });
    }

    const offer = await ClientOffer.findOne({ _id: req.params.id, clientId: req.user.id });
    if (!offer) return res.status(404).json({ success: false, error: 'Offer not found' });
    if (offer.status !== 'accepted' || !offer.advance || offer.advance.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Offer must have a pending advance to negotiate' });
    }

    offer.advance.status = 'negotiating';
    offer.advance.requestedAmount = Number(requestedAmount);
    offer.advance.negotiationMessage = message;

    await offer.save();
    res.json({ success: true, data: offer });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /api/offers/:id/advance/pay
// @desc    Client pays the advance via Mock Razorpay Dummy Gateway
// @access  Private (Client)
router.post('/:id/advance/pay', protect, authorize('client'), async (req, res) => {
  try {
    const offer = await ClientOffer.findOne({ _id: req.params.id, clientId: req.user.id });
    if (!offer) return res.status(404).json({ success: false, error: 'Offer not found' });
    if (offer.status !== 'accepted' || !offer.advance || offer.advance.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Offer must have a pending advance to pay' });
    }

    // Mock successful payment
    offer.advance.status = 'paid';
    
    await offer.save();
    res.json({ success: true, data: offer });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
