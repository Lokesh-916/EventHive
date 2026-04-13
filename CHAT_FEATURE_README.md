# Event Chat Feature

## Overview
The Event Chat feature provides exclusive communication between event organizers and enrolled volunteers for each specific event. This creates a dedicated team communication channel for event coordination.

## Features

### 🎯 **Exclusive Access**
- Only the event organizer and approved volunteers can access the chat
- Chat is scoped to individual events (not global)
- Automatic access control based on user roles and enrollment status

### 💬 **Chat Interface**
- **Minimized Mode**: Small chat window (380x520px) in bottom-right corner
- **Fullscreen Mode**: Expandable to full screen with participant sidebar
- **Floating Action Button**: Shows when chat is closed, displays unread count badge
- **Real-time Updates**: Messages poll every 3 seconds for new content

### 👥 **Participant Management**
- **Sidebar (Fullscreen only)**: Shows participants grouped by volunteer roles
- **Organizer Section**: Highlighted organizer with special styling
- **Role Groups**: Volunteers organized by their assigned roles (e.g., "Security", "Registration")
- **Profile Integration**: Shows user avatars, names, and roles

### 🔔 **Notifications**
- Unread message count badge on floating action button
- Automatic message read status tracking
- Periodic polling for unread count updates (every 15 seconds)

## Technical Implementation

### Backend (Node.js/Express)

#### Database Schema Updates
```javascript
// Message Model (server/models/Message.js)
{
  senderId: ObjectId,     // User who sent the message
  receiverId: ObjectId,   // User who receives the message
  eventId: ObjectId,      // Event this message belongs to (null for direct messages)
  text: String,           // Message content (max 2000 chars)
  read: Boolean,          // Read status
  messageType: String,    // 'direct' or 'event'
  createdAt: Date,
  updatedAt: Date
}
```

#### API Endpoints
```javascript
// Event Chat Routes (server/routes/chat.js)
GET    /api/chat/event/:eventId/messages        // Get event messages
POST   /api/chat/event/:eventId/messages        // Send event message
GET    /api/chat/event/:eventId/participants    // Get chat participants
GET    /api/chat/event/:eventId/unread-count    // Get unread count
```

#### Access Control
- Validates user is either:
  - Event organizer (organizerId matches current user)
  - Approved volunteer (has approved application for the event)
- Returns 403 Forbidden for unauthorized access attempts

#### Message Broadcasting
- When a message is sent, it creates individual message records for each participant
- Excludes sender from receiving their own message
- Supports both organizer-to-volunteers and volunteer-to-team communication

### Frontend (Vanilla JavaScript)

#### Chat Window States
1. **Hidden**: Chat window not visible, FAB shows with unread badge
2. **Minimized**: Header only visible, body collapsed
3. **Normal**: Standard chat window (380x520px)
4. **Fullscreen**: Full viewport with participant sidebar

#### Key Components
- **Event Chat Button**: Integrated into event overview action buttons
- **Floating Action Button**: Bottom-right corner with unread badge
- **Chat Window**: Resizable with header controls (minimize, fullscreen, close)
- **Participant Sidebar**: Role-grouped participant list (fullscreen only)
- **Message Area**: Scrollable message history with sender identification
- **Input Area**: Text input with send button and Enter key support

#### Responsive Design
- Mobile: Chat window takes full viewport
- Desktop: Resizable window with sidebar in fullscreen mode
- Dark theme integration with CSS custom properties

## User Experience

### For Organizers
1. Click "Event Chat" button in event overview
2. See all enrolled volunteers grouped by roles in sidebar (fullscreen)
3. Send messages to entire team
4. Monitor team communication and coordination

### For Volunteers
1. Access chat only after being approved for the event
2. Communicate with organizer and other team members
3. See other volunteers in their role groups
4. Receive event-specific updates and coordination messages

### Chat Flow
1. **Access**: Click "Event Chat" button or floating action button
2. **Participants**: View team members in sidebar (fullscreen mode)
3. **Messaging**: Type and send messages to the team
4. **Real-time**: Messages appear automatically via polling
5. **Notifications**: Unread count badge shows new messages when chat is closed

## Security Features

- **Authentication**: JWT token required for all chat operations
- **Authorization**: Role-based access (organizer + approved volunteers only)
- **Event Scoping**: Messages isolated per event
- **Input Validation**: Message length limits (2000 characters)
- **XSS Protection**: Text content properly escaped in UI

## Integration Points

### Event Overview Page
- Chat button appears next to "Report Issue" button
- Visibility controlled by user role and enrollment status
- Integrates with existing event data and participant lists

### User Profiles
- Uses existing profile data (names, avatars, roles)
- Respects profile picture settings and fallback initials
- Integrates with volunteer role assignments

### Application System
- Chat access granted automatically when volunteer application is approved
- Participants grouped by their assigned volunteer roles
- Organizer always has access to their event chats

## Performance Considerations

- **Polling Strategy**: 3-second intervals for messages, 15-second for unread counts
- **Message Limits**: 2000 character limit per message
- **Efficient Queries**: Indexed database queries for fast message retrieval
- **Lazy Loading**: Participant data loaded only when chat is opened
- **Memory Management**: Polling intervals cleared when chat is closed

## Future Enhancements

- **Real-time WebSocket**: Replace polling with WebSocket connections
- **Message History**: Pagination for large message histories
- **File Sharing**: Support for image and document attachments
- **Message Reactions**: Emoji reactions to messages
- **Typing Indicators**: Show when someone is typing
- **Push Notifications**: Browser notifications for new messages
- **Message Search**: Search through chat history
- **Message Threading**: Reply to specific messages