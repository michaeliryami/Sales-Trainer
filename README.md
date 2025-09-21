# AI Sales Trainer

A full-stack monorepo application for AI-powered sales training with voice interactions.

## 🏗️ Architecture

This is a monorepo containing:
- **Frontend**: React + Vite + TypeScript dashboard
- **Backend**: Node.js + Express + TypeScript API server

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm

### Installation & Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development servers**
   ```bash
   npm run dev
   ```
   This will start both frontend (http://localhost:3000) and backend (http://localhost:3001) concurrently.

### Individual Commands

- **Frontend only**: `npm run dev:frontend`
- **Backend only**: `npm run dev:backend`
- **Build all**: `npm run build`
- **Lint all**: `npm run lint`
- **Lint fix all**: `npm run lint:fix`

## 📁 Project Structure

```
ai-sales-trainer/
├── package.json              # Root workspace config
├── README.md                 # This file
├── frontend/                 # React frontend
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   ├── src/
│   │   ├── App.tsx          # Main dashboard component
│   │   ├── App.css          # Dashboard styles
│   │   ├── main.tsx         # React entry point
│   │   └── index.css        # Global styles
│   ├── .eslintrc.cjs        # ESLint config
│   └── .prettierrc          # Prettier config
└── backend/                  # Express API server
    ├── package.json
    ├── tsconfig.json
    ├── .env.example         # Environment variables template
    ├── src/
    │   ├── index.ts         # Server entry point
    │   └── routes/
    │       ├── runs.ts      # Training runs API
    │       └── webhooks.ts  # VAPI webhook handlers
    ├── .eslintrc.js         # ESLint config
    └── .prettierrc          # Prettier config
```

## 🔌 API Endpoints

### Health Check
- `GET /api/health` - Returns server status

### Training Runs
- `GET /api/runs` - Get all training runs
- `POST /api/runs` - Create new training run

### Webhooks
- `GET /api/webhooks/vapi` - VAPI webhook status
- `POST /api/webhooks/vapi` - Handle VAPI webhooks

## ⚙️ Configuration

### Backend Environment Variables
Copy `.env.example` to `.env` in the backend directory:
```bash
cp backend/.env.example backend/.env
```

Default configuration:
- Backend runs on port 3001
- Frontend runs on port 3000 with API proxy to backend

### Development Features
- **Hot reload** for both frontend and backend
- **TypeScript** with strict type checking
- **ESLint + Prettier** for code formatting
- **API proxy** from frontend to backend during development
- **CORS** enabled for cross-origin requests

## 🛠️ Development Workflow

1. Make changes to either frontend or backend code
2. Changes will automatically reload thanks to Vite (frontend) and tsx (backend)
3. Use `npm run lint` to check code quality
4. Use `npm run lint:fix` to auto-fix linting issues

## 📦 Building for Production

```bash
npm run build
```

This builds both frontend and backend for production deployment.

## 🎯 Next Steps

- Set up database integration
- Implement authentication
- Add VAPI integration
- Deploy to cloud platform
- Add monitoring and logging
