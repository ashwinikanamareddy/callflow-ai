# Render deployment quick guide

Recommended Render service configuration for this monorepo:

- Service type: Web Service
- Runtime: Node
- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Health check path: `/health`

Environment variables:

- `NODE_ENV=production`
- `PORT` is normally provided by Render; do not hardcode it in the dashboard.
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `GEMINI_MODEL=gemini-2.5-flash`
- `CORS_ORIGIN=https://YOUR-VERCEL-APP.vercel.app`

After deploy, open `/health`. A successful deployment returns JSON with `ok: true`. Confirm storage and LLM are both configured before demonstrating the full app.
