# TallerNova - Development Setup Guide

## Prerequisites

Before starting, ensure you have installed:

1. **Node.js** (v18+ LTS recommended)
   - Download from: https://nodejs.org/
   - Verify: `node --version` and `npm --version`

2. **NestJS CLI** (Global)
   ```powershell
   npm install -g @nestjs/cli
   ```

3. **Angular CLI** (Global)
   ```powershell
   npm install -g @angular/cli
   ```

## Project Setup

### Step 1: Backend Initialization

Navigate to the backend directory and run:

```powershell
cd backend
nest new . --package-manager npm --skip-git
```

Or if you prefer more control, create from scratch:

```powershell
cd backend
npm init -y
npm install @nestjs/core @nestjs/common @nestjs/platform-express @nestjs/jwt @nestjs/passport passport passport-jwt @nestjs/config class-validator class-transformer dotenv typescript jest @types/jest @types/node ts-loader ts-jest
npm install -D @types/express
```

### Step 2: Frontend Initialization

Navigate to the frontend directory and run:

```powershell
cd frontend
ng new . --routing --style=scss --skip-git
```

Or manually:

```powershell
cd frontend
npm init -y
npm install @angular/animations @angular/common @angular/compiler @angular/core @angular/forms @angular/platform-browser @angular/platform-browser-dynamic @angular/router rxjs tslib zone.js
npm install -D @angular/cli @angular/compiler-cli typescript
```

### Step 3: Project Structure

After initialization, your project should have this structure:

```
TallerNovaCopilot/
├── backend/
│   ├── src/
│   │   ├── main.ts
│   │   └── app.module.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── main.ts
│   │   └── app/
│   ├── package.json
│   └── tsconfig.json
├── docs/
└── .github/
    └── copilot-instructions.md
```

### Step 4: Running the Projects

**Backend**:
```powershell
cd backend
npm start
```

**Frontend** (in another terminal):
```powershell
cd frontend
ng serve
```

## Architecture Overview

Both projects follow **Clean Architecture** with layers:
- **Domain**: Business logic, entities, repository interfaces
- **Application**: Use cases, orchestration
- **Infrastructure**: External service implementations
- **Presentation**: Controllers (backend) / Components (frontend)

## Testing

Both projects use:
- **Backend**: Jest (configured for 80%+ coverage)
- **Frontend**: Karma (configured for 80%+ coverage)

Run tests:
```powershell
# Backend
npm run test

# Frontend
ng test
```

---

Once Node.js is installed, proceed to Step 1 in "Project Setup" section above.
