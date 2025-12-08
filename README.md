# Robot Visualization

A real-time robot tracking application built with React, TypeScript, and Leaflet, visualizing robot movements within Downtown Los Angeles.

## Prerequisites

- Node.js 18+ and npm
- Backend API running (default: `http://localhost:4000`)

## Backend Setup

This frontend application requires a running backend API to function. The backend is in a separate repository.

1. **Clone and start the backend:**

   ```bash
   # Clone the backend repository (if not already cloned)
   git clone <backend-repo-url>
   cd <backend-repo-directory>

   # Install dependencies and start the server
   npm install
   npm start
   ```

2. **Verify the backend is running:**

   The backend should be accessible at `http://localhost:4000` (or your configured port).

   Test with:

   ```bash
   curl http://localhost:4000/robots
   ```

**Note:** Without a running backend, the application will display connection errors and no robot data will be available.

## Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure API endpoint (optional):**

   Create a `.env` file in the root directory:

   ```env
   VITE_API_BASE_URL=http://localhost:4000
   ```

3. **Start development server:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. **Build for production:**

   ```bash
   npm run build
   ```

5. **Run tests:**
   ```bash
   npm test
   ```

## Features

- **Real-time tracking**: Auto-polling robot positions with configurable intervals
- **Interactive map**: Leaflet-based visualization with OpenStreetMap tiles
- **Movement controls**: Manual and automatic robot movement modes
- **Input validation**: Client-side validation with safe range clamping
- **Error handling**: User-friendly error messages with retry logic
- **Responsive design**: Mobile-first approach with touch-optimized controls

## Tech Stack

- React 18 with TypeScript
- Vite for build tooling
- Leaflet for map visualization
- Vitest for unit testing
- ESLint + Prettier for code quality
