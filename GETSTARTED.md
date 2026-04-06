# Getting Started

This is a social media application with a Next.js frontend and Fastify backend.

## Prerequisites

- Node.js 18+
- PostgreSQL (for production) or use SQLite for development

## Quick Start

### Backend

```bash
cd backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > .env.local

# Start development server
npm run dev
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Environment Variables

### Backend (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Database connection string (SQLite for dev, PostgreSQL for prod) | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `PORT` | Server port (default: 3001) | Yes |
| `SITE_URL` | Absolute URL for building absolute paths | Yes |
| `NODE_ENV` | Environment (development/production) | Yes |

Example for development (SQLite):
```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your-secure-secret-key-min-32-chars"
PORT=3001
SITE_URL=http://localhost:3001
NODE_ENV=development
```

Example for production (PostgreSQL):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
JWT_SECRET="your-secure-secret-key-min-32-chars"
PORT=3001
SITE_URL=https://yourdomain.com
NODE_ENV=production
```

### Frontend (.env.local)

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | Yes |

## Database

The backend uses Prisma. To reset the database:

```bash
cd backend
npx prisma migrate reset
```

## Building for Production

### Frontend

```bash
cd frontend
npm run build
npm start
```

### Backend

```bash
cd backend
npm run build  # if using TypeScript
npm start
```

## Project Structure

```
/backend         - Fastify API server
/frontend        - Next.js React application
/refs/           - Design reference files
```
