# Buena Case Study

A modern property management web application built with Next.js and NestJS in a monorepo structure.

## 🚀 Quick Start

```bash
# Install all dependencies
npm install

# Start both frontend and backend in development mode
npm run dev
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## 📁 Project Structure

```
/buena-case-study
├── apps/
│   ├── frontend/          # Next.js application
│   │   ├── pages/
│   │   │   ├── index.tsx       # Dashboard page
│   │   │   └── onboarding.tsx  # Property onboarding wizard
│   │   ├── components/ui/      # Radix UI components
│   │   ├── styles/            # Global styles (Tailwind)
│   │   └── types/             # TypeScript type definitions
│   │
│   └── backend/           # NestJS application
│       └── src/
│           └── property/       # Property module
│               ├── property.controller.ts
│               ├── property.service.ts
│               └── dto/        # Data transfer objects
│
├── package.json          # Monorepo configuration (npm workspaces)
└── .env.example         # Environment variables template
```

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI
- **State Management**: React Query (TanStack Query)
- **React**: Version 19

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Storage**: In-memory (for demo purposes)
- **API**: RESTful endpoints with CORS enabled

## 📝 Environment Setup

1. Copy the example environment files:
```bash
# Root environment (optional)
cp .env.example .env

# Frontend environment
cp apps/frontend/.env.example apps/frontend/.env.local

# Backend environment
cp apps/backend/.env.example apps/backend/.env
```

2. Update the environment variables as needed (defaults should work for local development)

## 🔧 Available Scripts

### Root Level
```bash
npm run dev    # Start both frontend and backend in development mode
npm run build  # Build both applications
npm run start  # Start both applications in production mode
```

### Frontend (`apps/frontend/`)
```bash
npm run dev    # Start Next.js development server
npm run build  # Build for production
npm run start  # Start production server
```

### Backend (`apps/backend/`)
```bash
npm run dev        # Start NestJS in watch mode
npm run build      # Build for production
npm run start      # Start production server
npm run start:dev  # Start in watch mode (same as dev)
```

## 🔌 API Endpoints

Base URL: `http://localhost:3001`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/property` | Get all properties |
| POST   | `/property` | Create a new property |

### Create Property Payload Example
```json
{
  "name": "Sunset Apartments",
  "address": "123 Main St, City, State 12345",
  "buildings": [
    {
      "name": "Building A",
      "units": [
        {
          "number": "101",
          "type": "Studio"
        },
        {
          "number": "102",
          "type": "1 Bedroom"
        }
      ]
    }
  ]
}
```

## 🏗 Architecture Decisions

- **Monorepo Structure**: Uses npm workspaces for simple dependency management
- **In-Memory Storage**: Intentionally simple for demo purposes (data resets on restart)
- **TypeScript**: Full type safety across frontend and backend
- **Minimal Setup**: No database configuration required for quick setup

## 🚦 Development Notes

- The backend runs on port 3001 to avoid conflicts with Next.js (port 3000)
- CORS is enabled to allow frontend-backend communication
- In-memory storage means data is lost when the backend restarts
- Both applications support hot reload in development mode

## 📄 License

Private - Coding Challenge