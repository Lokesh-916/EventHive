# EventHive

Operations-First Event Platform connecting event organizers, volunteers, and clients. Comprehensive tools for managing events, registering volunteers, tracking applications, and orchestrating flawless experiences.

## Project Structure

```
EventHive/
├── client/                  # Frontend (HTML, Tailwind CSS, Vanilla JS)
│   ├── src/js/              # JavaScript modules per page
│   ├── src/styles/          # Tailwind input/output CSS
│   └── public/              # Static assets (images, videos)
├── server/                  # Express.js backend
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API route handlers
│   ├── middleware/          # Auth, upload middleware
│   ├── services/            # Reputation, badge logic
│   ├── seed.js              # Seed events & organizer
│   └── seed-analytics.js    # Seed analytics data
└── README.md
```

## Features

### Volunteer
- Browse ongoing, upcoming, and past events
- Enroll for specific roles in events (duplicate prevention)
- View application status (pending / approved / rejected)
- Reputation & badge system — earn XP and ranks by completing events
- Full profile page with edit support, skills, availability, and badges

### Organizer
- Create and manage events with full scheduling, location, and volunteer role setup
- Organizer Home — client offers, created events, volunteer management
- Organizer Dashboard — event stats, manage events table, analytics link
- Volunteer Management — approve applications, view volunteer profiles
- Analytics page — KPI cards, per-event deep dive, volunteer trends, event mix charts
- Expense tracking per accepted offer
- Rate and complete volunteer applications (awards XP)

### Client
- Browse and filter verified organizers
- Send offers with budget, date, city, and description
- Track bookings and rate organizers after event completion

### General
- JWT-based authentication with role-specific auth guards
- Theme toggle (dark/light) consistent across all pages
- Access restricted page with back navigation for wrong-role access
- Report incident from event info page
- Bird's Eye View (event overview) for each event

## Pages & Routes

| Route | Description | Access |
|---|---|---|
| `/` | Landing page | Public |
| `/register` | Registration (`?type=volunteer\|organizer\|client`) | Public |
| `/home` | Volunteer event browser | Volunteer |
| `/event-info` | Event details + enroll | Volunteer |
| `/event-overview` | Bird's Eye View of event | All |
| `/profile` | User profile (view/edit, supports `?id=` for read-only) | Authenticated |
| `/organiser-home` | Organizer home — offers, events, volunteers | Organizer |
| `/organiser` | Organizer dashboard — stats, events table | Organizer |
| `/analytics` | Analytics — KPIs, charts, event deep dive | Organizer |
| `/create-event` | Create/edit event | Organizer |
| `/client-home` | Client home — browse organizers, bookings | Client |
| `/organiser-profile` | Public organizer profile | All |
| `/rate-organizer` | Rate an organizer after event | Client |
| `/report-incident` | Report an incident | Authenticated |
| `/all-events` | All events listing | Public |
| `/support` | Support & FAQ | Public |

## API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/profile` | Get own profile |
| PUT | `/api/auth/profile` | Update profile |
| GET | `/api/auth/profile/:id` | Get any user profile (read-only) |
| GET | `/api/events` | All events |
| GET | `/api/events/my` | Organizer's events |
| POST | `/api/events` | Create event |
| GET | `/api/events/:id` | Single event |
| POST | `/api/applications` | Apply for event role |
| GET | `/api/applications/my-applications` | Volunteer's applications |
| GET | `/api/applications/event/:eventId` | Applications for an event |
| POST | `/api/applications/:id/approve` | Approve application |
| POST | `/api/applications/:id/complete` | Complete + award XP |
| GET | `/api/reputation/:volunteerId` | Volunteer reputation |
| GET | `/api/reputation/catalog` | Badge catalog |
| GET | `/api/analytics/overview` | Portfolio KPIs |
| GET | `/api/analytics/events` | Per-event analytics |
| GET | `/api/offers` | Offers (organizer/client) |
| POST | `/api/offers` | Send offer |
| GET | `/api/organizers` | All organizers |

## Technology Stack

- **Frontend**: HTML5, Vanilla JavaScript, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas (Mongoose)
- **Auth**: JWT (jsonwebtoken, bcryptjs)
- **Fonts**: Google Fonts (Inter, Satisfy)

## Getting Started

### Prerequisites
- Node.js v14+
- npm
- MongoDB Atlas cluster URI

### Environment Setup

Create `server/.env`:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/eventhive?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

### Installation

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies (Tailwind)
cd ../client && npm install
```

### Running

```bash
# Terminal 1 — Start server (from root)
node server/server.js

# Terminal 2 — Watch Tailwind (from client/)
cd client && npm run dev
```

Open `http://localhost:5000`

### Seeding Data

```bash
# Seed events and system organizer
node server/seed.js

# Seed analytics data (run after seed.js)
node server/seed-analytics.js
```

## License

All rights reserved © 2026 EventHive
