# System Design

This document describes the architecture that is actually implemented today and the engineering changes that would be appropriate as the system grows. Implemented capabilities and future-scale decisions are intentionally separated.

## Current system

```text
Guest / Driver / Admin
          ↓
     Vercel Frontends
          ↓
   REST API + Socket.IO
          ↓
   Express / Node.js
      ↙          ↘
 MongoDB         OSRM
```

The application currently runs as one backend service with MongoDB as the operational datastore and Socket.IO for authenticated real-time communication.

## Dispatch design

The current dispatch algorithm is proximity-aware and capacity-aware:

```text
1. Find AVAILABLE drivers with no current ride and no active break
2. Calculate geographic distance from each driver to the pickup point
3. Sort candidates by ascending distance
4. Check each driver's active vehicle
5. Require sufficient seat capacity and luggage capacity
6. Assign the nearest eligible driver
```

The proximity calculation uses the Haversine formula. OSRM is deliberately not called for every candidate because dispatch ranking only needs geographic proximity; using road routing for every candidate would add external requests and latency without being necessary for the basic ranking decision.

The initial ride route is calculated separately through the routing service after a suitable driver/vehicle has been selected.

### Current limitation

Available drivers are currently queried into the Node.js process and sorted in memory. That is reasonable for a small fleet, but the cost grows with the number of available drivers.

### Scale-up path

For a larger fleet, add a MongoDB `2dsphere` index and use a geospatial query to return nearby candidates before application-level capacity filtering. If matching becomes computationally expensive or approval volume becomes high, move dispatch execution to an asynchronous worker.

## Real-time architecture

The backend uses authenticated Socket.IO connections and user-specific rooms.

```text
Driver location
      ↓
Socket.IO server
      ↓
Validate authenticated driver + active ride
      ↓
Persist currentLocation
      ↓
Emit to authorized user/admin rooms
      ↓
Live map clients
```

This is currently a single backend instance. Socket.IO connection and room state therefore live in process memory.

### Horizontal scaling

If multiple backend instances are introduced behind a load balancer, a client connected to instance A must still receive an event emitted by instance B. The natural next step is the Socket.IO Redis adapter, which provides cross-instance pub/sub while preserving the existing room-based event model.

## Routing and ETA

OSRM is used for road-aware driving routes rather than straight-line geometry.

```text
Driver position + current target
              ↓
       Backend route endpoint
              ↓
       routing.service.js
              ↓
              OSRM
              ↓
     geometry + distance + duration
              ↓
          Leaflet map
```

The configurable `OSRM_ETA_FACTOR` allows the application to make the raw routing duration more conservative for a practical ETA. This is a product-level approximation, not a claim of live traffic prediction. A future traffic-aware routing provider could replace or supplement OSRM behind the same service boundary.

## Data consistency and race conditions

The current application performs driver selection and assignment within the same request flow. At small scale this is straightforward to reason about, but concurrent approvals could potentially attempt to select the same driver before each request has persisted its assignment.

A production-scale implementation should address this explicitly with an atomic reservation/conditional update, transaction strategy, or serialized dispatch worker. Adding a queue alone is not a substitute for correct database-level state transitions.

## Asynchronous work

The current dispatch flow is synchronous because its work is small enough for the present scale.

If notification, reporting, expensive routing, retries, or other asynchronous work grows, the architecture can evolve to:

```text
Ride event
    ↓
Queue
    ├── Notification worker
    ├── Audit/logging worker
    └── Analytics pipeline
```

Redis + BullMQ would be a lightweight fit for background jobs in this Node.js stack. Kafka is deliberately not required today: a single backend with no independent event consumers does not justify the operational complexity of a distributed event log.

## Caching

Redis is a potential optimization rather than a current dependency.

A useful first cache candidate is driver availability, but it must be invalidated or updated whenever driver status/current ride changes. The cache should not become the authoritative source of driver assignment state; MongoDB remains the source of truth.

For the current fleet size, adding Redis solely to cache a small MongoDB query would increase operational complexity without a measurable benefit. It becomes more defensible as request volume and fleet size grow.

## Event-driven architecture

The current application has typed Socket.IO event helpers, but the ride lifecycle is still primarily service-driven. A future internal domain-event layer could decouple business state changes from secondary effects:

```text
Ride status changed
        ↓
ride.status.changed
   ┌────┼─────┐
   ↓    ↓     ↓
Socket Audit Queue
```

Node's EventEmitter is sufficient for an in-process first step. Redis pub/sub or a durable broker becomes appropriate only when events need to cross process boundaries or support independent consumers.

## Database strategy

MongoDB is the correct operational datastore for the current application. The model consists mainly of shallow references between users, guests, drivers, vehicles, ride requests, and rides, and the current API does not depend on complex relational joins.

PostgreSQL should not replace MongoDB merely to add another technology. It becomes interesting for a future analytics/reporting workload involving relational reporting such as driver utilization, cancellation trends, revenue aggregation, or scheduled operational reports.

## Failure considerations

### OSRM unavailable

Route calculation can fail independently of ride creation. The application therefore treats route calculation as a separate operation and can fall back to persisted ride metrics where available. A larger deployment could add retry/backoff or a secondary routing provider.

### Socket disconnected

REST remains the source for durable ride state. A reconnecting client can fetch current state and then resume real-time updates rather than relying on every socket event being received.

### Driver location stale

A production version should track the timestamp of the last accepted location and display stale-location state rather than implying that an old coordinate is current.

## Scale evolution

| Concern | Current | Appropriate next step |
|---|---|---|
| Driver matching | Haversine-ranked + capacity checks | MongoDB geospatial index |
| Dispatch execution | Synchronous | Queue/worker when volume justifies it |
| Socket.IO | Single instance | Redis adapter for multiple instances |
| Availability reads | MongoDB | Redis only when measured useful |
| Background work | Inline | BullMQ/worker for asynchronous tasks |
| Domain events | Service-driven + socket events | Internal event bus, then distributed broker if needed |
| Analytics | Not implemented | Dedicated reporting model/store when required |
| Routing | OSRM | Traffic-aware provider/fallback at higher product requirements |

## Technology decisions

**MongoDB:** retained because it fits the operational data model.

**Socket.IO:** retained because ride status and location require low-latency bidirectional communication.

**OSRM:** retained behind a routing abstraction for road-aware geometry and distance.

**Redis:** not required at current scale; justified for shared Socket.IO state, caching, or queues when the system is scaled.

**Kafka:** intentionally not implemented. It would be justified when multiple independent services/consumers need durable event streams at significantly larger scale.

**AWS/Azure:** cloud migration is not a goal by itself. A cloud service should be introduced only when it solves a concrete requirement such as object storage, managed queues, observability, or infrastructure scaling.
