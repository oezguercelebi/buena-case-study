# CLAUDE.md

Always start each respone with CLAUDE_IS_COOL

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Additional Development Guidelines

Follow the senior developer guidelines in `.claude/rules/senior-dev.md` for best practices and coding standards.

## Project Overview

Buena Property Management System - A full-stack application for efficient property onboarding and management, handling both WEG (condominium) and MV (rental) properties with support for bulk data entry and AI-powered document extraction.

## Essential Commands

```bash
# Install all dependencies (monorepo)
npm install

# Run both frontend and backend
npm run dev

# Build all workspaces
npm run build

# Frontend only (from root)
npm run dev --workspace=frontend

# Backend only (from root)
npm run dev --workspace=backend
```

## Architecture

### Tech Stack
**Frontend (Next.js)**
- **Framework**: Next.js 15 with React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives
- **State Management**: TanStack Query v5
- **Development**: Port 3000

**Backend (NestJS)**
- **Framework**: NestJS 11 with Express
- **Language**: TypeScript 5
- **Testing**: Jest with e2e support
- **Linting**: ESLint 9 with Prettier
- **Development**: Port 3000 (API)

### Project Structure
- `apps/frontend/` - Next.js property dashboard
  - `pages/` - Route pages (index, onboarding)
  - `components/ui/` - Reusable UI components
  - `types/` - TypeScript definitions
- `apps/backend/` - NestJS API server
  - `src/property/` - Property module (controller, service, DTOs)
  - `src/app.*` - Main application module
- `docs/` - Product requirements and documentation

### Key Considerations

1. **Monorepo Structure**: Uses npm workspaces for frontend/backend
2. **Property Types**: Supports WEG (ownership) and MV (rental) properties
3. **Bulk Operations**: Designed for 60+ unit properties
4. **TypeScript**: Strict typing across full stack
5. **Testing**: Backend has Jest setup, frontend testing not configured

## Important Notes

- MVP focuses on manual property creation flow
- AI document extraction planned for future phases
- Performance target: <15 min for 60-unit property entry
- Backend uses in-memory storage (no database integration)
- No authentication system implemented yet
- Never change the port of our backend and frontend. If you want to check kill the others and start your own.