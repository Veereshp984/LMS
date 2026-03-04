# LMS Fullstack App

## Structure

- `backend/` Express + Knex + MySQL + JWT auth
- `frontend/` React (Vite) + Tailwind + Zustand + react-youtube

## Backend Setup

1. `cd backend`
2. `npm install`
3. Update `backend/.env` JWT secrets before running.
4. `npm run migrate:latest`
5. `npm run dev`

## Frontend Setup

1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Implemented API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/subjects`
- `GET /api/subjects/:subjectId`
- `GET /api/subjects/:subjectId/tree`
- `GET /api/subjects/:subjectId/first-video`
- `GET /api/videos/:videoId`
- `GET /api/progress/subjects/:subjectId`
- `GET /api/progress/videos/:videoId`
- `POST /api/progress/videos/:videoId`
- `GET /api/health`
