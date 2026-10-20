# CallFlow AI — Cold-call guidance workspace

A deployable full-stack starter for the Forward Deployed Engineer cold-call assignment. It provides a live eight-stage call guide, stage-by-stage logging, exact prospect wording, call history, close-call outcomes, Supabase persistence, and a backend Gemini LLM summary/follow-up endpoint.

> **Assignment integrity note:** The assignment instructions you shared contain conflicting AI-use guidance: the FDE page says AI coding assistants are fine, while the Internshala message says AI should be used only for research. Confirm permission with the recruiter before submitting AI-generated work. Review, test, and be able to explain every line and design decision. This repository is a starter project, not proof that your deployment is complete.

## Stack

- Frontend: React + TypeScript + Vite (`frontend/`)
- Backend: Node.js + Express (`backend/`)
- Database: Supabase Postgres (`database/schema.sql`)
- LLM: Google Gemini API, configurable through `GEMINI_MODEL` and `GEMINI_API_KEY`
- Deployment: Vercel frontend + Render backend

## Features

- Eight-stage guide: Opening, Purpose, Permission, Their business, Their need in their words, Objection, Next step, Close.
- Common prospect responses and quick-select outcomes at each stage.
- Prospect's exact wording and caller notes persist with stage results.
- End a call from any stage; save an outcome, next step, callback time, and summary.
- History list shows the last stage reached and saved outcome.
- Call detail screen shows the stage timeline.
- Gemini endpoint produces a concise summary and follow-up suggestion based only on the stored record.
- `/health` reports API status, storage mode, and whether an LLM key is configured.
- In-memory demo storage works without Supabase credentials for local UI/API testing. **Memory data is lost when the backend restarts**; use Supabase for persistence.

## 1. Requirements

- Node.js 20 or newer
- A Supabase project
- A Gemini API key from https://aistudio.google.com/app/apikey (or adapt `backend/src/llm.js` to another provider)
- GitHub, Render and Vercel accounts for deployment

## 2. Run locally

From the project root:

```bash
npm install
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
npm run dev
```

Open http://localhost:5173. The API runs at http://localhost:4000. If Supabase variables are not configured, the API uses in-memory demo storage; this is only for local testing.

## 3. Configure Supabase

1. Create a project at https://supabase.com/.
2. Open SQL Editor and run `database/schema.sql`.
3. In Project Settings > API, copy the Project URL and `service_role` key.
4. Put these in `backend/.env` as `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
5. Never put the service-role key in `frontend/.env`, `VITE_*` variables, GitHub, screenshots, or the browser.
6. Restart the API and verify `/health` returns `"storage":"supabase"`.

The backend uses the service-role key and server-mediated API routes. Do not create public table policies for this prototype. For production, add authentication, per-user ownership, authorization, rate limits, and audit logging before exposing real prospect data.

## 4. Configure Gemini

1. Create a key at https://aistudio.google.com/app/apikey.
2. Set `GEMINI_API_KEY` in `backend/.env` and set `GEMINI_MODEL` if desired.
3. Restart the backend; `/health` should report `"llmConfigured":true`.
4. The key is used only by the backend. Do not expose it through a `VITE_` variable.

The LLM endpoint is `POST /api/ai/summarise` with `{ "call_id": "<uuid>" }`. It returns `{ summary, follow_up, model }`. Treat the response as a suggestion, verify it against the call record, and do not use it to override a do-not-call request.

## 5. API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Health, storage mode, LLM configuration |
| POST | `/api/calls` | Start a call |
| GET | `/api/calls` | List calls with stage results |
| GET | `/api/calls/:id` | Fetch one call and its stage results |
| POST | `/api/calls/:id/stages` | Save a stage result and update current stage |
| POST | `/api/calls/:id/close` | Close call with outcome and next step |
| POST | `/api/ai/summarise` | Generate summary and follow-up suggestion |

### Example requests

```bash
curl http://localhost:4000/health
curl -X POST http://localhost:4000/api/calls -H 'Content-Type: application/json' -d '{"prospect_name":"Demo prospect","company_name":"Demo company","call_type":"First call"}'
```

## 6. Deploy backend to Render

1. Push this repository to a **public GitHub repo** after reviewing what you are publishing.
2. In Render, create a **Web Service** from the repo.
3. Set root directory to `backend` (or leave blank and use the monorepo commands below).
4. If root directory is `backend`, build command `npm install`; start command `npm start`.
5. Add environment variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `CORS_ORIGIN` (initially your local URL; update to the Vercel URL after deployment), `NODE_ENV=production`.
6. Deploy and verify `https://YOUR-RENDER-SERVICE.onrender.com/health` returns JSON.
7. Free instances may sleep after inactivity. The first request after sleep can take longer.

If you use the repository root as the Render root instead, use build command `npm install` and start command `npm run start -w backend`.

## 7. Deploy frontend to Vercel

1. Import the same GitHub repository into Vercel.
2. Set root directory to `frontend`.
3. Set build command `npm run build`, output directory `dist`.
4. Set environment variable `VITE_API_BASE_URL=https://YOUR-RENDER-SERVICE.onrender.com`.
5. Deploy, then update the backend's `CORS_ORIGIN` to the exact Vercel production URL and redeploy the backend.
6. Open the Vercel app and test create → stage save → close → history after refreshing.

## 8. Before you submit

- [ ] Supabase schema applied successfully.
- [ ] Render `/health` responds and reports `storage: supabase`.
- [ ] Render `/health` reports `llmConfigured: true`.
- [ ] Vercel app loads and can start/save/close/reopen calls.
- [ ] All eight stages work, including ending early.
- [ ] Exact wording from stage 5 is saved and shown in call detail.
- [ ] Outcome and next step are accurate; a polite goodbye is not automatically interest.
- [ ] No secrets are committed to GitHub.
- [ ] README contains actual Vercel and Render URLs and the actual model used.
- [ ] Record a minimum six-minute video with your camera visible; walk through a transcript-based call and explain one design decision in your own words.
- [ ] Upload to Google Drive and set “Anyone with the link can view”. Test the link in a private/incognito window.
- [ ] Submit repository URL and video URL in the assignment page; follow the WhatsApp step shown there.

## 9. Transcript-derived design considerations

The supplied index contains 100 calls. Logged outcomes include 14 `not_interested`, 14 `agreed_to_receive_report`, 14 `follow_up`, 13 `not_logged`, 11 `next_step_agreed`, 10 `do_not_call`, 8 `wrong_person`, 7 `interested`, 5 `moved_company`, and 4 `call_again`. The app therefore treats unsuccessful, incomplete, wrong-person and do-not-call outcomes as first-class results rather than hiding them. These are index counts; read the transcripts themselves before claiming detailed stage-level findings in your video.

The archive warns that some speaker labels may still be swapped and some calls end mid-sentence. Check context before treating any one utterance as definitive. Transcript files are supplied for this assignment only; do not publish their contents or attempt to identify real people or companies.

## 10. Limitations to address before real-world use

- No authentication or user accounts; anyone who knows the API URL could access records. Do not use real personal data in a public deployment.
- In-memory mode is temporary and resets on restart; it is not a substitute for Supabase.
- No automated transcription or call recording is implemented.
- The app does not claim to infer intent reliably; humans must verify AI summaries.
- Add rate limiting and stricter input validation before production use.
