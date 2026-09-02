<div align="center">

# Smart Cab Dispatch

**Real-time ride dispatch, live driver tracking, and road-aware routing across three connected portals.**

[Live Landing Page](https://smart-cab-dispatch.vercel.app) · [Guest Portal](https://smart-cab-dispatch-guest.vercel.app) · [Driver Portal](https://smart-cab-dispatch-driver.vercel.app) · [Admin Portal](https://smart-cab-dispatch-admin.vercel.app)

</div>

---

## Overview

Smart Cab Dispatch is a full-stack transportation platform designed for hotel, airport, and event operations. Guests can create map-based ride requests, dispatchers approve and assign suitable vehicles, drivers manage the trip lifecycle, and authorized users can follow the driver's live location from the relevant portal.

The project is a monorepo with one Node.js backend and four independently deployed frontend applications: public landing, Guest, Driver, and Admin.

## What makes it different

- **Map-based booking** — guests select pickup and destination locations with Leaflet/OpenStreetMap.
- **Capacity-aware dispatch** — available drivers are checked against passenger and luggage requirements before assignment.
- **Proximity-aware matching** — eligible drivers are ranked by distance from the pickup point using geographic distance calculation.
- **Live driver tracking** — Socket.IO streams authenticated driver location updates to authorized ride participants and operations.
- **Road-aware routes** — OSRM provides actual driving geometry, road distance, and ETA instead of a straight-line estimate.
- **Complete ride lifecycle** — requests, assignment, acceptance, arrival, pickup, completion, and cancellation outcomes are tracked independently.
- **Production deployment** — the landing page and three portals run on Vercel, with the backend deployed on Render and connected to MongoDB Atlas.

## Portals

| Portal | Purpose |
|---|---|
| **Guest** | Create ride requests, choose pickup/destination on a map, follow active rides, and view history |
| **Driver** | View assignments, accept/decline rides, update trip status, share live location, and view history |
| **Admin** | Manage ride requests, drivers, guests, fleet activity, assignments, and live trips |

## Ride flow

```text
Guest creates request
        ↓
Admin reviews request
        ↓
Dispatch engine finds available driver + suitable vehicle
        ↓
Driver receives assignment in real time
        ↓
Driver accepts → arrives → picks up → completes
        ↓
Live status/location updates reach authorized clients
```

## Real-time location flow

```text
Driver device
    ↓
Socket.IO authenticated connection
    ↓
Backend validates driver + active ride
    ↓
Driver location is persisted
    ↓
Authorized guest/admin clients receive updates
    ↓
Live map updates marker + road route + ETA
```

## Routing flow

```text
Pickup / driver position
        ↓
Backend routing service
        ↓
OSRM driving route
        ↓
Road geometry + distance + duration
        ↓
Leaflet map + journey metrics
```

The backend keeps OSRM behind a dedicated routing service so mapping clients remain independent of the routing provider.

## Technology stack

**Frontend**  
React 19 · Vite · Tailwind CSS v4 · React Router · Axios · Socket.IO Client · Leaflet · React-Leaflet

**Backend**  
Node.js · Express · MongoDB · Mongoose · Socket.IO · JWT · bcrypt · Google Identity Services

**Routing & Maps**  
Leaflet · OpenStreetMap · OSRM

**Deployment**  
Vercel · Render · MongoDB Atlas

## Repository structure

```text
smart-cab-dispatch/
├── backend/          Express API, services, models, Socket.IO
├── landing/          Public marketing application
├── guest-portal/     Guest application
├── driver-portal/    Driver application
├── admin-portal/     Operations application
└── docs/             Architecture, API, deployment, system design
```

## Backend architecture

The backend follows a layered structure:

```text
Routes
  ↓
Controllers
  ↓
Services
  ↓
Models / External Services
```

Cross-cutting concerns such as JWT authentication, RBAC, validation, error handling, environment configuration, and Socket.IO authentication are separated into middleware/config modules.

Key services include authentication, ride requests, ride lifecycle, driver management, dispatch, routing, and socket event delivery.

See [docs/Architecture.md](docs/Architecture.md) for the detailed architecture and data model.

## Authentication & authorization

- JWT-based authentication for REST APIs
- Server-side Google Sign-In verification for guest authentication
- Role-based authorization for Guest, Driver, and Admin operations
- JWT authentication reused for Socket.IO handshakes
- Passwords stored using bcrypt hashes

See [docs/API.md](docs/API.md) for endpoint and authorization details.

## Local development

### Prerequisites

Node.js 18+ · MongoDB (local or Atlas) · Google OAuth Client ID for guest Google sign-in

### Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=<your MongoDB connection string>
JWT_SECRET=<your JWT secret>
GOOGLE_CLIENT_ID=<your Google OAuth client ID>
OSRM_BASE_URL=https://router.project-osrm.org
OSRM_ETA_FACTOR=1.4
```

```bash
npm run seed
npm run dev
```

### Frontends

Each application has its own `package.json` and can be run independently.

```bash
cd guest-portal
npm install
npm run dev
```

Use the corresponding portal directory for Driver, Admin, or Landing. Frontend environment variables are documented in [docs/Deployment.md](docs/Deployment.md).

## Production deployment

| Application | Platform | Production URL |
|---|---|---|
| Landing | Vercel | https://smart-cab-dispatch.vercel.app |
| Guest | Vercel | https://smart-cab-dispatch-guest.vercel.app |
| Driver | Vercel | https://smart-cab-dispatch-driver.vercel.app |
| Admin | Vercel | https://smart-cab-dispatch-admin.vercel.app |
| Backend | Render | https://smart-cab-backend-jcfm.onrender.com |

See [docs/Deployment.md](docs/Deployment.md) for environment variables, CORS, OAuth, and deployment configuration.

## Engineering decisions

### Why MongoDB?

The operational data model is document-oriented with shallow references between users, guests, drivers, vehicles, ride requests, and rides. MongoDB fits the current workload without introducing joins that the application does not need.

### Why OSRM?

The platform needs road-aware route geometry and distance rather than straight-line distance. OSRM provides that behind a small service abstraction, allowing the routing provider to be changed later without coupling the frontend to it.

### Why Socket.IO?

Ride status and driver location are time-sensitive and should not require repeated polling. Socket.IO provides authenticated, targeted real-time delivery while preserving a simple browser/server programming model.

### Why separate frontends?

Guest, Driver, and Admin workflows have different navigation, permissions, and UI concerns. Separate applications keep each deployment focused on the role it serves while sharing the same backend API and real-time layer.

## Scalability direction

The current implementation is intentionally sized for a small operational deployment. The repository documents how the architecture can evolve without prematurely adding infrastructure.

Potential scale-up steps include:

- MongoDB geospatial indexes for larger driver pools
- Redis for shared real-time coordination and targeted caching
- Redis + BullMQ for asynchronous dispatch/notification workloads
- Socket.IO Redis adapter when running multiple backend instances
- PostgreSQL only for a future reporting workload that benefits from relational analytics
- Kafka only when a larger system genuinely needs durable multi-consumer event streaming

See [docs/SystemDesign.md](docs/SystemDesign.md) for the trade-offs and failure modes behind these decisions.

## Documentation

- [Architecture](docs/Architecture.md)
- [API Reference](docs/API.md)
- [Deployment](docs/Deployment.md)
- [System Design](docs/SystemDesign.md)

## License

MIT — see [LICENCE](LICENCE).

---

<div align="center">

Built end-to-end by **Girish Bishwanath**.

</div>
