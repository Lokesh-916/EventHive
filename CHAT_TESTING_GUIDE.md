# Event Chat Testing Guide

## Quick Test Steps

### 1. Start the Server
```bash
cd server
npm start
# or
npm run dev
```

### 2. Test Chat API Endpoints
1. Navigate to `http://localhost:5000/test-chat`
2. This page will help you test the chat API endpoints directly
3. Make sure you're logged in first (token should be in localStorage)

### 3. Test Full Chat Feature
1. Go to an event overview page: `http://localhost:5000/event-overview?id=YOUR_EVENT_ID`
2. Look for the "Event Chat" button next to "Report Issue"
3. Click to open the chat window

## API Endpoints Fixed

The main issue was incorrect API endpoint URLs. Fixed endpoints:

- ✅ `GET /api/chat/event/:eventId/participants` - Get chat participants
- ✅ `GET /api/chat/event/:eventId/messages` - Get chat messages  
- ✅ `POST /api/chat/event/:eventId/messages` - Send chat message
- ✅ `GET /api/chat/event/:eventId/unread-count` - Get unread count

## Code Structure

### Backend (`server/routes/chat.js`)
- Event chat routes with proper access control
- Only organizers and approved volunteers can access
- Messages are broadcast to all participants
- Unread count tracking

### Frontend (`client/src/js/event-chat.js`)
- Clean, class-based JavaScript implementation
- Handles all chat functionality (open, close, minimize, fullscreen)
- Real-time message polling every 3 seconds
- Unread count updates every 15 seconds

### Integration (`client/event-overview.html`)
- Chat button integrated into event overview
- Chat window HTML structure with responsive design
- Visibility controlled by user role and enrollment status

## Testing Scenarios

### For Organizers
1. Create an event
2. Go to event overview page
3. Chat button should be visible
4. Can send messages to team
5. See all volunteers in sidebar (fullscreen mode)

### For Volunteers
1. Apply for an event role
2. Get approved by organizer
3. Go to event overview page
4. Chat button should be visible
5. Can participate in team chat

### For Non-Participants
1. View event overview without being enrolled
2. Chat button should be hidden
3. Direct API access should return 403 Forbidden

## Troubleshooting

### Chat Button Not Visible
- Check user is logged in
- Verify user role (organizer or approved volunteer)
- Check browser console for JavaScript errors

### API 404 Errors
- Ensure server is running
- Check API endpoint URLs are correct
- Verify chat routes are loaded in server.js

### Messages Not Loading
- Check browser network tab for API responses
- Verify user has access to the event
- Check server logs for errors

### Profile Pictures Not Loading
- Check if profile picture URLs are valid
- Fallback to initials should work automatically
- Check browser console for image load errors

## Browser Cache Issues

If you're seeing old JavaScript behavior:
1. Hard refresh: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
2. Clear browser cache
3. Open developer tools and disable cache
4. The script tag includes `?v=1.0` to bust cache

## Database Requirements

Make sure your MongoDB has:
- Events with volunteer roles defined
- User applications with "approved" status
- Proper user profiles with names and roles

## Security Features

- JWT authentication required
- Role-based access control
- Event-scoped message isolation
- Input validation and sanitization
- XSS protection through proper HTML escaping