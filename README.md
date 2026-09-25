<div align="center">

# Smart Cab Dispatch

**Real-time ride dispatch, live driver tracking, and road-aware routing across connected Guest, Driver, and Admin portals.**

[![CI](https://github.com/GirishBishwanath/smart-cab-dispatch/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/GirishBishwanath/smart-cab-dispatch/actions/workflows/ci.yml)

[Live Landing Page](https://smart-cab-dispatch.vercel.app/) · [Guest Portal](https://smart-cab-dispatch-guest.vercel.app/) · [Driver Portal](https://smart-cab-dispatch-driver.vercel.app/) · [Admin Portal](https://smart-cab-dispatch-admin.vercel.app/) · [GitHub Repository](https://github.com/GirishBishwanath/smart-cab-dispatch)

</div>

---

## Overview

Smart Cab Dispatch is a full-stack transportation and fleet dispatch platform designed for hotel, airport, and event operations.

The platform covers the complete ride workflow:

1. A guest selects pickup and destination locations on a map and creates a ride request.
2. An admin reviews and approves the request.
3. The dispatch service finds an eligible driver and vehicle using proximity, passenger capacity, and luggage capacity.
4. The assigned driver receives the ride through the real-time layer.
5. The driver accepts the ride, arrives, picks up the guest, and completes the trip.
6. Authorized Guest and Admin clients receive live ride status, driver location, route, and ETA updates.

The repository is a monorepo containing one Node.js backend and four independently deployed frontend applications:

- Public Landing
- Guest Portal
- Driver Portal
- Admin Portal

## Live Applications

| Application | Purpose | URL |
|---|---|---|
| Landing | Public product website and portal entry point | [Open](https://smart-cab-dispatch.vercel.app/) |
| Guest Portal | Booking, active ride tracking, profile, and history | [Open](https://smart-cab-dispatch-guest.vercel.app/) |
| Driver Portal | Assigned rides, trip lifecycle, live location, and history | [Open](https://smart-cab-dispatch-driver.vercel.app/) |
| Admin Portal | Dispatch, fleet, guest, driver, and ride operations | [Open](https://smart-cab-dispatch-admin.vercel.app/) |
| Backend API | REST API and Socket.IO server | [Open](https://smart-cab-backend-jcfm.onrender.com/) |

## Core Features

### Map-based booking

Guests select pickup and destination locations using Leaflet and OpenStreetMap. The backend stores validated coordinates and ride details as a separate RideRequest before assignment.

### Capacity and proximity-aware dispatch

The dispatch engine:

- Finds available drivers without an active ride or break
- Ranks candidates by geographic distance using the Haversine formula
- Checks passenger capacity
- Checks luggage capacity
- Revalidates driver and vehicle eligibility during assignment
- Creates the Ride and links it to the selected driver transactionally

### Real-time driver tracking

Driver browsers connect through authenticated Socket.IO sessions.

Location updates are validated against:

- Authenticated driver identity
- Active ride ownership
- Coordinate validity
- Client timestamp ordering
- Stale or future-dated updates

Accepted locations are persisted before being broadcast to authorized clients.

### Road-aware routing and ETA

OSRM is used through a backend routing service to provide:

- Driving route geometry
- Road distance
- Route duration
- ETA information for active trips

The frontend renders the route and live driver position using Leaflet.

### Complete ride lifecycle

The platform models ride requests separately from assigned rides and supports:

`PENDING → ASSIGNED → ARRIVED → PICKED_UP → COMPLETED`

with cancellation and driver-decline paths handled separately.

### Authentication and authorization

- JWT authentication for REST APIs
- JWT authentication for Socket.IO handshakes
- Google Sign-In verification through Google Identity Services
- bcrypt password hashing
- Guest, Driver, and Admin role-based authorization
- Passwords excluded from authenticated user responses
- Local account passwords require at least 8 characters

## Architecture

The backend follows a layered architecture:

```text
Frontend Applications
        ↓
REST API + Socket.IO
        ↓
Express / Node.js
        ↓
Controllers
        ↓
Services
        ↓
MongoDB / External Services
```

Core backend services include:

- Authentication
- Guest management
- Driver and vehicle management
- Ride requests
- Ride lifecycle
- Driver dispatch
- Routing
- Socket event delivery

MongoDB remains the durable source of truth for driver assignment and ride state.

### Concurrency and reliability

Driver assignment and ride lifecycle operations use MongoDB transactions and conditional updates to protect against concurrent state changes.

The backend also includes:

- Unique ride-request constraint
- Duplicate assignment protection
- Optimistic concurrency handling
- Driver ownership checks
- Atomic driver release
- Driver location freshness tracking
- Stale location update rejection
- OSRM timeout and fallback handling

### Real-time flow

```text
Driver browser
      ↓
Authenticated Socket.IO connection
      ↓
Validate driver + active ride
      ↓
Persist accepted location
      ↓
Emit to authorized rooms
      ↓
Guest / Admin live maps
```

## Technology Stack

### Frontend

- React 19
- Vite
- Tailwind CSS v4
- React Router
- Axios
- Socket.IO Client
- Leaflet
- React-Leaflet

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- Socket.IO
- JWT
- bcrypt
- Google Identity Services

### Maps and Routing

- Leaflet
- OpenStreetMap
- OSRM

### Testing and Engineering

- Vitest
- MongoDB replica-set integration testing
- GitHub Actions
- Docker
- Node.js 22 CI runtime

### Deployment

- Vercel
- Render
- MongoDB Atlas

## Testing and Quality

The repository includes deterministic backend tests and integration coverage for critical application behavior.

CI validates:

- Dependency installation with `npm ci`
- Frontend linting
- Frontend production builds
- Backend syntax
- Backend automated tests
- Backend production dependency audit
- MongoDB replica-set integration tests
- Backend Docker image builds

The integration test environment uses a real MongoDB replica set to validate concurrency-sensitive driver assignment behavior rather than relying only on mocks.

## Security and Operational Hardening

The backend includes lightweight production-oriented safeguards:

- CORS origin allow-listing
- JWT authentication and role authorization
- Password hashing with bcrypt
- Sensitive-field redaction in structured logs
- Request correlation through `X-Request-ID`
- Normalized request-path logging without query parameters
- 1 MB JSON request-body limit
- Baseline security response headers
- `X-Powered-By` removal
- Generic production error responses
- Liveness and readiness health endpoints
- Graceful SIGTERM and SIGINT shutdown
- OSRM timeout and failure handling

## Deployment Architecture

```text
                 ┌─────────────────────┐
                 │ Landing / Vercel    │
                 └──────────┬──────────┘
                            │
       ┌────────────────────┼────────────────────┐
       ↓                    ↓                    ↓
 Guest / Vercel       Driver / Vercel      Admin / Vercel
       └────────────────────┼────────────────────┘
                            ↓
                 ┌─────────────────────┐
                 │ Backend / Render    │
                 │ Express + Socket.IO │
                 └──────────┬──────────┘
                            ↓
                    ┌───────────────┐
                    │ MongoDB Atlas │
                    └───────────────┘
                            +
                           OSRM
```

The backend also has a production Dockerfile used for reproducible runtime validation and CI image builds. The current Render deployment uses the native Node.js runtime because it matches the application's operational requirements without unnecessary infrastructure migration.

See [docs/Deployment.md](docs/Deployment.md) for deployment configuration, environment variables, CORS, OAuth, MongoDB requirements, and the production smoke-test flow.

## Repository Structure

```text
smart-cab-dispatch/
├── backend/          Express API, services, models, Socket.IO
├── landing/          Public marketing application
├── guest-portal/     Guest application
├── driver-portal/    Driver application
├── admin-portal/     Operations application
└── docs/             Architecture, API, deployment, system design
```

## Documentation

- [Architecture](docs/Architecture.md)
- [API Reference](docs/API.md)
- [Deployment](docs/Deployment.md)
- [System Design](docs/SystemDesign.md)

## Engineering Decisions

### Why MongoDB?

The operational data model consists of users, guests, drivers, vehicles, ride requests, and rides with straightforward document relationships. MongoDB fits the current operational workload while supporting the transactions required for assignment and lifecycle consistency.

### Why Socket.IO?

Ride status and driver location are time-sensitive. Socket.IO provides authenticated, targeted real-time communication without requiring continuous polling.

### Why OSRM?

The application needs road-aware geometry, distance, and duration rather than straight-line distance. OSRM provides these capabilities behind a backend routing abstraction.

### Why separate frontends?

Guest, Driver, and Admin workflows have different navigation, permissions, and operational concerns. Separate Vite applications keep each portal focused while sharing the same backend API and real-time layer.

## Scalability Direction

The current architecture is intentionally sized for a small operational deployment. The repository documents concrete scale-up paths rather than introducing infrastructure before it is needed.

Potential future steps include:

- MongoDB geospatial indexes for larger driver pools
- Redis for shared Socket.IO coordination or caching when multiple backend instances are required
- BullMQ and workers for asynchronous workloads
- A centralized observability platform when log retention, metrics, tracing, or alerting requirements justify it
- A traffic-aware routing provider when ETA requirements move beyond OSRM's capabilities
- Kafka only if the system grows into a multi-service architecture requiring durable distributed event streams

Redis, Kafka, Kubernetes, microservices, and infrastructure migration are intentionally not part of the current implementation.

## License

MIT. See [LICENCE](LICENCE).

---

<div align="center">

Built end-to-end by **Girish Bishwanath**

</div>
