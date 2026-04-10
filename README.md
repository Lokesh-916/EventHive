<div align="center">

<img src="landing.png" alt="EventHive" width="100%" />

<br/><br/>

<img src="https://readme-typing-svg.demolab.com?font=Satisfy&size=56&pause=1200&color=026670&center=true&vCenter=true&width=700&lines=EventHive" alt="EventHive" />

<br/>

<p><strong><em>Where events come alive — and the people behind them get the credit they deserve.</em></strong></p>

<br/>

![Node.js](https://img.shields.io/badge/Node.js-026670?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-0a0f14?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-026670?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-0a0f14?style=for-the-badge&logo=tailwindcss&logoColor=38bdf8)
![JWT](https://img.shields.io/badge/JWT_Auth-026670?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

<br/><br/>

<p>A full-stack event operations platform built for three kinds of people —<br/>
<strong>organizers</strong> who run the show, <strong>volunteers</strong> who make it happen,<br/>
and <strong>clients</strong> who need it done right.</p>

</div>

---

## The Platform

<table>
<tr>
<td width="33%" valign="top">

**Volunteers**
- Browse live, upcoming, and past events
- Pick a role and enroll in one click
- Track application status in real time
- Earn XP, ranks, and badges
- Full profile — skills, availability, history

</td>
<td width="33%" valign="top">

**Organizers**
- Create events with roles, schedule, venue
- Manage client offers and negotiations
- Approve volunteers, view reputation at a glance
- Analytics — KPIs, charts, volunteer trends
- Expense tracking per accepted offer

</td>
<td width="33%" valign="top">

**Clients**
- Browse verified organizers with ratings
- Send offers with budget, date, and brief
- Track all bookings in one place
- Rate organizers after event completion

</td>
</tr>
</table>

---

## Built Different

> No React. No Next.js. No framework crutch.

Pure **Vanilla JS** on the frontend — every page is hand-crafted HTML with dynamic rendering driven by fetch calls and DOM manipulation. The UI is fast, the code is readable, and nothing is over-engineered.

The backend is **Express + MongoDB** with JWT auth, role-based access control on every route, and a clean REST API that the frontend talks to directly.

---

## Tech Stack

<table>
<tr>
<td><strong>Frontend</strong></td><td>HTML5, Vanilla JavaScript, Tailwind CSS</td>
</tr>
<tr>
<td><strong>Backend</strong></td><td>Node.js, Express.js</td>
</tr>
<tr>
<td><strong>Database</strong></td><td>MongoDB Atlas — Mongoose ODM</td>
</tr>
<tr>
<td><strong>Auth</strong></td><td>JWT + bcryptjs, role-based access control</td>
</tr>
<tr>
<td><strong>Fonts</strong></td><td>Google Fonts — Inter, Satisfy</td>
</tr>
</table>

---

## Pages at a Glance

<table>
<tr><th>Route</th><th>Who</th><th>What</th></tr>
<tr><td><code>/</code></td><td>Public</td><td>Landing page</td></tr>
<tr><td><code>/home</code></td><td>Volunteer</td><td>Event discovery feed — ongoing, upcoming, past</td></tr>
<tr><td><code>/event-info</code></td><td>Volunteer</td><td>Event detail, roles, and enrollment</td></tr>
<tr><td><code>/profile</code></td><td>All</td><td>View / edit profile, reputation, badges</td></tr>
<tr><td><code>/organiser-home</code></td><td>Organizer</td><td>Client offers, events, volunteer management</td></tr>
<tr><td><code>/organiser</code></td><td>Organizer</td><td>Dashboard — stats and events table</td></tr>
<tr><td><code>/analytics</code></td><td>Organizer</td><td>KPI cards, charts, per-event deep dive</td></tr>
<tr><td><code>/create-event</code></td><td>Organizer</td><td>Create and edit events</td></tr>
<tr><td><code>/client-home</code></td><td>Client</td><td>Browse organizers, send offers, track bookings</td></tr>
<tr><td><code>/report-incident</code></td><td>All</td><td>Report an issue during an event</td></tr>
<tr><td><code>/all-events</code></td><td>Public</td><td>Full public event listing</td></tr>
<tr><td><code>/event-overview</code></td><td>All</td><td>Bird's Eye View of any event</td></tr>
</table>

---

## Getting Started

**Prerequisites:** Node.js v14+, npm, MongoDB Atlas URI

```bash
# Clone
git clone https://github.com/Lokesh-916/EventHive.git
cd EventHive

# Install dependencies
cd server && npm install
cd ../client && npm install
```

Create `server/.env`:
```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/eventhive
JWT_SECRET=your_secret_key
PORT=5000
```

```bash
# Start the server
node server/server.js

# Watch Tailwind (separate terminal)
cd client && npm run dev
```

```bash
# Seed events, organizer, and analytics data
node server/seed.js
node server/seed-analytics.js
```

Open `http://localhost:5000`

---

<div align="center">
<sub>Built with focus. &copy; 2026 EventHive — All rights reserved.</sub>
</div>
