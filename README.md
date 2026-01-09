# Webapp — Pentest request portal

Small demo stack to plan and track pentest requests. The backend is a Django API with registration/login (token-based) and a simple Nmap scan. The frontend is a React/Vite app with login, a pentest action, and a results dashboard. A docker-compose setup is included for quick local runs.

## Stack and structure
- `backend/` — Django 4.2 + sqlite. API endpoints under `/api/`.
- `frontend/` — React 18 + Vite. Talks to the backend via `VITE_BACKEND_URL`.
- `docker/` — Dockerfiles and `docker-compose.yml` to start both services.

## Quick start (Docker)
1) Requirements: Docker + docker-compose.  
2) From the repo root: `docker compose -f docker/docker-compose.yml up --build`.  
3) Backend: http://localhost:8000/api — Frontend: http://localhost:5173.  
4) Changes in `frontend/` and `backend/` are live-mounted.

## Manual start
### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```
Important env vars:
- `DJANGO_SECRET_KEY` (optional, dev fallback is present)
- `DJANGO_DEBUG` (`true`/`false`, default `true`)

### Frontend
```bash
cd frontend
npm install
npm run dev -- --host --port 5173
```
Set `VITE_BACKEND_URL` if needed (default: `http://localhost:8000/api`).

## API overview (prefix `/api/`)
- `POST /auth/register/` — Create account. Requires `username`, `password`, `target_ip`, optional `email` and `mfa_enabled`.
- `POST /auth/login/` — Login. Returns `token` or `mfa_required` + `mfa_code` (dev).
- `POST /auth/mfa/verify/` — Verify MFA with `username` + `code`.
- `GET /auth/me/` — Current user + profile (auth required).
- `POST /pentest/scan/` — Start an Nmap scan on the profile target (auth required).
- `POST /pentest/scan/` — Start a scan with optional `engine` (default `nmap`) on the profile target (auth required).
- `GET /pentest/scans/` — Scan results for the user (auth required).
- `GET /pentest/engines/` — List available scan engines.
- `GET /offerings/` — List of pentest offerings.
- `GET /requests/` — All pentest requests, newest first.
- `POST /requests/` — Create request. Requires `client_name`, `contact_email`, `scope`; optional `preferred_window`.
- `GET /requests/<id>/` — Request detail.
- `PATCH /requests/<id>/` — Update status/window (`status` ∈ `pending|in_progress|complete`, `preferred_window`).

Responses are JSON; validation errors return HTTP 400.

## Credits and scan rules
- New users start with 10 credits; each scan costs 1 credit.
- Scans can only run between 09:00 and 17:00 (backend server time).
- Max scan runtime is 5 minutes.
- Credits can be edited in Django admin under `User profiles`.

## Frontend features
- Registration, login, and dev MFA flow.
- Simple pentest action button.
- Engine selection for scans (currently `nmap`).
- Dashboard listing scan results.

## Dev tips
- Database is sqlite (`backend/db.sqlite3`). Do not delete or commit it to VCS by accident.
- CORS is open for convenience in dev (`django-cors-headers`).
- For production, set `DJANGO_DEBUG=false`, configure `DJANGO_SECRET_KEY`, and use a real database + `ALLOWED_HOSTS`.
