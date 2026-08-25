<div align="center">

# Smart Cab Dispatch

**A real-time cab dispatch platform — three role-based portals, one live dispatch engine.**

Built end-to-end: backend, database design, real-time layer, and four independent frontends.

[Live Landing Page](https://smart-cab-dispatch.vercel.app) · [Guest Portal](https://smart-cab-dispatch-guest.vercel.app) · [Driver Portal](https://smart-cab-dispatch-driver.vercel.app) · [Admin Portal](https://smart-cab-dispatch-admin.vercel.app)

</div>

---

## What this is

Smart Cab Dispatch is a full-stack ride-dispatch system modeled on how a
hotel, airport, or event actually runs guest transportation — not a
toy CRUD app. A guest requests a ride, an admin approves it, a
dispatch engine matches an available driver whose vehicle can actually
fit the group and their luggage, and the ride's status streams live
across every portal involved, from assignment through pickup to
drop-off.

It's a monorepo with **one backend** and **four independent frontends**
— a public landing page and three purpose-built portals (Guest,
Driver, Admin) — each deployed separately, each shipping only the code
its role actually needs.

## Why this project

Most portfolio dispatch/booking clones stop at "guest books, admin
sees it in a table." This one models the parts that are actually hard:

- **A real matching engine** — driver availability, seat capacity, and
  luggage capacity are checked before a match is made, not just "first
  free driver"
- **A real-time layer, not polling** — Socket.IO, authenticated with
  the same JWT as the REST API, pushing per-user targeted events
  (nothing broadcast to users who aren't party to that ride)
- **A lifecycle that doesn't lose information** — a rejected request,
  a driver decline, a guest cancellation, and an admin cancellation
  are four different, explicitly tracked outcomes, not one generic
  "cancelled" bucket
- **Real deployment, not just `localhost`** — four separate Vercel
  projects and a Render backend, wired together through environment
  variables, with the CORS/OAuth/DNS issues that come with an actual
  multi-origin production setup solved and documented, not glossed over

## The three portals

| Portal | Who it's for | What they do |
|---|---|---|
| **Guest** | The rider | Request a ride, sign in with email or Google, track the assigned driver live, view ride history |
| **Driver** | The person driving | See assigned rides, accept/decline, mark arrived/started/completed, view ride history |
| **Admin** | Operations/dispatch | Approve or reject ride requests, oversee every driver and guest, watch the whole fleet's live status, analytics |

Each is its own deployed app — a guest can't navigate into driver
routes because they don't exist in that build, not just because
they're hidden.

## Core ride lifecycle

```
Guest submits request  →  PENDING
Admin approves          →  dispatch engine runs, driver matched  →  ASSIGNED
Driver accepts          →  acceptedAt set
Driver arrives          →  ARRIVED
Driver starts trip      →  PICKED_UP
Driver completes        →  COMPLETED
```

At any point before completion, a request/ride can end via rejection
(admin), decline (driver), or cancellation (guest or admin) —
each recorded with its own source and reason, never collapsed into a
single status.

## Tech stack

**Backend**
Node.js · Express · MongoDB / Mongoose · Socket.IO · JWT · bcrypt ·
Google Identity Services (`google-auth-library`)

**Frontend** (×4 — landing, guest, driver, admin)
React 19 · Vite · Tailwind CSS v4 · React Router · Axios ·
Socket.IO client · Leaflet / React-Leaflet (map views in guest & admin)

**Infrastructure**
MongoDB Atlas · Render (backend) · Vercel (four independent frontend
projects, one repo, split by Root Directory)

## Repository structure

```
smart-cab-dispatch/
├── backend/          Express API + Socket.IO server
├── landing/           Public marketing site
├── guest-portal/      Guest-facing app
├── driver-portal/      Driver-facing app
├── admin-portal/     Operations dashboard
└── docs/              Architecture, API reference, deployment notes
```

Full breakdown of the backend's internal structure, the data model,
and the dispatch engine's matching logic: **[`docs/Architecture.md`](docs/Architecture.md)**.

## Getting started locally

### Prerequisites
Node.js 18+, a MongoDB connection string (local or Atlas), a Google
OAuth Client ID (only required for the guest portal's Google sign-in).

### 1. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=5000
MONGO_URI=<your MongoDB connection string>
JWT_SECRET=<any long random string>
GOOGLE_CLIENT_ID=<your Google OAuth client ID>
```

```bash
npm run seed   # optional — populates sample users/drivers/guests/rides
npm run dev    # runs on http://localhost:5000
```

### 2. Frontends

Each portal is a separate app with its own dev server and a locked
port (`landing` 5176, `guest-portal` 5173, `driver-portal` 5174,
`admin-portal` 5175), so all four can run side by side.

```bash
cd guest-portal   # or driver-portal / admin-portal / landing
npm install
```

Create a `.env` in that folder (see `docs/Deployment.md` for the full
per-app variable list — at minimum, each role portal needs
`VITE_API_URL=http://localhost:5000/api`).

```bash
npm run dev
```

Repeat for the other three apps, then open `landing`'s dev URL — it
links out to whichever portal URLs you've configured.

## API reference

Every route, its required role, and request/response shapes:
**[`docs/API.md`](docs/API.md)**.

## Deployment

Full production setup — Vercel per-frontend configuration, Render
backend setup, the CORS-has-two-configs gotcha (REST vs Socket.IO),
Google OAuth origin registration, and the deployment order that avoids
chicken-and-egg env var problems: **[`docs/Deployment.md`](docs/Deployment.md)**.

## What's next

- Wire the guest and admin portals onto the live Socket.IO connection
  (currently only the driver portal consumes it — guest/admin read
  ride state via REST)
- Distance/ETA-aware driver matching, instead of first-fit
- A standalone `/api/vehicles` management endpoint (currently vehicles
  are only created as a side effect of driver creation)

## License

MIT — see [`LICENCE`](LICENCE).

---

<div align="center">

Built solo, front to back, by **Girish**.

</div>
