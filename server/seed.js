/**
 * EventHive – Seed Script
 * Inserts realistic fake events (ongoing / upcoming / past) into MongoDB.
 * Run with: node server/seed.js
 */

const mongoose = require('mongoose');
const dotenv   = require('dotenv');

dotenv.config({ path: __dirname + '/.env' });

const Event = require('./models/Event');
const User  = require('./models/User');

// ─── Helpers ────────────────────────────────────────────────────────────────
const now = new Date();

function daysAgo(n)    { return new Date(now - n * 864e5); }
function daysAhead(n)  { return new Date(+now + n * 864e5); }
function hoursAgo(n)   { return new Date(now - n * 36e5); }
function hoursAhead(n) { return new Date(+now + n * 36e5); }

// ─── Event Data ─────────────────────────────────────────────────────────────
const eventsData = [

  /* ============ ONGOING (start < now < end) ============ */
  {
    title: 'TechVerse Summit 2026',
    tagline: 'Where innovation meets community — the biggest tech gathering of the year.',
    description: `TechVerse Summit 2026 is a three-day immersive experience bringing together developers, designers, entrepreneurs, and tech enthusiasts from across the country. Featuring keynote sessions from industry leaders, hands-on workshops covering AI, cloud computing, and blockchain, and a 24-hour hackathon with prizes worth ₹5,00,000.\n\nWhether you're a seasoned professional or a curious student, there's something for everyone. Join us for inspiring talks, collaborative coding sessions, and networking opportunities.`,
    banner: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=900&auto=format&fit=crop',
    category: 'tech',
    tags: ['#TechTalk', '#Networking', '#AI', '#OpenSource', '#Hackathon'],
    type: 'hybrid',
    schedule: {
      start: hoursAgo(14),
      end:   hoursAhead(34),
      timezone: 'IST',
      applicationDeadline: daysAgo(5),
    },
    location: {
      venueName: 'Hyderabad International Convention Centre',
      city: 'Hyderabad',
      stateCountry: 'Telangana, India',
    },
    volunteerRequirements: {
      totalVolunteers: 25,
      minAge: 18,
      perks: 'Free meals, Certificate, T-shirt',
      preferredSkills: ['Communication', 'First Aid'],
      generalNote: 'All volunteers are expected to arrive 1 hour before the event starts. Wear the provided volunteer T-shirt at all times.',
    },
    volunteerRoles: [
      { roleId: 'r1', title: 'Stage Coordinator',    count: 6, notes: 'Manage speaker transitions, AV checks, and ensure sessions run on time. Must be available all 3 days.' },
      { roleId: 'r2', title: 'Registration Desk',    count: 4, notes: 'Handle attendee check-ins, distribute badges and swag kits. Early morning shifts required.' },
      { roleId: 'r3', title: 'Hackathon Mentor',     count: 5, notes: 'Guide hackathon teams, review submissions, and help with technical queries. Coding experience required.' },
      { roleId: 'r4', title: 'Photography & Media',  count: 3, notes: 'Capture event highlights for social media. Own camera gear preferred.' },
      { roleId: 'r5', title: 'Crowd Management',     count: 5, notes: "Direct foot traffic, manage queues, and assist with seating. Physical stamina required — you'll be on your feet!" },
      { roleId: 'r6', title: 'Social Media Live',    count: 2, notes: 'Post real-time updates, stories, and reels during the event. Must have social media savvy.' },
    ],
    media: {
      supportContact: 'events@techverse.com',
      socials: { twitter: 'https://twitter.com', instagram: 'https://instagram.com', linkedin: 'https://linkedin.com' },
    },
    status: 'ongoing',
  },

  {
    title: 'Design Sprint Bangalore',
    tagline: 'Three days of pure UI/UX excellence and hands-on creation.',
    description: 'An intensive 3-day design sprint where teams prototype, test, and iterate on real product challenges. Facilitated by senior designers from top tech companies. Includes workshops on Figma, usability testing, and design systems.',
    banner: 'https://images.unsplash.com/photo-1576595580361-90a855b84b20?w=900&auto=format&fit=crop',
    category: 'arts',
    tags: ['#Design', '#UX', '#Figma', '#Prototype'],
    type: 'physical',
    schedule: {
      start: hoursAgo(10),
      end:   hoursAhead(50),
      timezone: 'IST',
      applicationDeadline: daysAgo(3),
    },
    location: {
      venueName: 'NIMHANS Convention Centre',
      city: 'Bangalore',
      stateCountry: 'Karnataka, India',
    },
    volunteerRequirements: {
      totalVolunteers: 12,
      minAge: 18,
      perks: 'Certificate, Lunch, Figma Pro trial',
      preferredSkills: ['Design', 'Communication'],
      generalNote: 'Familiarity with design tools is a bonus but not mandatory.',
    },
    volunteerRoles: [
      { roleId: 'r1', title: 'Workshop Facilitator', count: 4, notes: 'Assist in running group design sprints and keep time.' },
      { roleId: 'r2', title: 'Setup & Logistics',    count: 4, notes: 'Arrange furniture, materials, and ensure a smooth setup.' },
      { roleId: 'r3', title: 'Documentation Team',   count: 4, notes: 'Capture session notes, photographs and compile daily summaries.' },
    ],
    media: { supportContact: 'design@sprintbangalore.in', socials: { instagram: 'https://instagram.com' } },
    status: 'ongoing',
  },

  {
    title: 'Music Fest Pune 2026',
    tagline: 'A 48-hour acoustic extravaganza under the stars.',
    description: 'Two days of live music featuring indie bands, classical performances, and electronic sets. Set up in the sprawling Shaniwar Wada grounds. Food stalls, art installations, and open-mic slots available.',
    banner: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=900&auto=format&fit=crop',
    category: 'music',
    tags: ['#MusicFest', '#Indie', '#LiveMusic', '#Pune'],
    type: 'physical',
    schedule: {
      start: hoursAgo(6),
      end:   hoursAhead(42),
      timezone: 'IST',
      applicationDeadline: daysAgo(7),
    },
    location: {
      venueName: 'Shaniwar Wada Grounds',
      city: 'Pune',
      stateCountry: 'Maharashtra, India',
    },
    volunteerRequirements: {
      totalVolunteers: 30,
      minAge: 18,
      perks: 'Free entry, Meals, T-shirt, Certificate',
      preferredSkills: ['Event Management', 'First Aid', 'Security'],
      generalNote: 'Must be comfortable working late-night shifts. High-energy environment.',
    },
    volunteerRoles: [
      { roleId: 'r1', title: 'Stage Security',  count: 10, notes: 'Maintain crowd barriers and ensure stage safety.' },
      { roleId: 'r2', title: 'Ticketing Desk',  count: 8, notes: 'Manage entry, ticket scanning, and guest coordination.' },
      { roleId: 'r3', title: 'Photography',     count: 6, notes: 'Capture moments. DSLR or mirrorless required.' },
      { roleId: 'r4', title: 'Hospitality',     count: 6, notes: 'Guest relations, artist green room assistance.' },
    ],
    media: { supportContact: 'hello@musicfestpune.in', socials: { instagram: 'https://instagram.com', twitter: 'https://twitter.com' } },
    status: 'ongoing',
  },

  /* ============ UPCOMING (start > now) ============ */
  {
    title: 'AI & Future of Work Summit',
    tagline: 'Exploring how artificial intelligence is reshaping careers and industries.',
    description: 'A full-day conference with panels from AI researchers, HR leaders, and entrepreneurs. Topics include generative AI, automation ethics, upskilling strategies, and job market forecasts for 2030.',
    banner: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=900&auto=format&fit=crop',
    category: 'tech',
    tags: ['#AI', '#FutureOfWork', '#Automation', '#Careers'],
    type: 'hybrid',
    schedule: {
      start: daysAhead(7),
      end:   daysAhead(8),
      timezone: 'IST',
      applicationDeadline: daysAhead(3),
    },
    location: {
      venueName: 'ITC Grand Chola',
      city: 'Chennai',
      stateCountry: 'Tamil Nadu, India',
      virtualLink: 'https://zoom.us/j/example',
    },
    volunteerRequirements: {
      totalVolunteers: 20,
      minAge: 18,
      perks: 'Certificate, Lunch, Networking pass',
      preferredSkills: ['Tech-savvy', 'Communication'],
      generalNote: 'Briefing session 2 days before the event. Attendance mandatory.',
    },
    volunteerRoles: [
      { roleId: 'r1', title: 'Technical Support',  count: 5, notes: 'Manage AV, streaming setups, and Zoom backstage.' },
      { roleId: 'r2', title: 'Registration & Info', count: 7, notes: 'Guest check-in, information desk.' },
      { roleId: 'r3', title: 'Session Host',        count: 4, notes: 'Introduce speakers and moderate Q&A.' },
      { roleId: 'r4', title: 'Social Media',        count: 4, notes: 'Live-tweet, post reels, and handle engagement.' },
    ],
    media: { supportContact: 'support@aifuturesummit.in', socials: { twitter: 'https://twitter.com', linkedin: 'https://linkedin.com' } },
    status: 'published',
  },

  {
    title: 'Startup Pitch Night Delhi',
    tagline: 'Showcase your idea to 500 investors in one night.',
    description: 'The biggest pitch night in North India. 20 startups compete for ₹25L in seed funding and mentorship deals. Open to early-stage founders across all sectors. Networking dinner included.',
    banner: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=900&auto=format&fit=crop',
    category: 'social',
    tags: ['#Startup', '#PitchNight', '#Funding', '#Entrepreneurship'],
    type: 'physical',
    schedule: {
      start: daysAhead(12),
      end:   daysAhead(12),
      timezone: 'IST',
      applicationDeadline: daysAhead(8),
    },
    location: {
      venueName: 'India Habitat Centre',
      city: 'New Delhi',
      stateCountry: 'Delhi, India',
    },
    volunteerRequirements: {
      totalVolunteers: 15,
      minAge: 20,
      perks: 'Dinner, Certificate, Startup Goodies',
      preferredSkills: ['Networking', 'Event Hosting'],
      generalNote: 'Smart casual dress code. Must be sharp and proactive.',
    },
    volunteerRoles: [
      { roleId: 'r1', title: 'Event Host',        count: 3, notes: 'MC the evening; introduce speakers and startups.' },
      { roleId: 'r2', title: 'Guest Coordinator', count: 6, notes: 'Greet and escort VIP investors and founders.' },
      { roleId: 'r3', title: 'AV & Stage Setup',  count: 3, notes: 'Slides, mic, and timer management.' },
      { roleId: 'r4', title: 'Registration',      count: 3, notes: 'Check-in and badge distribution.' },
    ],
    media: { supportContact: 'pitch@startupdelhi.in', socials: { linkedin: 'https://linkedin.com', facebook: 'https://facebook.com' } },
    status: 'published',
  },

  {
    title: 'Eco Volunteer Drive – Mumbai',
    tagline: 'Join 1000 volunteers for a cleaner Mumbai coastline.',
    description: 'A massive coastal cleanup drive across Versova and Juhu beaches. Gloves, bags, and refreshments provided. Event ends with an awareness talk on marine plastic pollution and community art installation.',
    banner: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=900&auto=format&fit=crop',
    category: 'social',
    tags: ['#Eco', '#ClimateAction', '#Mumbai', '#CleanIndia'],
    type: 'physical',
    schedule: {
      start: daysAhead(5),
      end:   daysAhead(5),
      timezone: 'IST',
      applicationDeadline: daysAhead(2),
    },
    location: {
      venueName: 'Versova Beach Entry Gate',
      city: 'Mumbai',
      stateCountry: 'Maharashtra, India',
    },
    volunteerRequirements: {
      totalVolunteers: 100,
      minAge: 16,
      perks: 'Refreshments, Certificate, Eco-tote bag',
      preferredSkills: ['Physical Stamina', 'Enthusiasm'],
      generalNote: 'Please wear comfortable clothes and carry a water bottle. Event starts at 7 AM sharp.',
    },
    volunteerRoles: [
      { roleId: 'r1', title: 'Zone Leader',      count: 20, notes: 'Lead a group of 10 volunteers in your assigned beach zone.' },
      { roleId: 'r2', title: 'Collection Team',  count: 60, notes: 'Collect and segregate waste in designated bags.' },
      { roleId: 'r3', title: 'Media & Docs',     count: 10, notes: 'Document with photos and short videos.' },
      { roleId: 'r4', title: 'Logistics',        count: 10, notes: 'Distribute materials and refreshments.' },
    ],
    media: { supportContact: 'eco@volunteermumbai.org', socials: { instagram: 'https://instagram.com' } },
    status: 'published',
  },

  {
    title: 'Blockchain Dev Conference',
    tagline: 'Decentralized. Open. Unstoppable.',
    description: 'Two days of deep-dive sessions on DeFi, NFTs, Layer 2 scaling, and smart contract auditing. Hosted by Web3 Foundation India. Includes a 12-hour buildathon with prizes worth ₹10L.',
    banner: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=900&auto=format&fit=crop',
    category: 'tech',
    tags: ['#Blockchain', '#Web3', '#DeFi', '#Buildathon'],
    type: 'hybrid',
    schedule: {
      start: daysAhead(18),
      end:   daysAhead(20),
      timezone: 'IST',
      applicationDeadline: daysAhead(12),
    },
    location: {
      venueName: 'WeWork Galaxy',
      city: 'Bangalore',
      stateCountry: 'Karnataka, India',
      virtualLink: 'https://zoom.us/j/web3conf',
    },
    volunteerRequirements: {
      totalVolunteers: 18,
      minAge: 18,
      perks: 'Certificate, Meals, Hackathon access, Swag box',
      preferredSkills: ['Blockchain knowledge', 'Tech-savvy'],
      generalNote: 'Knowledge of Solidity or Rust is a plus. Keep laptop charged.',
    },
    volunteerRoles: [
      { roleId: 'r1', title: 'Buildathon Mentor', count: 6, notes: 'Guide teams through technical challenges.' },
      { roleId: 'r2', title: 'Stage Host',         count: 4, notes: 'MC sessions and moderate Q&A panels.' },
      { roleId: 'r3', title: 'Registration',       count: 4, notes: 'Manage entry, swag distribution.' },
      { roleId: 'r4', title: 'Social Media',       count: 4, notes: 'Live updates on Twitter and LinkedIn.' },
    ],
    media: { supportContact: 'dev@blockchain-conf.in', socials: { twitter: 'https://twitter.com', linkedin: 'https://linkedin.com' } },
    status: 'published',
  },

  /* ============ PAST (end < now) ============ */
  {
    title: 'HackIndia 2026 Regionals',
    tagline: '24 hours. 200 hackers. One epic solution.',
    description: '24-hour hackathon focused on social impact solutions. Teams of 2-4 built apps addressing healthcare, education, and sustainability. Over 200 participants from 30 colleges. Total prize pool of ₹3L awarded across 6 categories.',
    banner: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=900&auto=format&fit=crop',
    category: 'tech',
    tags: ['#Hackathon', '#SocialImpact', '#Coding', '#Students'],
    type: 'physical',
    schedule: {
      start: daysAgo(10),
      end:   daysAgo(9),
      timezone: 'IST',
      applicationDeadline: daysAgo(14),
    },
    location: {
      venueName: 'IIIT Hyderabad Campus',
      city: 'Hyderabad',
      stateCountry: 'Telangana, India',
    },
    volunteerRequirements: { totalVolunteers: 20, minAge: 18, perks: 'Certificate, Meals, Exclusive hoodie' },
    volunteerRoles: [
      { roleId: 'r1', title: 'Mentor', count: 10, notes: 'Guided teams through technical and design challenges.' },
      { roleId: 'r2', title: 'Logistics', count: 5, notes: 'Managed supplies, midnight snacks, and venue setup.' },
      { roleId: 'r3', title: 'Judge Support', count: 5, notes: 'Assisted judges with scheduling and demo coordination.' },
    ],
    media: { supportContact: 'hack@hackindia.in', socials: { twitter: 'https://twitter.com' } },
    status: 'completed',
  },

  {
    title: 'Women in Tech Summit',
    tagline: 'Inspiring the next generation of women leaders in technology.',
    description: 'A landmark one-day summit with 20+ speakers sharing stories of resilience, leadership, and technical excellence. Panels on breaking into tech, salary negotiation, and building inclusive workplaces. 500 attendees from across India.',
    banner: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=900&auto=format&fit=crop',
    category: 'social',
    tags: ['#WomenInTech', '#Diversity', '#Leadership', '#Inclusion'],
    type: 'hybrid',
    schedule: {
      start: daysAgo(20),
      end:   daysAgo(20),
      timezone: 'IST',
      applicationDeadline: daysAgo(25),
    },
    location: {
      venueName: 'Taj Lands End',
      city: 'Mumbai',
      stateCountry: 'Maharashtra, India',
    },
    volunteerRequirements: { totalVolunteers: 15, minAge: 18, perks: 'Certificate, Networking pass, Gift hamper' },
    volunteerRoles: [
      { roleId: 'r1', title: 'Speaker Escort', count: 6, notes: 'Accompanied and assisted keynote speakers throughout the day.' },
      { roleId: 'r2', title: 'Registration', count: 5, notes: 'Managed check-in and delegate kits.' },
      { roleId: 'r3', title: 'Live Streaming', count: 4, notes: 'Managed camera setups and online broadcast.' },
    ],
    media: { supportContact: 'wit@womenintech.in' },
    status: 'completed',
  },

  {
    title: 'Cloud Native India 2026',
    tagline: 'Kubernetes, Containers, and the DevOps revolution.',
    description: 'Premier conference for DevOps and cloud practitioners. Topics: GitOps, service mesh, observability, FinOps, and platform engineering. Hands-on workshops with AWS, GCP, and Azure experts. 800+ attendees.',
    banner: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=900&auto=format&fit=crop',
    category: 'tech',
    tags: ['#CloudNative', '#Kubernetes', '#DevOps', '#AWS'],
    type: 'hybrid',
    schedule: {
      start: daysAgo(30),
      end:   daysAgo(28),
      timezone: 'IST',
      applicationDeadline: daysAgo(35),
    },
    location: {
      venueName: 'Le Méridien',
      city: 'Pune',
      stateCountry: 'Maharashtra, India',
      virtualLink: 'https://zoom.us/j/cloudnative',
    },
    volunteerRequirements: { totalVolunteers: 22, minAge: 18, perks: 'Certificate, Lunch, Conference pass, Swag bag' },
    volunteerRoles: [
      { roleId: 'r1', title: 'Workshop Helper',  count: 8, notes: 'Assisted participants with tool setups during labs.' },
      { roleId: 'r2', title: 'Registration',     count: 6, notes: 'Check-in and kit management.' },
      { roleId: 'r3', title: 'Stage Crew',       count: 5, notes: 'AV management and speaker coordination.' },
      { roleId: 'r4', title: 'Social Media',     count: 3, notes: 'Live tweeted and posted session highlights.' },
    ],
    media: { supportContact: 'info@cloudnativeindia.in', socials: { twitter: 'https://twitter.com', linkedin: 'https://linkedin.com' } },
    status: 'completed',
  },

  {
    title: 'Photography Walk Chennai',
    tagline: 'The city as your canvas — a guided urban photography experience.',
    description: 'A 3-hour morning walk through the streets of Mylapore and George Town, guided by award-winning street photographers. Participants learned composition, storytelling, and light reading. Ending with a mini gallery of best shots.',
    banner: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=900&auto=format&fit=crop',
    category: 'arts',
    tags: ['#Photography', '#StreetArt', '#Chennai', '#Creative'],
    type: 'physical',
    schedule: {
      start: daysAgo(15),
      end:   daysAgo(15),
      timezone: 'IST',
      applicationDeadline: daysAgo(18),
    },
    location: {
      venueName: 'Kapaleeshwarar Temple, Mylapore',
      city: 'Chennai',
      stateCountry: 'Tamil Nadu, India',
    },
    volunteerRequirements: { totalVolunteers: 6, minAge: 16, perks: 'Certificate, Breakfast, Print of best shot' },
    volunteerRoles: [
      { roleId: 'r1', title: 'Walk Guide',    count: 2, notes: 'Led the group through pre-planned routes.' },
      { roleId: 'r2', title: 'Photographer',  count: 2, notes: 'Documented the walk with DSLR.' },
      { roleId: 'r3', title: 'Coordinator',   count: 2, notes: 'Managed registrations and refreshments on-site.' },
    ],
    media: { supportContact: 'walk@photochennai.com', socials: { instagram: 'https://instagram.com' } },
    status: 'completed',
  },

  {
    title: 'Marathon for Mental Health',
    tagline: 'Run for awareness. Run for change.',
    description: 'A 5K and 10K charity run to raise awareness about mental health. 1200+ participants. Proceeds went to Vandrevala Foundation. Post-run yoga session and panel talk with psychologists and athletes.',
    banner: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=900&auto=format&fit=crop',
    category: 'sports',
    tags: ['#Marathon', '#MentalHealth', '#Charity', '#Run'],
    type: 'physical',
    schedule: {
      start: daysAgo(45),
      end:   daysAgo(45),
      timezone: 'IST',
      applicationDeadline: daysAgo(50),
    },
    location: {
      venueName: 'Lal Bahadur Shastri Stadium',
      city: 'Hyderabad',
      stateCountry: 'Telangana, India',
    },
    volunteerRequirements: { totalVolunteers: 40, minAge: 18, perks: 'Certificate, Finisher medal, T-shirt, Breakfast' },
    volunteerRoles: [
      { roleId: 'r1', title: 'Route Marshal',   count: 20, notes: 'Guided runners along the track and safety points.' },
      { roleId: 'r2', title: 'Water Station',   count: 10, notes: 'Managed hydration stations at 2K and 5K marks.' },
      { roleId: 'r3', title: 'Medical Support', count: 5,  notes: 'First aid assistance. EMT certification preferred.' },
      { roleId: 'r4', title: 'Photography',     count: 5,  notes: 'Captured the run for social media.' },
    ],
    media: { supportContact: 'run@marathonhyd.in', socials: { instagram: 'https://instagram.com', twitter: 'https://twitter.com' } },
    status: 'completed',
  },
];

// ─── Main ────────────────────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connected');

  // Find or create a system organizer for seeding
  let organizer = await User.findOne({ username: 'eventhive_system' });
  if (!organizer) {
    organizer = await User.create({
      email: 'system@eventhive.in',
      username: 'eventhive_system',
      password_hash: 'System@12345',
      role: 'organizer',
      profile: {
        orgName: 'EventHive Official',
        organization: 'EventHive Platform',
        leadName: 'System Admin',
      },
    });
    console.log('✅ System organizer created');
  }

  // Clear existing seeded events (keep user-created ones)
  const deleted = await Event.deleteMany({ organizerId: organizer._id });
  console.log(`🗑️  Removed ${deleted.deletedCount} old seeded events`);

  // Insert all events
  const inserted = await Event.insertMany(
    eventsData.map(ev => ({ ...ev, organizerId: organizer._id }))
  );
  console.log(`🎉 Inserted ${inserted.length} events`);

  await mongoose.disconnect();
  console.log('✅ Done – database seeded!');
}

seed().catch(err => { console.error(err); process.exit(1); });
