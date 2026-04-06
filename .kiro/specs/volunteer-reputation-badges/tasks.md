# Implementation Plan: Volunteer Reputation & Badges

## Overview

Implement the reputation system incrementally: data layer first, then backend logic and API, then frontend surfaces. Each step is wired in before moving on.

## Tasks

- [x] 1. Extend data models
  - [x] 1.1 Add `reputation` sub-document to `server/models/User.js`
    - Add `xp` (Number, default 0), `rank` (String, default "Newcomer"), `badges` (Array, max 50), `eventsCompleted` (Number, default 0) inside a `reputation` field
    - Each badge entry: `{ badgeId: String, awardedAt: Date, eventId: ObjectId ref nullable }`
    - Initialise defaults so existing volunteers get the sub-document on next save (use `default` on the schema, not a migration)
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 1.2 Add `rating` and `completedAt` fields to `server/models/Application.js`
    - `rating`: Number, min 1, max 5, optional
    - `completedAt`: Date, optional
    - Extend the `status` enum to include `'completed'`
    - _Requirements: 5.4_

- [x] 2. Implement pure reputation logic in `server/services/reputation.js`
  - [x] 2.1 Implement `computeXpGain(rating)` returns base 50 XP + bonus (10 for rating 4, 25 for rating 5)
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ]* 2.2 Write property test for `computeXpGain`
    - **Property 1: XP gain is always >= 50 for any valid rating (1-5)**
    - **Validates: Requirements 2.1, 2.2, 2.3**

  - [x] 2.3 Implement `computeRank(xp)` returns the correct rank string for a given XP value using the six-tier table
    - Newcomer 0-99, Rising Star 100-299, Reliable 300-599, Veteran 600-999, Elite 1000-1999, Legend 2000+
    - _Requirements: 3.1, 3.2_

  - [ ]* 2.4 Write property test for `computeRank`
    - **Property 2: rank never downgrades as XP increases monotonically**
    - **Validates: Requirements 3.3**

  - [x] 2.5 Implement `evaluateBadges(reputationDoc, catalogBadges, context)` returns array of newly qualifying badge IDs not already held
    - `context` carries `{ eventsCompleted, xp, fiveStarCount, completedMonths }`
    - Skips badges already in `reputationDoc.badges`
    - _Requirements: 4.2, 4.3_

  - [ ]* 2.6 Write property test for `evaluateBadges`
    - **Property 3: a badge already in the earned list is never returned again**
    - **Validates: Requirements 4.3**

  - [x] 2.7 Implement `applyReputation(userId, rating, eventId)` orchestrates XP gain, rank update, badge evaluation, and atomic update on the User document
    - Guard against double-completion using the application's `completedAt` field
    - Cap badges array at 50 entries
    - _Requirements: 2.4, 2.5, 4.4, 1.3_

- [x] 3. Build the badge catalog in `server/services/badgeCatalog.js`
  - [x] 3.1 Export a `BADGES` array with all 9 badge definitions
    - Each entry: `{ id, name, description, criterionLabel, svgPath }` where `svgPath` is an inline SVG path string for a 32x32 viewBox
    - Badges: `first_step`, `team_player`, `dedicated`, `centurion`, `rising_star`, `veteran`, `top_rated`, `consistent`, `legend`
    - _Requirements: 4.1, 9.1_

  - [x] 3.2 Export a `getBadgeById(id)` helper
    - _Requirements: 4.1_

- [x] 4. Implement the reputation API routes in `server/routes/reputation.js`
  - [x] 4.1 Implement `GET /api/reputation/catalog` (no auth required)
    - Returns the full `BADGES` array with id, name, description, criterionLabel, svgPath
    - _Requirements: 6.4_

  - [x] 4.2 Implement `GET /api/reputation/:volunteerId` (auth required, any role)
    - Returns `xp`, `rank`, `eventsCompleted`, `badges` for the volunteer
    - If the requesting user is an organizer, also include `fullName`, `profilePic`, `skills` from `profile`
    - Return 404 with "Volunteer not found" if the user does not exist or is not a volunteer
    - _Requirements: 6.1, 6.2, 6.3_

- [x] 5. Add the completion endpoint to `server/routes/applications.js`
  - [x] 5.1 Implement `POST /api/applications/:id/complete` (auth: organizer only)
    - Validate `rating` is 1-5 if provided; return 400 otherwise
    - Verify the application's event belongs to the requesting organizer; return 403 if not
    - Set `status = 'completed'`, store `rating`, set `completedAt = Date.now()`
    - Call `applyReputation(volunteerId, rating, eventId)` from `server/services/reputation.js`
    - Respond with the updated volunteer reputation data
    - _Requirements: 5.1, 5.2, 5.3, 5.5_

- [x] 6. Register the reputation router in `server/server.js`
  - Require `./routes/reputation` and mount at `/api/reputation`
  - Add a `/profile` GET route handler to serve `client/profile.html`
  - _Requirements: 6.1, 6.4_

- [ ] 7. Checkpoint - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Build `client/profile.html` public volunteer profile page
  - [x] 8.1 Create the HTML shell at `client/profile.html`
    - Reads `?id=<volunteerId>` from the query string on load
    - Matches the existing dark glassmorphism aesthetic (bg-[#0A0F14], backdrop-blur, border border-white/10, Inter + Satisfy fonts, output.css)
    - Sections: profile header (avatar, name, rank label), XP progress bar toward next tier, earned badges grid, info (i) button to open Progress Panel
    - Include an inline SVG `<defs>` sprite block that JS will populate with badge symbols
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 8.2 Style the rank label with per-tier colour classes
    - Newcomer: slate, Rising Star: sky, Reliable: teal, Veteran: violet, Elite: amber, Legend: rose/gold gradient
    - _Requirements: 7.3, 8.4_

  - [x] 8.3 Style earned vs unearned badges
    - Earned: full colour SVG at full opacity
    - Unearned: Tailwind `opacity-30 grayscale` filter
    - _Requirements: 7.6, 9.4_

- [x] 9. Build `client/src/js/reputation.js` fetch and render reputation data
  - [x] 9.1 Implement `loadProfile(volunteerId)` fetches `/api/reputation/:id` and `/api/reputation/catalog`, then renders the profile page
    - Inject SVG symbols into the `<defs>` sprite block
    - Render rank label, XP bar (current XP / next tier threshold), earned badge grid
    - _Requirements: 7.1, 7.2, 7.4_

  - [x] 9.2 Implement `renderBadgeGrid(badges, catalog)` renders all catalog badges, marking earned ones full colour and unearned ones greyed out
    - Use `<svg><use href="#badge-{id}">` referencing the inline sprite
    - _Requirements: 7.2, 7.6, 9.2, 9.3_

  - [x] 9.3 Implement the Progress Panel overlay
    - Triggered by clicking the info (i) button
    - Lists all catalog badges with SVG icon, name, description, and progress text (e.g. "3 / 5 events")
    - Closes on backdrop click or close button
    - _Requirements: 7.5_

  - [x] 9.4 Wire `reputation.js` into `profile.html` via a `<script src="src/js/reputation.js">` tag and call `loadProfile` on DOMContentLoaded
    - _Requirements: 7.1_

- [x] 10. Update `client/organiser.html` show rank + top 3 badges per applicant
  - [x] 10.1 Add a "Reputation" column to the applicant table in the Volunteer Management section
    - After loading applications from `/api/applications/event/:eventId`, fetch reputation for each applicant via `/api/reputation/:volunteerId`
    - Display rank label (colour-coded per tier) and up to 3 earned badge SVG icons inline
    - _Requirements: 8.1, 8.2, 8.4_

  - [x] 10.2 Add a reputation detail panel (modal/drawer) triggered by clicking the reputation summary cell
    - Shows full XP, rank, all earned badges, and events completed count
    - Reuses the same SVG sprite approach as profile.html
    - _Requirements: 8.3_

- [x] 11. Final checkpoint - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- `home.html` is intentionally excluded - badge section will be integrated after the volunteer dashboard branch merges
- All SVG badge icons are inlined in `badgeCatalog.js` and injected into a `<defs>` sprite block client-side to avoid extra HTTP requests (req 9.2)
- The `applyReputation` function must be idempotent per application record - check `completedAt` before awarding XP (req 2.5)
