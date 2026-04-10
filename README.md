<div align="center">

<img src="landing.png" alt="EventHive Landing" width="100%" style="border-radius:12px;" />

<br/><br/>

<h1>
  <img src="https://readme-typing-svg.demolab.com?font=Satisfy&size=52&pause=1000&color=026670&center=true&vCenter=true&width=600&lines=EventHive" alt="EventHive" />
</h1>

<p><strong><em>Where events come alive — and the people behind them get the credit they deserve.</em></strong></p>

<br/>

![Node.js](https://img.shields.io/badge/Node.js-026670?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-0a0f14?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-026670?style=for-the-badge&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-0a0f14?style=for-the-badge&logo=tailwindcss&logoColor=38bdf8)
![JWT](https://img.shields.io/badge/JWT_Auth-026670?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

</div>

---

<div align="center">
<h2>What is EventHive?</h2>
<p>
A full-stack event operations platform built for three kinds of people —<br/>
<strong>organizers</strong> who run the show, <strong>volunteers</strong> who make it happen,<br/>
and <strong>clients</strong> who need it done right.
</p>
</div>

---

## The Platform, in Plain English

**For Volunteers**
- Browse live, upcoming, and past events — all in one feed
- Pick a role, write a cover letter, and enroll in one click
- Track your application status in real time
- Build a profile with skills, availability, and your event history
- Earn reputation and badges as you complete events

**For Organizers**
- Create events with full scheduling, venue, and role configuration
- Manage incoming client offers and negotiate terms
- Approve volunteers, view their profiles and reputation at a glance
- Deep analytics — KPI cards, event mix charts, volunteer trends
- Track expenses per accepted offer

**For Clients**
- Browse verified organizers with composite ratings
- Send offers with budget, date, city, and brief
- Rate organizers after event completion

---

## Built Different

> No React. No Next.js. No framework crutch.

Pure **Vanilla JS** on the frontend — every page is hand-crafted HTML with dynamic rendering driven by fetch calls and DOM manipulation. The UI is fast, the code is readable, and nothing is over-engineered.

The backend is **Express + MongoDB** with JWT auth, role-based access control on every route, and a clean REST API that the frontend talks to directly.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, Vanilla JavaScript, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | JWT + bcryptjs |
| Fonts | Google Fonts — Inter, Satisfy |

---

## Getting Started

**Prerequisites:** Node.js v14+, npm, MongoDB Atlas URI

```bash
# Clone
git clone https://github.com/Lokesh-916/EventHive.git
cd EventHive

# Install server deps
cd server && npm install

# Install client deps (Tailwind)
cd ../client && npm install
```

Create `server/.env`:
```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/eventhive
JWT_SECRET=your_secret_key
PORT=5000
```

```bash
# Run the server
node server/server.js

# In a separate terminal — watch Tailwind
cd client && npm run dev
```

Open `http://localhost:5000`

```bash
# Seed sample events and organizer data
node server/seed.js
node server/seed-analytics.js
```

---

## Pages at a Glance

| Route | Who | What |
|---|---|---|
| `/` | Public | Landing page |
| `/home` | Volunteer | Event discovery feed |
| `/event-info` | Volunteer | Event detail + enroll |
| `/profile` | All | View / edit profile |
| `/organiser-home` | Organizer | Offers, events, volunteers |
| `/organiser` | Organizer | Dashboard + stats |
| `/analytics` | Organizer | Charts, KPIs, deep dive |
| `/create-event` | Organizer | Create / edit event |
| `/client-home` | Client | Browse organizers, bookings |
| `/report-incident` | All | Report an issue at an event |
| `/all-events` | Public | Full event listing |

---

<div align="center">
<sub>Built with focus. © 2026 EventHive — All rights reserved.</sub>
</div>
