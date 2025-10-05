# THATOO (Deployment-ready)

This archive was prepared for Vercel deployment (frontend + backend).

## What I changed / added
- `vercel.json` — config for Vercel builds & routing (frontend static build + backend server).
- Root `package.json` — monorepo wrapper with workspaces `frontend` and `backend`.
- `backend/package.json` — ensured a `start` script (`node server.js`).
- `backend/.env.example` — example env file for MySQL credentials (do **not** commit real credentials).
- `frontend/dist/` — placeholder created if not present. If your original frontend included `/dist/` it was preserved.

## MySQL
The backend uses MySQL. Add your real DB credentials in `backend/.env` (copy from `.env.example`).

Example environment variables (backend/.env):
```
DB_HOST=your_host
DB_PORT=3306
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=your_db
```
Or a single URI in `DATABASE_URL` depending on your implementation.

## How to finish locally (required)
1. Extract this archive.
2. Install dependencies for both packages:
   ```bash
   cd THATOO
   npm install --workspaces
   ```
3. Build frontend so `frontend/dist` is production-ready:
   ```bash
   cd frontend
   npm install
   npm run build
   cd ..
   ```
4. Start backend locally (for testing):
   ```bash
   cd backend
   npm install
   npm start
   ```
5. Deploy to Vercel — from the `THATOO` folder, run `vercel` or upload the folder to Vercel. Ensure Vercel has your MySQL credentials as environment variables for the backend.

## Important note
I was not able to run `npm run build` in this environment, so if your frontend requires a real build to work, run `npm run build` locally to produce a proper `frontend/dist` before deploying to Vercel.