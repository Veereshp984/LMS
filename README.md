
# Learning Management System (LMS)

A full-stack LMS project where students can browse subjects, watch YouTube course videos in strict sequence, track progress, and resume from where they left off.

## Project Overview

This project solves a common learning issue: YouTube playlists are useful but not structured for progress-based learning.  
In this LMS:

- Courses are organized as `Subject -> Section -> Video`
- Videos unlock in sequence (prerequisite-based)
- Progress is stored in DB per user
- Students resume from last watched timestamp
- Auth is handled securely using JWT + refresh tokens

---

## Features

- User registration and login
- JWT access token (short expiry) + refresh token (cookie)
- Public subject listing
- Protected subject tree and video details
- Strict video ordering and locking logic
- YouTube embedding (`react-youtube`)
- Auto progress save every few seconds
- Resume playback from saved position
- Subject-wise completion summary

---

## Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Zustand
- Axios
- React Router
- react-youtube

### Backend
- Node.js
- Express.js
- Knex.js

### Database
- MySQL (Aiven)

### Deployment
- Frontend: Vercel
- Backend: Render

---

## Folder Structure

```text
LMS/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── modules/
│   │   ├── utils/
│   │   └── migrations/
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── lib/
    │   └── store/
    └── package.json
```

---

## Database Tables

- `users`
- `subjects`
- `sections`
- `videos`
- `enrollments`
- `video_progress`
- `refresh_tokens`

---

## API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

### Subjects
- `GET /api/subjects`
- `GET /api/subjects/:subjectId`
- `GET /api/subjects/:subjectId/tree`
- `GET /api/subjects/:subjectId/first-video`

### Videos
- `GET /api/videos/:videoId`

### Progress
- `GET /api/progress/subjects/:subjectId`
- `GET /api/progress/videos/:videoId`
- `POST /api/progress/videos/:videoId`

### Enrollments
- `POST /api/enrollments/:subjectId`
- `GET /api/enrollments/mine`

### Health
- `GET /api/health`

### Chat
- `POST /api/chat`

---

## Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000

DB_HOST=your-host
DB_PORT=your-port
DB_NAME=your-db
DB_USER=your-user
DB_PASSWORD=your-password
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

CORS_ORIGIN=http://localhost:5173,https://lms-bice-two.vercel.app
COOKIE_DOMAIN=localhost
NODE_ENV=development
HUGGING_FACE_API_KEY=your_hf_token
HUGGING_FACE_MODEL=Qwen/Qwen3.5-0.8B
```

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000
```

---

## Local Setup

### 1. Clone repo
```bash
git clone <your-repo-url>
cd LMS
```

### 2. Start backend
```bash
cd backend
npm install
npm run migrate:latest
npm run dev
```

### 3. Start frontend
```bash
cd ../frontend
npm install
npm run dev
```

### 4. Open app
- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:5000/api/health`

---

## How Progress Works

1. User opens a video.
2. Backend checks if video is unlocked.
3. If unlocked, frontend loads saved progress.
4. While video is playing, progress is sent every few seconds.
5. On pause/end/navigation, final progress is flushed.
6. On completion, next video unlocks.

---

## Deployment (Simple)

### Backend on Render
- Root: `backend`
- Build: `npm install`
- Start: `npm start`
- Add all backend env vars
- Run migrations: `npm run migrate:latest`

### Frontend on Vercel
- Root: `frontend`
- Build: `npm run build`
- Env: `VITE_API_BASE_URL=https://your-render-url`

---

## Future Improvements

- Admin panel for creating/editing subjects
- Better filtering and search
- Certificates/milestones
- Unit and integration tests
- Course analytics dashboard
