const express     = require('express');
const router      = express.Router();
const Event       = require('../models/Event');
const Application = require('../models/Application');
const EventAnalytics = require('../models/EventAnalytics');
const { protect, authorize } = require('../middleware/auth');

// GET /api/analytics/overview
router.get('/overview', protect, authorize('organizer'), async (req, res) => {
  try {
    const events   = await Event.find({ organizerId: req.user.id });
    const eventIds = events.map(e => e._id);
    const [analytics, applications] = await Promise.all([
      EventAnalytics.find({ organizerId: req.user.id }),
      Application.find({ eventId: { $in: eventIds } }),
    ]);

    const totalEvents     = events.length;
    const completedEvents = events.filter(e => e.status === 'completed').length;
    const ongoingEvents   = events.filter(e => e.status === 'ongoing').length;
    const upcomingEvents  = events.filter(e => ['published','draft'].includes(e.status)).length;
    const totalVolunteersNeeded = events.reduce((s,e) => s + (e.volunteerRequirements?.totalVolunteers||0), 0);
    const totalApproved = applications.filter(a => a.status === 'approved').length;
    const totalApplied  = applications.length;
    const fillRate = totalVolunteersNeeded > 0 ? Math.round((totalApproved/totalVolunteersNeeded)*100) : 0;
    const totalAttendees = analytics.reduce((s,a) => s + (a.actualAttendees||0), 0);
    const totalReach     = analytics.reduce((s,a) => s + (a.socialReach||0), 0);

    const categoryMap = {};
    events.forEach(e => { const c = e.category||'other'; categoryMap[c] = (categoryMap[c]||0)+1; });

    const cityMap = {};
    events.forEach(e => { const c = e.location?.city||'Unknown'; cityMap[c] = (cityMap[c]||0)+1; });

    const sixtyDaysAgo = new Date(Date.now() - 60*864e5);
    const weeklyMap = {};
    applications.filter(a => new Date(a.appliedAt) >= sixtyDaysAgo).forEach(a => {
      const d = new Date(a.appliedAt);
      const ws = new Date(d); ws.setDate(d.getDate()-d.getDay());
      const key = ws.toISOString().slice(0,10);
      weeklyMap[key] = (weeklyMap[key]||0)+1;
    });
    const appTimeline = Object.entries(weeklyMap).sort(([a],[b])=>a.localeCompare(b)).map(([date,count])=>({date,count}));

    const roleMap = {};
    applications.forEach(a => {
      const k = a.roleName||a.roleId||'Unknown';
      if (!roleMap[k]) roleMap[k] = { applied:0, approved:0 };
      roleMap[k].applied++;
      if (a.status==='approved') roleMap[k].approved++;
    });
    const rolePopularity = Object.entries(roleMap).map(([name,d])=>({name,...d})).sort((a,b)=>b.applied-a.applied).slice(0,8);

    res.json({ success:true, data:{
      totalEvents, completedEvents, ongoingEvents, upcomingEvents,
      totalApplied, totalApproved, totalVolunteersNeeded, fillRate,
      totalAttendees, totalReach, categoryDistribution:categoryMap,
      cityDistribution:cityMap, appTimeline, rolePopularity,
    }});
  } catch(err) { res.status(500).json({ success:false, error:err.message }); }
});

// GET /api/analytics/events
router.get('/events', protect, authorize('organizer'), async (req, res) => {
  try {
    const events   = await Event.find({ organizerId: req.user.id }).sort({ 'schedule.start': -1 });
    const eventIds = events.map(e => e._id);
    const [analyticsArr, applications] = await Promise.all([
      EventAnalytics.find({ eventId: { $in: eventIds } }),
      Application.find({ eventId: { $in: eventIds } }),
    ]);

    const analyticsMap = {};
    analyticsArr.forEach(a => { analyticsMap[String(a.eventId)] = a; });
    const appsByEvent = {};
    applications.forEach(a => {
      const k = String(a.eventId);
      if (!appsByEvent[k]) appsByEvent[k] = [];
      appsByEvent[k].push(a);
    });

    const result = events.map(ev => {
      const id   = String(ev._id);
      const anal = analyticsMap[id] || {};
      const apps = appsByEvent[id] || [];
      const needed   = ev.volunteerRequirements?.totalVolunteers || 0;
      const approved = apps.filter(a=>a.status==='approved').length;
      const pending  = apps.filter(a=>a.status==='pending').length;
      const rejected = apps.filter(a=>a.status==='rejected').length;

      const roleMap = {};
      apps.forEach(a => {
        const k = a.roleName||a.roleId||'Unknown';
        if (!roleMap[k]) roleMap[k] = { applied:0, approved:0 };
        roleMap[k].applied++;
        if (a.status==='approved') roleMap[k].approved++;
      });
      const roleBreakdown = (ev.volunteerRoles||[]).map(r => {
        const d = roleMap[r.title] || { applied:0, approved:0 };
        return { roleId:r.roleId, roleName:r.title, needed:r.count, applied:d.applied, approved:d.approved };
      });

      return {
        _id:ev._id, title:ev.title, status:ev.status, category:ev.category,
        city:ev.location?.city, start:ev.schedule?.start, end:ev.schedule?.end, banner:ev.banner,
        needed, applied:apps.length, approved, pending, rejected,
        fillRate: needed>0 ? Math.round((approved/needed)*100) : 0,
        roleBreakdown,
        registeredAttendees:        anal.registeredAttendees||0,
        actualAttendees:            anal.actualAttendees||0,
        socialReach:                anal.socialReach||0,
        websiteClicks:              anal.websiteClicks||0,
        checkIns:                   anal.checkIns||0,
        incidentCount:              anal.incidentCount||0,
        volunteerSatisfactionScore: anal.volunteerSatisfactionScore||0,
        npsScore:                   anal.npsScore||0,
        applicationTimeline:        anal.applicationTimeline||[],
      };
    });

    res.json({ success:true, data:result });
  } catch(err) { res.status(500).json({ success:false, error:err.message }); }
});

module.exports = router;
