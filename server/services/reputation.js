const User = require('../models/User');
const Application = require('../models/Application');

const RANK_TIERS = [
  { rank: 'Newcomer',    min: 0,    max: 99   },
  { rank: 'Rising Star', min: 100,  max: 299  },
  { rank: 'Reliable',    min: 300,  max: 599  },
  { rank: 'Veteran',     min: 600,  max: 999  },
  { rank: 'Elite',       min: 1000, max: 1999 },
  { rank: 'Legend',      min: 2000, max: Infinity },
];

function computeXpGain(rating) {
  let xp = 50;
  if (rating === 4) xp += 10;
  else if (rating === 5) xp += 25;
  return xp;
}

function computeRank(xp) {
  for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
    if (xp >= RANK_TIERS[i].min) return RANK_TIERS[i].rank;
  }
  return 'Newcomer';
}

function evaluateBadges(reputationDoc, catalogBadges, context) {
  const { eventsCompleted, xp, fiveStarCount, completedMonths } = context;
  const heldIds = new Set((reputationDoc.badges || []).map(b => b.badgeId));

  const criteria = {
    first_step:  () => eventsCompleted >= 1,
    team_player: () => eventsCompleted >= 5,
    dedicated:   () => eventsCompleted >= 10,
    centurion:   () => xp >= 100,
    rising_star: () => xp >= 300,
    veteran:     () => xp >= 600,
    top_rated:   () => fiveStarCount >= 3,
    consistent:  () => new Set(completedMonths).size >= 3,
    legend:      () => xp >= 2000,
  };

  return catalogBadges
    .filter(badge => !heldIds.has(badge.id) && criteria[badge.id] && criteria[badge.id]())
    .map(badge => badge.id);
}

async function applyReputation(userId, applicationId, rating, eventId) {
  const application = await Application.findById(applicationId);
  if (!application || application.completedAt) return null;

  const user = await User.findById(userId);
  if (!user) return null;

  const xpGain = computeXpGain(rating);
  const newXp = (user.reputation.xp || 0) + xpGain;
  const newRank = computeRank(newXp);
  const newEventsCompleted = (user.reputation.eventsCompleted || 0) + 1;

  const completedApps = await Application.find({
    volunteerId: userId,
    completedAt: { $ne: null },
    _id: { $ne: applicationId },
  }).select('rating completedAt');

  const fiveStarCount = completedApps.filter(a => a.rating === 5).length + (rating === 5 ? 1 : 0);
  const completedMonths = completedApps
    .map(a => a.completedAt.toISOString().slice(0, 7))
    .concat([new Date().toISOString().slice(0, 7)]);

  const { BADGES } = require('./badgeCatalog');
  const context = { eventsCompleted: newEventsCompleted, xp: newXp, fiveStarCount, completedMonths };
  const newBadgeIds = evaluateBadges(user.reputation, BADGES, context);
  const newBadgeObjects = newBadgeIds.map(id => ({ badgeId: id, awardedAt: new Date(), eventId: eventId || null }));

  const updated = await User.findByIdAndUpdate(
    userId,
    {
      $inc: { 'reputation.xp': xpGain, 'reputation.eventsCompleted': 1 },
      $set: { 'reputation.rank': newRank },
      ...(newBadgeObjects.length > 0 && {
        $push: {
          'reputation.badges': {
            $each: newBadgeObjects,
            $slice: -50,
          },
        },
      }),
    },
    { new: true }
  );

  return updated.reputation;
}

module.exports = { computeXpGain, computeRank, evaluateBadges, applyReputation };
