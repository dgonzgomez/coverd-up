# CoverdUp - Album Guessing Game

An album guessing game where players try to identify albums from pixelated covers with 5 attempts.

## Features

- **Full-Stack Architecture**: React 18 + TypeScript frontend with Express.js + Node.js backend
- **Spotify API Integration**: Real album data from Spotify's Web API
- **Progressive Pixelation**: Gradual reveal of album covers over 5 attempts
- **Modern Tech Stack**: PostgreSQL + Prisma, Docker, Tailwind CSS, Framer Motion
- **Authentication**: Optional user accounts with JWT authentication
- **Responsive Design**: Mobile-friendly interface with modern UI/UX

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- Framer Motion for animations
- Zustand for state management
- React Query for server state

### Backend
- Node.js with Express.js
- TypeScript
- PostgreSQL database
- Prisma ORM
- JWT authentication
- Spotify Web API integration

### DevOps
- Docker containerization
- Docker Compose for local development
- Environment-based configuration

## Getting Started

1. Clone the repository
2. Install dependencies: `npm run install:all`
3. Set up environment variables (see `backend/env.example` and `frontend/env.example`)
4. Set up Spotify API credentials (see `SPOTIFY_SETUP.md`)
5. Start the development servers: `npm run dev`

## Environment Setup

### Backend (.env)
```
DATABASE_URL="postgresql://username:password@localhost:5432/coverdup"
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="7d"
SPOTIFY_CLIENT_ID="your-spotify-client-id"
SPOTIFY_CLIENT_SECRET="your-spotify-client-secret"
```

### Frontend (.env)
```
VITE_API_URL="http://localhost:3001/api"
```

## License

MIT
