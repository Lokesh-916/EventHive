/**
 * EventHive – Analytics Seed
 * Run: node server/seed-analytics.js
 */

const dns = require('node:dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);
const mongoose = require('mongoose');
const dotenv   = require('dotenv');
dotenv.config({ path: __dirname + '/.env' });

const Event          = require('./models/Event');
const User           = require('./models/User');
const EventAnalytics = require('./models/EventAnalytics');

function daysAgo(n) { return new Date(Date.now() - n*864e5); }

const fakeData = {
  'HackIndia 2026 Regionals':   { registeredAttendees:240, actualAttendees:218, socialReach:42000,  websiteClicks:8700,  checkIns:218, incidentCount:1, volunteerSatisfactionScore:4.6, npsScore:78,  applicationTimeline:[{date:daysAgo(24),count:3},{date:daysAgo(17),count:7},{date:daysAgo(14),count:12},{date:daysAgo(11),count:5}] },
  'Women in Tech Summit':        { registeredAttendees:520, actualAttendees:487, socialReach:91000,  websiteClicks:15400, checkIns:487, incidentCount:0, volunteerSatisfactionScore:4.8, npsScore:85,  applicationTimeline:[{date:daysAgo(38),count:4},{date:daysAgo(31),count:9},{date:daysAgo(28),count:11},{date:daysAgo(25),count:6}] },
  'Cloud Native India 2026':     { registeredAttendees:860, actualAttendees:794, socialReach:130000, websiteClicks:22100, checkIns:794, incidentCount:2, volunteerSatisfactionScore:4.4, npsScore:72,  applicationTimeline:[{date:daysAgo(48),count:5},{date:daysAgo(41),count:10},{date:daysAgo(38),count:14},{date:daysAgo(35),count:8}] },
  'Photography Walk Chennai':    { registeredAttendees:45,  actualAttendees:41,  socialReach:8200,   websiteClicks:1900,  checkIns:41,  incidentCount:0, volunteerSatisfactionScore:4.9, npsScore:91,  applicationTimeline:[{date:daysAgo(22),count:2},{date:daysAgo(18),count:5},{date:daysAgo(16),count:3}] },
  'Marathon for Mental Health':  { registeredAttendees:1280,actualAttendees:1190,socialReach:210000, websiteClicks:38000, checkIns:1190,incidentCount:3, volunteerSatisfactionScore:4.5, npsScore:80,  applicationTimeline:[{date:daysAgo(62),count:6},{date:daysAgo(55),count:14},{date:daysAgo(52),count:18},{date:daysAgo(50),count:9}] },
  'TechVerse Summit 2026':       { registeredAttendees:310, actualAttendees:280, socialReach:58000,  websiteClicks:11200, checkIns:280, incidentCount:0, volunteerSatisfactionScore:4.3, npsScore:0,   applicationTimeline:[{date:daysAgo(14),count:5},{date:daysAgo(7),count:11},{date:daysAgo(5),count:8}] },
  'Design Sprint Bangalore':     { registeredAttendees:80,  actualAttendees:72,  socialReach:14000,  websiteClicks:3200,  checkIns:72,  incidentCount:0, volunteerSatisfactionScore:4.7, npsScore:0,   applicationTimeline:[{date:daysAgo(10),count:3},{date:daysAgo(5),count:7}] },
  'Music Fest Pune 2026':        { registeredAttendees:2100,actualAttendees:1950,socialReach:320000, websiteClicks:54000, checkIns:1950,incidentCount:1, volunteerSatisfactionScore:4.2, npsScore:0,   applicationTimeline:[{date:daysAgo(18),count:8},{date:daysAgo(11),count:16},{date:daysAgo(7),count:10}] },
};

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected');
  const organizer = await User.findOne({ username: 'eventhive_system' });
  if (!organizer) { console.error('Run seed.js first'); process.exit(1); }
  const events = await Event.find({ organizerId: organizer._id });
  let done = 0;
  for (const ev of events) {
    const d = fakeData[ev.title];
    if (!d) continue;
    await EventAnalytics.findOneAndUpdate(
      { eventId: ev._id },
      { ...d, eventId: ev._id, organizerId: organizer._id },
      { upsert: true, new: true }
    );
    console.log(' ✓', ev.title);
    done++;
  }
  console.log(`Done — ${done} records upserted`);
  await mongoose.disconnect();
}
seed().catch(e => { console.error(e); process.exit(1); });
