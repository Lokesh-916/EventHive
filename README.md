# EventHive

Operations-First Event Platform

## Project Structure

```
EventHive/
├── client/          # Frontend files (HTML, CSS, JS, assets)
├── server/          # Express.js backend server
└── README.md        # This file
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

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

1. Start the server (from the `server` directory):
```bash
cd server
npm start
```

Or for development with auto-restart:
```bash
npm run dev
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

### Building CSS (Optional)

If you make changes to Tailwind CSS:

```bash
cd client
npm run build
```

Or watch for changes:
```bash
npm run dev
```

## Features

- Clean URLs (no .html extensions)
- Multi-role registration (Volunteer, Organizer, Client)
- Responsive design
- Modern UI with glassmorphism effects
- Support page with FAQ

## Available Routes

- `/` - Home page
- `/register` - Registration (supports ?type=volunteer|organizer|client)
- `/support` - Support and FAQ page
- `/create-event` - Create event page
- `/event-info` - Event information page
- `/report-incident` - Report incident page

## Technology Stack

- Frontend: HTML5, Tailwind CSS, Vanilla JavaScript
- Backend: Node.js, Express.js
- Fonts: Google Fonts (Inter, Satisfy)

## License

All rights reserved © 2026 EventHive

EventHive is a modern platform designed to connect event organizers, volunteers, and participants seamlessly. It provides a comprehensive suite of tools for managing events, registering volunteers, and handling incident reports.

## Features

- **Dynamic Landing Page**: A visually appealing landing page showcasing the platform's value proposition.
- **User Registration**:
  - **Organizers**: 4-step registration process (Account, Identity, Contact, Details).
  - **Clients**: 2-step registration process (Account, Personal Details) with profile picture upload.
  - **Volunteers**: Dedicated registration flow.
- **Incident Reporting**: A streamlined interface for reporting issues or incidents.
- **Support System**: Access to help and support resources.
- **Location Services**: Automatic location fetching for easier form filling.

## Tech Stack

- **Frontend**: HTML5, JavaScript (Vanilla)
- **Styling**: Tailwind CSS
- **Design**: Responsive and modern UI with glassmorphism effects and animations.

## Directory Structure

```plaintext
EventHive/
├── client/                 # Frontend Application
│   ├── public/             # Static Assets
│   │   ├── assets/         # Images, videos, and icons
│   ├── src/                # Source Code
│   │   ├── js/             # JavaScript logic (index.js, register.js)
│   │   ├── styles/         # CSS source files (Tailwind input)
│   ├── index.html          # Landing Page
│   ├── register.html       # Registration Pages (Organizer/Volunteer/Client)
│   ├── report-incident.html # Incident Reporting Page
│   ├── support.html        # Support & FAQ Page
│   ├── tailwind.config.js  # Tailwind CSS Configuration
│   └── package.json        # Frontend Dependencies
└── server/                 # Backend Application (In Development)
```

## Getting Started

### Prerequisites

- Node.js installed on your machine.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd EventHive
    ```

2.  **Navigate to the client directory:**
    ```bash
    cd client
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

### Running the Project

1.  **Start the Tailwind CSS build process (watch mode):**
    ```bash
    npx tailwindcss -i ./src/styles/input.css -o ./src/styles/output.css --watch
    ```

2.  **Launch the application:**
    - Open `index.html` in your preferred web browser.
    - Alternatively, use a live server extension (e.g., Live Server in VS Code) for a better development experience.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
