# Vercel deployment quick guide

- Import the GitHub repository.
- Root directory: `frontend`.
- Framework preset: Vite.
- Build command: `npm run build`.
- Output directory: `dist`.
- Environment variable: `VITE_API_BASE_URL=https://YOUR-RENDER-SERVICE.onrender.com`.

After deploy, update Render's `CORS_ORIGIN` to the exact Vercel origin and redeploy Render. Then test a complete call in the deployed browser.
