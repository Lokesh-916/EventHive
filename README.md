# EventHive Project

This project is organized into a full-stack structure.

## Directory Structure

- **`client/`**: Contains the frontend application.
  - **`public/`**: Static assets.
    - `assets/images`: Images and SVGs.
    - `assets/videos`: Video files.
  - **`src/`**: Source files.
    - `styles/`: CSS source files (Tailwind input/output).
  - **`index.html`**: Main entry point.
  - **`v2/`**: Legacy or alternate version.
- **`server/`**: (Future) Backend application logic.

## Getting Started

### Client (Frontend)

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies (if any):
   ```bash
   npm install
   ```

3. Run Tailwind CSS in watch mode:
   ```bash
   npx tailwindcss -i ./src/styles/input.css -o ./src/styles/output.css --watch
   ```

4. Open `index.html` in your browser or use a live server.
