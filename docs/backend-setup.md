# FlowPilot Backend — Setup Guide (beginners ke liye)

Backend **poora ban chuka hai** — aapko koi code nahi likhna, sirf neeche ke commands chalane hain. Koi backend experience zaroori nahi, aur **sab kuch 100% free hai** (neeche table dekho).

---

## Backend kya hai, 30 second me

- **Database (PostgreSQL)** — sara data yahan store hota hai (users, workspaces, tasks…). Ye ek alag program hai jo aapke PC par Docker ke andar chalega.
- **Prisma** — TypeScript se database se baat karne ka tool. `prisma/schema.prisma` me tables ka design likha hai.
- **API routes** — `app/api/v1/...` ke andar. Frontend inhe call karta hai (jaise `POST /api/v1/auth/login`).
- **src/server/** — asli logic yahan hai, 4 layers me:
  - `validators/` → aane wala data sahi hai ya nahi (Zod)
  - `permissions/` → kaun kya kar sakta hai (Owner/Admin/Member/Guest)
  - `services/` → business rules (asli decisions yahan hote hain)
  - `repositories/` → database queries (sirf data, koi rules nahi)

Request ka safar: **API route → validator → permission check → service → repository → database**

---

## Sab FREE hai — pehle ye padho

| Cheez | Kya hai | Cost |
|-------|---------|------|
| Next.js, React, Prisma, Zod | Code libraries | ₹0 (open source) |
| PostgreSQL | Database | ₹0 (open source) |
| Neon | Cloud database hosting (Option A) | ₹0 (free plan kaafi hai) |
| Docker Desktop | Local database (Option B) | ₹0 (personal use free) |

Koi credit card nahi, koi trial nahi, kuch bhi expire nahi hota. 💯

---

## Step-by-step setup (one-time, ~10 minute)

### Step 0 — Node.js hai na?
Terminal me `node -v` chalao. Agar version dikhe (18+) to aage badho. Nahi dikhe to https://nodejs.org se LTS install karo (free).

### Step 1 — Database (2 options, dono free)

**Option A — Neon (RECOMMENDED — kuch install nahi karna) ✅**
1. https://neon.tech kholo → "Sign up" → Google se login (free, card nahi mangta)
2. "Create project" dabao → naam do `flowpilot` → Create
3. Jo **connection string** dikhe (`postgresql://...` se shuru hoti hai) use **copy** karo
4. Project folder me `.env` file kholo aur `DATABASE_URL="..."` wali line me apni copied string paste kar do

**Option B — Docker (offline kaam karna ho to)**
https://www.docker.com/products/docker-desktop install karo, open karo, phir Step 3 me `npm run db:up` chalana.

### Step 2 — dependencies install karo
Project folder me terminal kholo (VS Code me `` Ctrl+` ``):
```bash
npm install
```
(2-3 minute lagenge, internet se libraries download hongi)

### Step 3 — sirf Docker walo ke liye
```bash
npm run db:up
```
(Neon use kar rahe ho to ye step **skip** karo — database already cloud me chal raha hai)

### Step 4 — tables banao
```bash
npx prisma migrate dev --name init
```
Ye `schema.prisma` padh kar database me saare tables bana dega.

### Step 5 — (optional) performance indexes
```bash
npm run db:indexes
```

### Step 6 — demo data bharo
```bash
npm run db:seed
```
Isse milega: workspace **acme**, 4 users, 3 projects, 15 tasks.

### Step 7 — app chalao
```bash
npm run dev
```

Bas. Ab backend live hai `http://localhost:3000/api/v1/...` par.

---

## Test kaise kare (2 minute)

Browser me `http://localhost:3000/api/v1/auth/session` kholo → `{"data":{"user":null}}` dikhega. Backend zinda hai! 🎉

Login test (terminal me):
```bash
curl -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d "{\"email\":\"mara@acme.dev\",\"password\":\"demo1234\"}"
```

**Demo accounts** (password sabka `demo1234`):

| Email | Role |
|-------|------|
| mara@acme.dev | Owner |
| jonas@acme.dev | Admin |
| amara@acme.dev | Member |
| theo@acme.dev | Guest |

Data ko aankhon se dekhna ho to: `npm run db:studio` → browser me table editor khul jayega.

Aasan testing ke liye VS Code me **Thunder Client** extension install kar lo (Postman jaisa, free).

---

## API endpoints (quick reference)

| Kaam | Method + URL |
|------|--------------|
| Account banao | `POST /api/v1/auth/signup` `{name, email, password}` |
| Login | `POST /api/v1/auth/login` `{email, password}` |
| Logout | `POST /api/v1/auth/logout` |
| Session check | `GET /api/v1/auth/session` |
| Mere workspaces | `GET /api/v1/workspaces` |
| Workspace banao | `POST /api/v1/workspaces` `{name, slug}` |
| Workspace detail/update/delete | `GET/PATCH/DELETE /api/v1/workspaces/acme` |
| Members list / add | `GET/POST /api/v1/workspaces/acme/members` |
| Member role / remove | `PATCH/DELETE /api/v1/workspaces/acme/members/:userId` |
| Projects list / create | `GET/POST /api/v1/workspaces/acme/projects` |
| Project detail/update/delete | `GET/PATCH/DELETE /api/v1/projects/:id` |
| Tasks list / create | `GET/POST /api/v1/projects/:id/tasks` |
| Task detail/update/delete | `GET/PATCH/DELETE /api/v1/tasks/:id` (move = PATCH `{status, position}`) |
| Comments | `GET/POST /api/v1/tasks/:id/comments`, `PATCH/DELETE /api/v1/comments/:id` |
| Notifications | `GET /api/v1/notifications`, `POST /api/v1/notifications/read` |
| Activity feed | `GET /api/v1/workspaces/acme/activity` |

Response hamesha ek jaisa: success me `{"data": ...}`, error me `{"error": {"code", "message"}}`.

---

## Common problems

| Problem | Fix |
|---------|-----|
| `Can't reach database server` | Docker Desktop chalu hai? `npm run db:up` kiya? |
| `AUTH_SECRET missing` | `.env` file project root me honi chahiye (already bana di hai) |
| Port 5432 busy | Koi aur Postgres chal raha hai — usse band karo ya docker-compose.yml me port badlo |
| Migrate par red errors | `docker compose down -v` (data wipe) phir Step 4 se dobara |

## Aage kya (Phase 4 ideas)

1. Frontend ko in APIs se jodna (login/signup forms → `/api/v1/auth/...`)
2. Dashboard me asli projects/tasks dikhana
3. Attachments upload (S3/UploadThing) — schema ready hai
4. Details ke liye `docs/backend-architecture.md` padho — har decision wahan explain hai
