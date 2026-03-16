# EventHive

Operations-First Event Platform designed to connect event organizers, volunteers, and clients seamlessly. It provides a comprehensive suite of tools for managing events, registering volunteers, and orchestrating flawless experiences.

## Project Structure

```
EventHive/
├── client/          # Frontend files (HTML, Tailwind CSS, JS, assets)
├── server/          # Express.js backend server with MongoDB Atlas
└── README.md        # This file
```

## Features

- **Modern UI**: Dark glassmorphic theme across the entire application using Tailwind CSS.
- **Role-Based Workflows**: Tailored dashboard and flows for Volunteers, Organizers, and Clients.
- **Smart Routing**: Multi-page application structure with clean URLs (no `.html` extensions).
- **Authentication**: JWT-based login and registration system.
- **Dynamic Events Management**: Track, create, and manage ongoing/upcoming/past events seamlessly.
- **Responsive Design**: Mobile-friendly navigation and data tables.

## Available Routes

- `/` - Home/Landing page
- `/home` - Volunteer Dashboard
- `/organiser-home` - Organizer Home
- `/organiser` - Organizer Dashboard
- `/register` - Registration (supports `?type=volunteer|organizer|client`)
- `/create-event` - Create event page
- `/event-info` - Event information page
- `/report-incident` - Report incident page
- `/support` - Support and FAQ page

## Technology Stack

- **Frontend**: HTML5, Vanilla JavaScript, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Fonts**: Google Fonts (Inter, Satisfy)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm
- MongoDB Atlas Cluster URI

### Environment Variables

Before running the backend, create a `.env` file in the `server` directory and add your MongoDB Atlas URI:

1. Create the `.env` file:
   ```bash
   cd server
   touch .env
   ```
2. Add your MongoDB URI (example):
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/eventhive?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_key
   PORT=3000
   ```

*(Note: The `.env` file is included in `.gitignore` and should never be committed.)*

### Installation

1. Install server dependencies:
   ```bash
   cd server
   npm install
   ```

2. Install client dependencies (for Tailwind CSS):
   ```bash
   cd ../client
   npm install
   ```

### Running the Application

1. **Start the Express Server:**
   From the `server` directory, run:
   ```bash
   cd server
   npm run dev
   ```
   *(This starts the node server typically on port 3000)*

2. **Start the Tailwind CSS Compiler:**
   Open a new terminal window/tab, navigate to the `client` directory, and run:
   ```bash
   cd client
   npm run dev
   ```
   *(This watches for class changes in your HTML/JS and updates `output.css`)*

3. **View the App:**
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## License

All rights reserved © 2026 EventHive
