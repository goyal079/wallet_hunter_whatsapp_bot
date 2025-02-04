
# Member Management System

A WhatsApp-based member data collection system with web visualization.

## Quick Links

- 🤖 Chat with the bot: +1 (415) 523-8886 (send "join" followed by "hi")
- 🌐 View collected data: [https://wallet-hunter.onrender.com/](https://wallet-hunter.onrender.com/)

## Overview

This system allows community members to:

1. Submit their details via WhatsApp chat
2. View and filter member data through a web interface
3. Download member data in CSV format

## Features

### WhatsApp Bot

- Interactive data collection through conversational flow
- Step-by-step form filling with validation
- Confirmation before data submission
- Support for multiple data points including:
  - Personal details
  - Contact information
  - Family information
  - Professional details
  - Health information

### Web Interface

- Member listing with pagination
- Advanced filtering options:
  - Samaj (Community)
  - Age range
  - Gender
  - Blood group
  - Marital status
- CSV data export with all member details
- Dynamic filter options API

## API Documentation

Access the Swagger documentation at `/api-docs` when running locally.

### Key Endpoints

- `GET /api/members` - List members with pagination and filters
- `GET /api/members/:id` - Get specific member details
- `GET /api/members/filter-options` - Get available filter options
- `GET /api/members/download` - Download member data as CSV
- `POST /webhook` - WhatsApp webhook endpoint

## Tech Stack

### Backend

- Node.js & Express.js for API server
- PostgreSQL with Sequelize ORM
- Twilio WhatsApp API for bot communication
- Swagger UI for API documentation

### Development & Deployment

- ESLint for code quality
- GitHub Actions for CI
- Render for hosting
- Render PostgreSQL for database

## Setup

1. Install dependencies:

npm install

2. Set up environment variables:

bash
cp .env.example .env

3. Configure your `.env` file:

## Database

DATABASE_URL=postgres://username:password@host:5432/database

## Twilio

TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=your_number

## Server

PORT=3000
NODE_ENV=development

3. Start the server:
   bash
   npm start

## Development Workflow

1. Code changes are pushed to GitHub
2. GitHub Actions runs basic checks:
   - Logs commit information
   - Verifies Node.js environment
3. Render automatically deploys from master branch post standard environment and version checks

## License

MIT
