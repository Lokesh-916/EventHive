const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { BADGES } = require('../services/badgeCatalog');
const { protect } = require('../middleware/auth');

// @route   GET /api/reputation/catalog
// @desc    Get full badge catalog
// @access  Public
router.get('/catalog', (req, res) => {
  res.status(200).json({ badges: BADGES });
});

// @route   GET /api/reputation/:volunteerId
// @desc    Get volunteer reputation profile
// @access  Private (any authenticated role)
router.get('/:volunteerId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.volunteerId).select(
      'role reputation profile.fullName profile.profilePic profile.skills'
    );

    if (!user || user.role !== 'volunteer') {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }

    const rep = user.reputation || {};
    const { xp = 0, rank = 'Newcomer', eventsCompleted = 0, badges = [] } = rep;

    // Enrich stored badge references with catalog data (name + icon)
    const enrichedBadges = badges.map(b => {
      const def = BADGES.find(c => c.id === b.badgeId);
      return {
        badgeId:   b.badgeId,
        name:      def ? def.name        : b.badgeId,
        icon:      def ? def.icon        : '★',
        svgPath:   def ? def.svgPath     : null,
        awardedAt: b.awardedAt,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        xp,
        rank,
        eventsCompleted,
        badges: enrichedBadges,
        fullName:   user.profile?.fullName,
        profilePic: user.profile?.profilePic,
        skills:     user.profile?.skills,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
