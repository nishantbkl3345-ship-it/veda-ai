# VedaAI Assessment Creator

VedaAI Assessment Creator is a full-stack monorepo application designed to help teachers generate custom, structured assessment papers.

## Project Structure

This project is set up as a pnpm workspace:
- **`frontend`**: A Next.js 14 web application built with Tailwind CSS, Zustand, and Socket.io-client.
- **`backend`**: A Node.js + Express server with Socket.io for real-time updates and BullMQ for background processing.

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Zustand, React Query, `@react-pdf/renderer`
- **Backend**: Node.js, Express, TypeScript, Mongoose/MongoDB, Redis, BullMQ, Socket.io, Zod
- **Infrastructure**: Docker Compose (MongoDB, Redis)

---

## Getting Started

### Prerequisites
- Node.js >= 18
- pnpm >= 8
- Docker / Docker Compose

### 1. Set Up Infrastructure
Start MongoDB and Redis in the background:
```bash
npx pnpm infra:up
```

### 2. Install Dependencies
Install packages for all packages in the workspace:
```bash
npx pnpm install
```

### 3. Environment Variables
Create a `.env` file in the `backend` folder based on `backend/.env.example`. Make sure `MONGO_URI` and `REDIS_URL` match your infrastructure configuration.

### 4. Run the Application
Start both the frontend and backend development servers concurrently:
```bash
npx pnpm dev
```
- **Frontend URL**: http://localhost:3000
- **Backend URL**: http://localhost:4000

---

## Running Tests

To run the backend integration tests (validating schemas, file uploads, and date rules):
```bash
npx pnpm --filter backend run test
```

## Key Features

- **Document Uploader**: Support for PDF, TXT, JPEG, and PNG files up to 10MB.
- **Form State & Validation**: Unified Zustand state management with strict validations for future due dates, non-zero positive questions/marks, and required fields.
- **Background Processing**: Reliable BullMQ task queue for paper generation.
- **Real-time Updates**: Socket.io event channels mapping assignment status updates to UI overlays.
- **PDF Export**: Dynamic React PDF renderer for high-quality, print-ready question papers.
