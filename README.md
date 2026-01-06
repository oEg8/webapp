# Webapp — Pentest aanvragenportaal

Kleine demo-stack om pentestverzoeken te plannen en bij te houden. De backend is een Django API die aanvragen opslaat en een lijst met pentestdiensten serveert. De frontend is een React/Vite-app die de API consumeert. Er is een docker-compose setup voor snel lokaal draaien.

## Stack en structuur
- `backend/` — Django 4.2 + sqlite. API endpoints onder `/api/`.
- `frontend/` — React 18 + Vite. Praat met de backend via `VITE_BACKEND_URL`.
- `docker/` — Dockerfiles en `docker-compose.yml` om beide services tegelijk te starten.

## Snel starten (Docker)
1) Vereisten: Docker + docker-compose.  
2) Vanuit de root: `docker compose -f docker/docker-compose.yml up --build`.  
3) Back-end: http://localhost:8000/api — Front-end: http://localhost:5173.  
4) Wijzigingen in de `frontend/` en `backend/` mappen worden live gemount.

## Handmatig starten
### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```
Belangrijke env vars:
- `DJANGO_SECRET_KEY` (optioneel, dev fallback aanwezig)
- `DJANGO_DEBUG` (`true`/`false`, default `true`)

### Frontend
```bash
cd frontend
npm install
npm run dev -- --host --port 5173
```
Stel `VITE_BACKEND_URL` in (default: `http://localhost:8000/api`).

## API-overzicht (prefix `/api/`)
- `GET /offerings/` — Lijst met vaste pentestdiensten.
- `GET /requests/` — Alle pentestaanvragen, nieuwste eerst.
- `POST /requests/` — Nieuwe aanvraag. Vereist `client_name`, `contact_email`, `scope`; optioneel `preferred_window`.
- `GET /requests/<id>/` — Detail van een aanvraag.
- `PATCH /requests/<id>/` — Status/venster bijwerken (`status` ∈ `pending|in_progress|complete`, `preferred_window`).

Responses zijn JSON; validatie-fouten geven HTTP 400.

## Frontend features
- Dienstenoverzicht met vaste offerings.
- Formulier om nieuwe aanvragen te plaatsen (met validatie).
- Lijst van aanvragen met status-dropdown voor snelle updates.
- Hero/CTA verwijst naar ingestelde backend-URL (`VITE_BACKEND_URL`).

## CI met Jenkins
- Pipeline-bestand: `Jenkinsfile` (declarative). Stages: backend checks (`pip install`, `python manage.py check`, `migrate`), frontend build (`npm install`, `npm run build`), optionele compose smoke-test, optioneel docker image build/push.
- Vereisten op de agent: Docker (voor compose en image builds). Voor alleen checks/builds volstaat een agent met Docker of native runtimes (de pipeline gebruikt stage-level Docker agents).
- Flags via env vars:
  - `RUN_COMPOSE_TESTS=true` om `docker compose -f docker/docker-compose.yml up` te draaien en `/api/offerings/` + `/api/requests/` te pingen.
  - `BUILD_IMAGES=true` om images te bouwen met `docker/backend.Dockerfile` en `docker/frontend.Dockerfile`.
  - `REGISTRY` (bijv. `ghcr.io/orga`) en optioneel `REGISTRY_CREDENTIALS` (Jenkins credential id) om push te activeren. Image-namen zijn instelbaar via `BACKEND_IMAGE` en `FRONTEND_IMAGE` (default `webapp-backend` / `webapp-frontend`). Tag = commit hash of buildnummer (`IMAGE_TAG`).
- Workspace wordt na afloop opgeruimd (`cleanWs()`).

## Ontwikkeltips
- Database is sqlite (`backend/db.sqlite3`). Verwijder of commit niet per ongeluk naar VCS.
- CORS staat open voor gemak in dev (`django-cors-headers`).
- Wil je productie draaien? Zet `DJANGO_DEBUG=false`, configureer `DJANGO_SECRET_KEY` en een echte database + ALLOWED_HOSTS.
