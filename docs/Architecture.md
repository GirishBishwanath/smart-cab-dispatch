# Architecture

## Overview

Smart Cab Dispatch is a monorepo containing one backend service and four independent frontend applications: a public landing page plus Guest, Driver, and Admin portals.

```text
smart-cab-dispatch/
├── backend/          Node.js + Express + MongoDB + Socket.IO
├── landing/          Public marketing site
├── guest-portal/     Guest ride booking and tracking
├── driver-portal/    Driver trip management and live location
├── admin-portal/     Dispatch and fleet operations
└── docs/             Engineering documentation
```

The frontends are independently deployable Vite applications. They communicate with the backend through REST APIs and Socket.IO. The backend is deployed separately from the Vercel frontends.

## Why separate frontends

Guest, Driver, and Admin have substantially different workflows, navigation, permissions, and operational concerns. Separate applications keep each deployment focused on its role and prevent unrelated portal code from being shipped together.

The trade-off is some duplicated authentication, API-client, and UI setup. For the current project scope, that simplicity is preferred over introducing a shared package or monorepo build system.

## Backend layout

```text
backend/src/
├── app.js
├── server.js
├── config/
│   ├── db.js
│   ├── env.js
│   └── socket.js
├── models/
├── controllers/
├── services/
│   ├── auth.service.js
│   ├── dispatch.service.js
│   ├── driver.service.js
│   ├── guest.service.js
│   ├── ride.service.js
│   ├── rideRequest.service.js
│   ├── routing.service.js
│   └── socket.service.js
├── routes/
├── middleware/
├── dto/
├── scripts/
└── utils/
```

Controllers handle HTTP concerns while services contain business logic. Models define the MongoDB data model. Middleware handles authentication, authorization, validation, and errors. `config/socket.js` owns the Socket.IO server and authentication layer, while `socket.service.js` exposes application-level event helpers.

## Data model

The operational model is split across six core collections:

- **User** — authentication identity and role.
- **Guest** — guest profile linked to a User.
- **Driver** — driver profile, availability, current location, and current ride.
- **Vehicle** — active vehicle and seat/luggage capacity linked to a Driver.
- **RideRequest** — the guest's requested trip before assignment.
- **Ride** — the actual assigned trip and its lifecycle.

`RideRequest` and `Ride` are intentionally separate. A request can be rejected or cancelled before assignment, while an assigned ride has its own driver, vehicle, route, status, and lifecycle timestamps.

## Dispatch engine

`dispatch.service.js` performs the current assignment flow:

```text
Available drivers
      ↓
Filter active breaks / current rides
      ↓
Rank by distance to pickup
      ↓
Check vehicle seat capacity
      ↓
Check vehicle luggage capacity
      ↓
Select nearest eligible driver
      ↓
Create Ride + assign driver
      ↓
Emit assignment/status events
```

Driver proximity is calculated with the Haversine formula. This keeps matching independent from the external routing provider: OSRM is used for road-aware route information, while the dispatch ranking only needs geographic proximity.

The matching operation is currently synchronous and loads the available driver candidates into the Node process. That is appropriate for the current project scale. At larger scale, a MongoDB `2dsphere` index and a geospatial candidate query would reduce the amount of data loaded and sorted in application memory.

## Routing architecture

Routing is isolated in `services/routing.service.js`.

```text
Frontend
   ↓
GET /rides/:id/route
   ↓
Ride access validation
   ↓
routing.service.js
   ↓
OSRM driving route
   ↓
GeoJSON road geometry + distance + duration
   ↓
Leaflet map
```

The backend, rather than the browser, calls OSRM. The service converts OSRM's `[longitude, latitude]` geometry into the `[latitude, longitude]` format consumed by Leaflet.

Initial pickup-to-destination distance and duration are also calculated when a ride is created. Active-trip maps can request a route from the driver's current position to the current target, allowing the displayed route and ETA to update as the driver moves.

## Real-time layer

Socket.IO runs on the same HTTP server as Express.

### Authentication

Sockets authenticate using the same JWT issued by the REST authentication flow through `socket.handshake.auth.token`. Invalid, missing, or inactive-user tokens are rejected during the Socket.IO middleware stage.

### Rooms

Authenticated users join a private `user:<userId>` room. Drivers additionally join a `driver:<userId>` room, while administrators join the admin room used for operational location updates.

### Driver location flow

```text
Driver browser
    ↓
driver:location
    ↓
Socket authentication + payload validation
    ↓
Verify driver owns the active ride
    ↓
Persist Driver.currentLocation
    ↓
Send location to authorized ride participants
    ↓
Guest / Admin live map
```

Location updates are only forwarded for active ride states where tracking is meaningful. This prevents a completed or cancelled ride from continuing to appear as a live trip.

### Application events

| Event | Purpose |
|---|---|
| `socket:connected` | Confirms successful socket authentication |
| `ride:assigned` | Delivers a new driver assignment |
| `ride:accepted` | Signals driver acknowledgement |
| `ride:status` | Propagates ride lifecycle changes |
| `ride:completed` | Signals trip completion |
| `driver:status` | Propagates driver availability changes |
| `driver:location` | Streams authorized live driver location |

## Authentication and authorization

- Password authentication uses bcrypt password hashes.
- JWTs are used for REST authentication and Socket.IO handshake authentication.
- Google Sign-In is verified server-side against the configured Google client ID before the application issues its own JWT.
- Role-based middleware restricts Guest, Driver, and Admin endpoints.
- User DTOs prevent password/internal fields from being returned in authenticated responses.

## Frontend architecture

Each application follows a small feature-oriented structure:

```text
src/
├── components/
├── contexts/       # role portals
├── layouts/
├── pages/
├── routes/
├── services/
├── utils/
├── App.jsx
└── main.jsx
```

The role portals use an Axios API client configured from Vite environment variables. Live-tracking views use Socket.IO and Leaflet/React-Leaflet where required. The landing application is intentionally independent of authentication and focuses on navigation into the three operational portals.

## Deployment architecture

```text
                    ┌──────────────────┐
                    │  Landing / Vercel│
                    └────────┬─────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ↓                    ↓                    ↓
 Guest / Vercel       Driver / Vercel      Admin / Vercel
        └────────────────────┼────────────────────┘
                             ↓
                 ┌─────────────────────┐
                 │ Backend / Render    │
                 │ Express + Socket.IO│
                 └──────┬────────┬─────┘
                        ↓        ↓
                  MongoDB      OSRM
                    Atlas
```

See `Deployment.md` for the production configuration.
