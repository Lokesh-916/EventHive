const express = require("express");
const router = express.Router();
const User = require("../models/User");
const ClientOffer = require("../models/ClientOffer");
const { protect, authorize } = require("../middleware/auth");

// Helper: Calculate composite rating based on client reviews (50%) and events hosted (50%)
// Cap event score at 5 (10 events = 5 stars).
function getCompositeRating(clientRatingAvg, eventsHosted) {
  const eventScore = Math.min(5, eventsHosted * 0.5);
  // If no client ratings exist, purely use the experience score
  if (!clientRatingAvg || clientRatingAvg === 0) {
    return Number(eventScore.toFixed(1));
  }
  return Number(((clientRatingAvg + eventScore) / 2).toFixed(1));
}

// @route   GET /api/organizers
// @desc    Get all organizers (public)
router.get("/organizers", async (req, res) => {
  try {
    const organizers = await User.find({ role: "organizer" })
      .select("-password_hash -ratings").lean();
      
    const Event = require("../models/Event");
    for (let org of organizers) {
      org.eventsHosted = await Event.countDocuments({ organizerId: org._id });
      org.ratingAvg = getCompositeRating(org.ratingAvg || 0, org.eventsHosted);
    }
    
    res.json(organizers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/organizers/:id
// @desc    Get single organizer (public)
router.get("/organizers/:id", async (req, res) => {
  try {
    const organizer = await User.findOne({ _id: req.params.id, role: "organizer" })
      .select("-password_hash").lean();
    if (!organizer) return res.status(404).json({ error: "Organizer not found" });
    
    const Event = require("../models/Event");
    organizer.eventsHosted = await Event.countDocuments({ organizerId: organizer._id });
    organizer.ratingAvg = getCompositeRating(organizer.ratingAvg || 0, organizer.eventsHosted);
    
    res.json(organizer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/organizers/:id/ratings
// @desc    Get all reviews for an organizer (public)
router.get("/organizers/:id/ratings", async (req, res) => {
  try {
    const organizer = await User.findOne({ _id: req.params.id, role: "organizer" })
      .select("ratings ratingAvg username profile.orgName profile.leadName")
      .populate("ratings.clientId", "username profile.clientName").lean();
    if (!organizer) return res.status(404).json({ error: "Organizer not found" });
    
    const Event = require("../models/Event");
    const count = await Event.countDocuments({ organizerId: organizer._id });
    const compositeAvg = getCompositeRating(organizer.ratingAvg || 0, count);
    
    res.json({
      ratingAvg: compositeAvg,
      eventsHosted: count,
      count: organizer.ratings.length,
      ratings: organizer.ratings
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/organizers/:id/rate
// @desc    Client rates an organizer after a completed offer
// @access  Private (Client)
router.post("/organizers/:id/rate", protect, authorize("client"), async (req, res) => {
  try {
    const { offerId, score, review } = req.body;

    if (!offerId || !score) {
      return res.status(400).json({ success: false, error: "offerId and score are required" });
    }
    if (score < 1 || score > 5) {
      return res.status(400).json({ success: false, error: "Score must be between 1 and 5" });
    }

    // Validate the offer: must be completed, belong to this client, and target this organizer
    const offer = await ClientOffer.findOne({
      _id: offerId,
      clientId: req.user.id,
      organizerId: req.params.id,
      status: "completed"
    });

    if (!offer) {
      return res.status(403).json({
        success: false,
        error: "No completed booking found for this organizer with your account"
      });
    }

    // Prevent double-rating the same offer
    if (offer.isRated) {
      return res.status(400).json({ success: false, error: "You have already rated this booking" });
    }

    // Add rating to organizer
    const organizer = await User.findById(req.params.id);
    if (!organizer || organizer.role !== "organizer") {
      return res.status(404).json({ success: false, error: "Organizer not found" });
    }

    organizer.ratings.push({
      clientId: req.user.id,
      offerId,
      score: Number(score),
      review: review || ""
    });

    // Recompute client average
    const total = organizer.ratings.reduce((sum, r) => sum + r.score, 0);
    const clientRatingAvg = Math.round((total / organizer.ratings.length) * 10) / 10;
    organizer.ratingAvg = clientRatingAvg;

    await organizer.save();

    const Event = require("../models/Event");
    const count = await Event.countDocuments({ organizerId: organizer._id });
    const compositeAvg = getCompositeRating(clientRatingAvg, count);

    // Mark offer as rated
    offer.isRated = true;
    await offer.save();

    res.json({
      success: true,
      ratingAvg: compositeAvg,
      totalRatings: organizer.ratings.length
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /api/organizers/:id/events
// @desc    Get recent events hosted by an organizer (public)
router.get("/organizers/:id/events", async (req, res) => {
  try {
    const Event = require("../models/Event");
    const events = await Event.find({ organizerId: req.params.id })
      .sort({ createdAt: -1 })
      .limit(6)
      .select("title date location tags banner status");
    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;