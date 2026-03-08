# EventHive Server

This is the Express.js server for EventHive that enables clean URLs (without .html extensions).

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

## Running the Server

### Production Mode
```bash
npm start
```

### Development Mode (with auto-restart)
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## Routes

The following clean URLs are available:

- `/` - Home page (index.html)
- `/register` - Registration page (register.html)
- `/support` - Support page (support.html)
- `/create-event` - Create event page (create-event.html)
- `/event-info` - Event info page (event-info.html)
- `/report-incident` - Report incident page (report-incident.html)

Query parameters are preserved (e.g., `/register?type=volunteer`)

## Static Files

All static files (CSS, JS, images, videos) are served from the `client` directory.
