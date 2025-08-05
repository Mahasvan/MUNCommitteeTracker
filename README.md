# MUN Committee Tracker

A comprehensive tracking system for Model United Nations committees that allows you to monitor all committee activities including speeches, points of order, points of information, and motions.

## Features

- **Multi-Committee Support**: Create and manage multiple committee sessions with complete isolation
- **Portfolio Management**: Upload JSON files containing delegate/country portfolios with validation
- **Event Tracking**: Record and track:
  - Speeches (who spoke, duration)
  - Points of Information (who raised, target delegate, questions)
  - Points of Order (who raised, target delegate, reasons)
  - Motions (who raised, type, description, status)
- **Real-time History**: View chronological event history for each committee
- **Data Persistence**: SQLite database with volume mounting for Docker deployment

## Quick Start

### Using Docker (Recommended)

1. Clone the repository
2. Create a data directory: `mkdir data`
3. Run with Docker Compose:
   \`\`\`bash
   docker-compose up -d
   \`\`\`
4. Access the application at `http://localhost:3000`

### Local Development

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

3. Open `http://localhost:3000`

## Portfolio File Format

Upload a JSON file containing an array of portfolio names:

\`\`\`json
[
  "United States of America",
  "Russian Federation", 
  "China",
  "United Kingdom",
  "France",
  "Germany",
  "Japan"
]
\`\`\`

## Database Schema

The application uses SQLite with two main tables:

- **committees**: Stores committee information and portfolios
- **events**: Stores all tracked events with JSON details

## Docker Deployment

The application is containerized and includes:
- Volume mounting for database persistence
- Production-ready configuration
- Automatic database initialization

## Usage

1. **Create Committee**: Start by creating a new committee session
2. **Upload Portfolios**: Upload a JSON file with delegate/country names
3. **Track Events**: Use the interface to record:
   - Delegate speeches
   - Points of information and order
   - Motions and their outcomes
4. **View History**: Monitor all activities in chronological order

## Environment Variables

No environment variables required for basic operation. The SQLite database is automatically created and managed.

## Contributing

This is a specialized tool for MUN committee tracking. Feel free to submit issues or feature requests.
