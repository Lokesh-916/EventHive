# Requirements Document

## Introduction

The Volunteer Reputation & Badges system adds a persistent, cross-event reputation layer to EventHive. Volunteers earn XP and unlock themed badges by completing events, receiving organizer ratings, and hitting activity milestones. Reputation data is stored on the volunteer's profile and surfaced to organizers during volunteer selection, creating a community and ecosystem feel. The system is designed to stay within MongoDB Atlas free-tier constraints — no unbounded arrays, no heavy aggregation pipelines.

---

## Glossary

- **Reputation_System**: The backend service responsible for computing XP, assigning ranks, and awarding badges.
- **Volunteer**: A registered user with role `volunteer`.
- **Organizer**: A registered user with role `organizer`.
- **XP**: Experience Points — a numeric score accumulated by a Volunteer over time.
- **Rank**: A named tier derived from a Volunteer's total XP (e.g., Newcomer, Rising Star, Veteran).
- **Badge**: A named achievement with a themed SVG icon awarded when a Volunteer meets a defined criterion.
- **Badge_Catalog**: The static, server-side definition of all available badges, their criteria, and their SVG symbols.
- **Reputation_Profile**: The embedded sub-document on the User model that stores a Volunteer's XP, rank, and earned badges.
- **Event_Completion**: The state reached when an organizer marks a Volunteer's participation in an event as completed and optionally provides a rating.
- **Rating**: A 1–5 integer score given by an Organizer to a Volunteer after an Event_Completion.
- **Progress_Panel**: The frontend UI component that shows a Volunteer all available badges and their progress toward each.

---

## Requirements

### Requirement 1: Reputation Profile Storage

**User Story:** As a volunteer, I want my reputation data stored on my profile, so that my XP, rank, and badges persist across all events.

#### Acceptance Criteria

1. THE Reputation_System SHALL extend the User model with a `reputation` sub-document containing: `xp` (Number, default 0), `rank` (String, default "Newcomer"), `badges` (Array of earned badge objects), and `eventsCompleted` (Number, default 0).
2. THE Reputation_System SHALL store each earned badge object with: `badgeId` (String), `awardedAt` (Date), and `eventId` (ObjectId reference, nullable) indicating the event that triggered the award.
3. THE Reputation_System SHALL cap the `badges` array to a maximum of 50 entries to respect MongoDB free-tier document size limits.
4. WHEN a new Volunteer registers, THE Reputation_System SHALL initialise the `reputation` sub-document with default values without requiring a separate API call.

---

### Requirement 2: XP Awarding Rules

**User Story:** As a volunteer, I want to earn XP for completing events and receiving good ratings, so that my effort is recognised and reflected in my rank.

#### Acceptance Criteria

1. WHEN an Organizer marks a Volunteer's participation as completed, THE Reputation_System SHALL award the Volunteer 50 XP.
2. WHEN an Organizer submits a Rating of 4 for a completed participation, THE Reputation_System SHALL award the Volunteer an additional 10 XP bonus.
3. WHEN an Organizer submits a Rating of 5 for a completed participation, THE Reputation_System SHALL award the Volunteer an additional 25 XP bonus.
4. THE Reputation_System SHALL increment `eventsCompleted` by 1 each time a participation is marked completed.
5. IF a participation is marked completed more than once for the same Volunteer and Event, THEN THE Reputation_System SHALL award XP only once per unique participation record.

---

### Requirement 3: Rank Tiers

**User Story:** As a volunteer, I want to see a motivating rank title that reflects my experience level, so that I feel a sense of progression.

#### Acceptance Criteria

1. THE Reputation_System SHALL define exactly six rank tiers with the following XP thresholds:
   - **Newcomer**: 0–99 XP
   - **Rising Star**: 100–299 XP
   - **Reliable**: 300–599 XP
   - **Veteran**: 600–999 XP
   - **Elite**: 1000–1999 XP
   - **Legend**: 2000+ XP
2. WHEN a Volunteer's XP is updated, THE Reputation_System SHALL recalculate and update the `rank` field to match the current XP tier.
3. THE Reputation_System SHALL never downgrade a Volunteer's rank when XP increases.

---

### Requirement 4: Badge Catalog and Award Logic

**User Story:** As a volunteer, I want to earn themed badges for specific achievements, so that my profile reflects my unique contributions.

#### Acceptance Criteria

1. THE Badge_Catalog SHALL define the following badges with their award criteria:

   | Badge ID | Name | Criterion |
   |---|---|---|
   | `first_step` | First Step | Complete 1 event |
   | `team_player` | Team Player | Complete 5 events |
   | `dedicated` | Dedicated | Complete 10 events |
   | `centurion` | Centurion | Reach 100 XP |
   | `rising_star` | Rising Star | Reach 300 XP |
   | `veteran` | Veteran | Reach 600 XP |
   | `top_rated` | Top Rated | Receive three 5-star ratings |
   | `consistent` | Consistent | Complete events in 3 different calendar months |
   | `legend` | Legend | Reach 2000 XP |

2. WHEN a Volunteer's reputation data is updated, THE Reputation_System SHALL evaluate all Badge_Catalog criteria and award any newly qualifying badges.
3. IF a Volunteer already holds a badge, THEN THE Reputation_System SHALL NOT award the same badge again.
4. THE Reputation_System SHALL award badges atomically in the same database operation that updates XP and rank.

---

### Requirement 5: Event Completion and Rating API

**User Story:** As an organizer, I want to mark a volunteer's participation as complete and optionally rate them, so that their reputation is updated after the event.

#### Acceptance Criteria

1. WHEN an Organizer sends a POST request to `/api/applications/:id/complete` with an optional `rating` (integer 1–5), THE Reputation_System SHALL mark the application status as `completed`, store the rating, and trigger XP and badge recalculation for the Volunteer.
2. IF the `rating` value is outside the range 1–5, THEN THE Reputation_System SHALL return HTTP 400 with a descriptive error message.
3. IF the application does not belong to an event owned by the requesting Organizer, THEN THE Reputation_System SHALL return HTTP 403.
4. THE Application model SHALL be extended with a `rating` (Number, min 1, max 5) field and a `completedAt` (Date) field.
5. WHEN the completion endpoint is called, THE Reputation_System SHALL respond with the updated Volunteer reputation data in the response body.

---

### Requirement 6: Volunteer Reputation Profile API

**User Story:** As a volunteer or organizer, I want to fetch a volunteer's full reputation profile via API, so that it can be displayed on dashboards and during volunteer selection.

#### Acceptance Criteria

1. WHEN an authenticated user sends a GET request to `/api/reputation/:volunteerId`, THE Reputation_System SHALL return the Volunteer's `xp`, `rank`, `eventsCompleted`, and `badges` array.
2. IF the requested user is not a Volunteer, THEN THE Reputation_System SHALL return HTTP 404 with the message "Volunteer not found".
3. WHEN an Organizer fetches a Volunteer's reputation profile, THE Reputation_System SHALL include the Volunteer's `fullName`, `profilePic`, and `skills` alongside the reputation data.
4. THE Reputation_System SHALL return the Badge_Catalog (all badges with name, description, criterion threshold, and SVG symbol key) at GET `/api/reputation/catalog` without requiring authentication.

---

### Requirement 7: Volunteer Reputation Display (Volunteer Dashboard)

**User Story:** As a volunteer, I want to see my XP, rank, and earned badges on my dashboard, so that I can track my progress at a glance.

#### Acceptance Criteria

1. WHEN the volunteer dashboard loads, THE Volunteer_Dashboard SHALL fetch and display the current user's `xp`, `rank`, and earned badges from the reputation API.
2. THE Volunteer_Dashboard SHALL render each earned badge using its themed SVG symbol and badge name — not emoji.
3. THE Volunteer_Dashboard SHALL display a rank label styled to feel motivating (e.g., distinct colour per rank tier, not generic grey).
4. THE Volunteer_Dashboard SHALL display an XP progress bar showing progress toward the next rank tier.
5. WHEN a Volunteer clicks the info (i) icon adjacent to the badges section, THE Volunteer_Dashboard SHALL open a Progress_Panel overlay listing all badges in the Badge_Catalog, each with its SVG icon, name, description, and the Volunteer's current progress toward earning it.
6. THE Volunteer_Dashboard SHALL visually distinguish earned badges from unearned badges (e.g., earned badges are full colour; unearned badges are greyed out).

---

### Requirement 8: Organizer Volunteer Selection View

**User Story:** As an organizer, I want to see a volunteer's reputation and badges when reviewing applications, so that I can make informed selection decisions.

#### Acceptance Criteria

1. WHEN an Organizer views the applicant list for an event, THE Organizer_Dashboard SHALL display each applicant's rank label and top 3 earned badges alongside their name and skills.
2. THE Organizer_Dashboard SHALL render badge icons using SVG symbols, not emoji.
3. WHEN an Organizer clicks on a Volunteer's reputation summary, THE Organizer_Dashboard SHALL open a detail panel showing full XP, rank, all earned badges, and events completed count.
4. THE Organizer_Dashboard SHALL visually indicate the rank tier using a consistent colour scheme matching the Volunteer_Dashboard.

---

### Requirement 9: Badge SVG Symbol Definitions

**User Story:** As a user, I want badges to have distinct, themed SVG icons, so that the system feels polished and not generic.

#### Acceptance Criteria

1. THE Badge_Catalog SHALL associate each badge with a unique SVG path or symbol key stored server-side.
2. THE Volunteer_Dashboard SHALL inline or reference SVG symbols from a shared sprite sheet — not external image URLs — to avoid extra HTTP requests.
3. WHEN rendered at 32×32px, each badge SVG SHALL be visually distinct and recognisable without a label.
4. WHERE a Volunteer has not yet earned a badge, THE Volunteer_Dashboard SHALL render the badge SVG at reduced opacity (0.3) with a greyscale filter.
