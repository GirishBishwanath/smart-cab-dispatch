# Architecture

## Overview

Smart Cab Dispatch is a monorepo containing one backend service and four
independent frontend applications. There is no shared frontend package —
each app is a standalone Vite project with its own dependencies, build,
and deployment, connected only through the REST API and Socket.IO layer
exposed by the backend.

```
smart-cab-dispatch/
├── backend/          Node.js + Express + MongoDB + Socket.IO
├── landing/           Public marketing site, links out to the three portals
├── guest-portal/      Guest-facing app: request rides, track trips
├── driver-portal/      Driver-facing app: accept/run assigned rides
├── admin-portal/     Operations dashboard: approve, assign, oversee
└── docs/              This documentation
```

Each frontend is deployed as its own Vercel project with the repo's
subfolder set as the project's Root Directory. The backend is deployed
separately on Render. See `Deployment.md` for the full setup.

## Why four separate frontends instead of one app with roles

Guest, driver, and admin workflows don't overlap much in practice — a
guest never needs a driver's ride-acceptance UI, and an admin's fleet
dashboard has nothing in common with a guest's booking flow. Splitting
them into separate apps means:

- Each app only ships the code and dependencies it actually needs
  (e.g. `leaflet`/`react-leaflet` for map views only exist in
  `guest-portal` and `admin-portal`, not `driver-portal`)
- Each can be deployed, scaled, and iterated on independently
- Role-based routing is enforced structurally (a guest physically cannot
  land on admin routes) rather than only through in-app permission checks

The cost is some duplication — auth screens, API client setup, and UI
primitives are re-implemented per app rather than shared through a
package — a deliberate tradeoff for this project's scope.

## Backend layout

```
backend/src/
├── app.js               Express app, CORS, route mounting
├── server.js             Entry point: connects DB, starts HTTP + Socket.IO
├── config/
│   ├── db.js              Mongoose connection
│   ├── env.js              Environment variables, ALLOWED_ORIGINS
│   └── socket.js           Socket.IO server setup + JWT socket auth
├── models/                Mongoose schemas (User, Guest, Driver, Vehicle,
│                           RideRequest, Ride)
├── controllers/           Request handlers, one per resource
├── services/               Business logic, separated from controllers:
│   ├── auth.service.js      Login, signup, Google OAuth verification
│   ├── dispatch.service.js  Driver matching + assignment (see below)
│   ├── ride.service.js       Ride lifecycle transitions
│   ├── rideRequest.service.js  Request approval/decline/cancel
│   ├── driver.service.js, guest.service.js
│   ├── socket.service.js    Typed wrappers around raw socket emits
│   ├── matching.service.js, eta.service.js, map.service.js,
│   │   queue.service.js, notification.service.js
├── routes/                 Express routers, one per resource
├── middleware/              auth (JWT), role (RBAC), validation, errors
├── sockets/socket.js        setupSocket() + emitToUser() helper
├── dto/user.dto.js          Strips password/internal fields from User
└── scripts/                 Database seed scripts (users, drivers,
                              guests, rides)
```

## Data model

Six core collections:

- **User** — auth identity (email/password or Google), holds `role`
  (`ADMIN` / `DRIVER` / `GUEST`)
- **Guest** — profile data linked 1:1 to a `User` with role `GUEST`
- **Driver** — linked 1:1 to a `User` with role `DRIVER`; tracks
  `status` (`AVAILABLE` / `ASSIGNED` / `ON_BREAK` / `OFFLINE`),
  `currentLocation`, and `currentRide`
- **Vehicle** — linked 1:1 to a `Driver`; holds seat and luggage capacity
- **RideRequest** — what a guest submits; goes through
  `PENDING → APPROVED/REJECTED → (ride created)`
- **Ride** — created once a request is approved and a driver is matched;
  tracks the full trip lifecycle independently of the originating request

A `RideRequest` and its resulting `Ride` are separate documents on
purpose — a request can be rejected or cancelled before ever becoming a
ride, and a ride's own lifecycle (assigned → arrived → picked up →
completed, or driver-declined / guest-cancelled / admin-cancelled) is
richer than the request's approval lifecycle. Keeping them separate
means the cancellation/rejection *source* is never lost or collapsed
into a single generic status.

## The dispatch engine

`dispatch.service.js` implements the core matching logic:

1. Query all drivers where `status = AVAILABLE`, `currentRide = null`,
   and not currently on an active break (`breakUntil` is null or in the
   past)
2. For each candidate driver, look up their active `Vehicle` and check
   whether its `seatCapacity` and `luggageCapacity` satisfy the ride
   request's `groupSize` and `luggageCount`
3. Assign the first driver whose vehicle satisfies both constraints,
   create the `Ride` document, flip the driver to `ASSIGNED`, and attach
   `currentRide`
4. Emit `ride:assigned` and `driver:status` to the assigned driver over
   their private socket room

This is a synchronous, first-fit match — not a queue or an
optimization-based assignment (no distance/ETA weighting yet). It runs
inline when a request is approved, not on a background schedule.

## Real-time layer

Socket.IO runs on the same HTTP server as the REST API
(`server.js` creates one `http.Server`, passes it to both Express and
`setupSocket()`).

**Authentication**: sockets authenticate with the same JWT used for
REST calls, passed via `socket.handshake.auth.token`. The connection is
rejected at the `io.use()` middleware step if the token is missing,
invalid, or belongs to a deactivated user.

**Rooms**: every authenticated socket joins a private room,
`user:<userId>`. Drivers additionally join `driver:<userId>`. All
server-to-client events are targeted emits to a specific user's room
via `emitToUser()` — there's no broadcast channel; nothing is pushed to
users who aren't a party to that ride.

**Events emitted** (`socket.service.js`):

| Event | Fired when |
|---|---|
| `ride:assigned` | A driver is matched to a ride |
| `ride:accepted` | A driver acknowledges an assigned ride |
| `ride:status` | Any ride status transition (arrived, picked up, etc.) |
| `ride:completed` | A ride is marked completed |
| `driver:status` | A driver's own status changes |

**Current consumer**: `driver-portal` is the only frontend with a live
socket connection wired up (`driver-portal/src/socket.js`, connecting
via `VITE_SOCKET_URL`). `guest-portal` and `admin-portal` list
`socket.io-client` as a dependency but currently read ride state via
REST fetches rather than a live connection — the socket event surface
above is already built to support them, wiring those two up is the
natural next step.

## Authentication & authorization

- Passwords hashed with `bcrypt`; JWTs issued on login/signup, 7-day
  expiry (`JWT_EXPIRES_IN`)
- Google Sign-In (guest-portal only): frontend gets a credential from
  Google Identity Services, backend verifies it server-side against
  `GOOGLE_CLIENT_ID` via `google-auth-library`'s `OAuth2Client`, then
  issues the same JWT format as password login — Google auth doesn't
  bypass the app's own token system
- `authenticate` middleware verifies the JWT and attaches a stripped
  `req.user` (via `user.dto.js`, no password/`__v`)
- `authorize(...roles)` middleware is a simple role allow-list, applied
  per-route (e.g. `authorize(ROLES.ADMIN)`, or
  `authorize(ROLES.ADMIN, ROLES.DRIVER)` where a route is shared)
- The same JWT is reused for Socket.IO's own handshake auth, so REST
  and real-time auth never drift out of sync

## Frontend structure (per portal)

All three role portals (`guest`, `driver`, `admin`) and `landing` follow
the same internal convention:

```
src/
├── main.jsx, App.jsx        Entry + top-level providers/router
├── routes/AppRoutes.jsx      Route table
├── layouts/                   Shared chrome (nav/sidebar + outlet)
├── pages/                     One file per route
├── components/                 Reusable UI, grouped by feature/domain
├── contexts/ (role portals)    AuthContext for session state
├── services/api.js (role portals)  Axios instance, VITE_API_URL-based
└── utils/constants.js          Routes, role labels, cross-portal URLs
```

`landing` has no auth context or API client — it's a static marketing
site whose only "backend" interaction is linking out to the three
portal URLs, configured via `VITE_GUEST_PORTAL_URL`,
`VITE_DRIVER_PORTAL_URL`, `VITE_ADMIN_PORTAL_URL`. Each portal in turn
links back to `landing` via `VITE_LANDING_URL`.
