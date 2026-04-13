# Event Chat Usage Guide

## How to Use the Event Chat Feature

### For Event Organizers

#### Accessing Chat
1. Navigate to your event's overview page (`/event-overview?id=YOUR_EVENT_ID`)
2. Look for the **"Event Chat"** button next to the "Report Issue" button
3. Click the button to open the chat window

#### Chat Interface
- **Minimized View**: Shows only the chat header
- **Normal View**: 380x520px chat window in bottom-right corner
- **Fullscreen View**: Click the expand button to see the full interface with participant sidebar

#### Participant Sidebar (Fullscreen Only)
- **Organizer Section**: Shows your profile at the top
- **Volunteer Groups**: Volunteers organized by their assigned roles
  - Security Team
  - Registration Team  
  - Setup Crew
  - etc.

#### Sending Messages
1. Type your message in the input field at the bottom
2. Press **Enter** or click the **Send** button
3. Messages are broadcast to all approved volunteers

### For Volunteers

#### Getting Access
1. Apply for a volunteer role in an event
2. Wait for the organizer to approve your application
3. Once approved, you'll see the "Event Chat" button on the event overview page

#### Joining the Chat
1. Go to the event overview page
2. Click the **"Event Chat"** button (only visible if you're approved)
3. The chat window will open showing team communication

#### Participating
- Send messages to communicate with the organizer and other volunteers
- View other team members in the sidebar (fullscreen mode)
- Receive updates and coordination messages from the organizer

### Chat Controls

#### Window Controls
- **Minimize** (−): Collapse to header only
- **Expand** (⤢): Toggle fullscreen mode
- **Close** (×): Close chat window completely

#### Floating Action Button
- Appears when chat is closed
- Shows unread message count as a red badge
- Click to reopen chat window

### Message Features

#### Message Display
- **Your messages**: Appear on the right with purple background
- **Others' messages**: Appear on the left with sender name
- **Timestamps**: Show time when message was sent
- **Auto-scroll**: Chat automatically scrolls to newest messages

#### Message Limits
- Maximum 2000 characters per message
- Text input auto-resizes up to 100px height
- Shift+Enter for new lines, Enter to send

### Notifications

#### Unread Count
- Red badge on floating action button shows unread messages
- Updates every 15 seconds automatically
- Badge disappears when all messages are read

#### Real-time Updates
- New messages appear automatically (3-second polling)
- No need to refresh the page
- Messages marked as read when chat is open

### Access Control

#### Who Can Access
- ✅ Event organizer (always has access)
- ✅ Approved volunteers (status = "approved")
- ❌ Pending volunteers (status = "pending")
- ❌ Rejected volunteers (status = "rejected")
- ❌ Users not enrolled in the event

#### Privacy
- Chat is exclusive to each event
- Messages are not visible across different events
- Only team members can see the conversation

### Troubleshooting

#### Chat Button Not Visible
- **For Organizers**: Make sure you're logged in and viewing your own event
- **For Volunteers**: Check that your application status is "approved"
- **For All**: Ensure you're on the correct event overview page

#### Messages Not Sending
- Check your internet connection
- Verify you're still logged in (token may have expired)
- Ensure message is under 2000 characters
- Try refreshing the page and reopening chat

#### Participants Not Loading
- Make sure you're in fullscreen mode to see the sidebar
- Check that volunteers have been approved for the event
- Verify the event has volunteer roles defined

#### Unread Count Not Updating
- Badge updates every 15 seconds automatically
- Open and close the chat to manually refresh
- Check browser console for any JavaScript errors

### Best Practices

#### For Organizers
- Use chat for event coordination and updates
- Keep messages clear and actionable
- Group volunteers by roles for better organization
- Send important updates to the entire team

#### For Volunteers
- Check chat regularly for updates
- Ask questions if instructions are unclear
- Communicate with team members about coordination
- Keep messages relevant to the event

#### General Guidelines
- Be professional and respectful
- Keep messages concise and relevant
- Use proper grammar for clarity
- Avoid spam or excessive messaging

### Mobile Usage

#### Responsive Design
- Chat window adapts to mobile screen sizes
- On mobile, chat takes full screen space
- Touch-friendly controls and buttons
- Sidebar hidden on small screens (even in "fullscreen")

#### Mobile Tips
- Tap and hold to select text
- Use device keyboard for better typing experience
- Swipe to scroll through message history
- Tap outside chat to close on mobile

### Integration with Event Management

#### Event Lifecycle
- Chat becomes available when event is published
- Access granted/revoked based on volunteer approval status
- Chat remains accessible through event completion
- Historical messages preserved for reference

#### Role-Based Organization
- Volunteers grouped by their assigned roles in sidebar
- Role assignments come from volunteer applications
- Organizer can see all participants regardless of role
- Easy identification of team members by function