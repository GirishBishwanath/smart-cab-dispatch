# API Reference

Base URL (local): `http://localhost:5000/api`
Base URL (production): `https://smart-cab-backend-jcfm.onrender.com/api`

## Response format

Every endpoint returns the same envelope:

```json
{
  "success": true,
  "message": "Human-readable message",
  "data": {}
}
```

Errors follow the same shape with `"success": false` and no `data`:

```json
{
  "success": false,
  "message": "Access denied"
}
```

## Authentication

All routes except `POST /auth/login`, `POST /auth/signup`, and
`POST /auth/google` require a JWT, sent as:

```
Authorization: Bearer <token>
```

The token is returned by `login`, `signup`, and `google`, and is also
used, unmodified, as the Socket.IO handshake auth token
(`socket.handshake.auth.token`).

Routes marked **[Role]** are additionally gated by
`authorize(...roles)` — a request with a valid token but the wrong
role receives `403 Access denied`.

---

## Auth — `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/login` | — | Email/password login. Body: `{ email, password }` |
| POST | `/signup` | — | Guest self-signup. Creates a `User` + `Guest` |
| POST | `/google` | — | Google Sign-In. Body: `{ idToken }` — verified server-side against `GOOGLE_CLIENT_ID` |
| GET | `/me` | Bearer | Returns the current authenticated user |

`login`, `signup`, and `google` all return the same shape:
```json
{ "token": "<jwt>", "user": { "id", "fullName", "email", "role", "phone", "avatar", "isActive", "lastLogin", "createdAt" } }
```

---

## Admin — `/api/admin`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/dashboard` | Bearer, **[ADMIN]** | Aggregate counts for the admin dashboard (drivers, guests, ride requests, rides) |

---

## Drivers — `/api/drivers`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/me` | Bearer, **[DRIVER]** | The logged-in driver's own profile |
| POST | `/` | Bearer, **[ADMIN]** | Create a driver (+ linked `User`) |
| GET | `/` | Bearer, **[ADMIN]** | List all drivers |
| GET | `/:id` | Bearer, **[ADMIN]** | Get a single driver |
| PATCH | `/:id` | Bearer, **[ADMIN]** | Update a driver |
| PATCH | `/:id/status` | Bearer, **[ADMIN]** | Change a driver's status (`AVAILABLE`/`ON_BREAK`/`OFFLINE`/etc.) |
| DELETE | `/:id` | Bearer, **[ADMIN]** | Remove a driver |

---

## Guests — `/api/guests`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/me` | Bearer, **[GUEST]** | The logged-in guest's own profile |
| PATCH | `/me` | Bearer, **[GUEST]** | Update own profile |
| POST | `/` | Bearer, **[ADMIN]** | Create a guest |
| GET | `/` | Bearer, **[ADMIN]** | List all guests |
| GET | `/:id` | Bearer, **[ADMIN]** | Get a single guest |
| PATCH | `/:id` | Bearer, **[ADMIN]** | Update a guest |
| DELETE | `/:id` | Bearer, **[ADMIN]** | Remove a guest |

---

## Ride Requests — `/api/ride-requests`

The pre-assignment stage: what a guest submits before a `Ride` exists.

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | Bearer, **[ADMIN, GUEST]** | Create a ride request |
| GET | `/` | Bearer, **[ADMIN]** | List all ride requests |
| GET | `/mine` | Bearer, **[GUEST]** | The logged-in guest's own requests |
| PATCH | `/:id/approve` | Bearer, **[ADMIN]** | Approve → triggers dispatch (creates a `Ride`, assigns a driver) |
| PATCH | `/:id/decline` | Bearer, **[ADMIN]** | Reject with a reason |
| PATCH | `/:id/cancel` | Bearer, **[GUEST]** | Guest cancels their own pending request |

Request body (`POST /`):
```json
{
  "pickupLocation": { "name": "Hotel Taj", "latitude": 0, "longitude": 0 },
  "dropLocation": { "name": "Airport", "latitude": 0, "longitude": 0 },
  "groupSize": 3,
  "luggageCount": 2,
  "tripType": "ON_DEMAND"
}
```
`tripType` is one of `ARRIVAL`, `EVENT_PICKUP`, `EVENT_DROP`,
`DEPARTURE`, `ON_DEMAND`.

---

## Rides — `/api/rides`

The post-assignment stage: an actual trip with a driver and vehicle
attached, once a ride request is approved.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Bearer, **[ADMIN, DRIVER]** | List rides |
| GET | `/current` | Bearer, **[DRIVER]** | The driver's currently active ride |
| GET | `/history` | Bearer, **[DRIVER]** | The driver's completed/past rides |
| GET | `/guest/current` | Bearer, **[GUEST]** | The guest's currently active ride |
| GET | `/guest/history` | Bearer, **[GUEST]** | The guest's past rides |
| GET | `/:id` | Bearer, **[ADMIN, DRIVER]** | Get a single ride |
| PATCH | `/:id/acknowledge` | Bearer, **[DRIVER]** | Driver accepts an assigned ride |
| PATCH | `/:id/decline` | Bearer, **[DRIVER]** | Driver declines an assigned ride |
| PATCH | `/:id/cancel` | Bearer, **[GUEST]** | Guest cancels their ride |
| PATCH | `/:id/status` | Bearer, **[ADMIN, DRIVER]** | Advance ride status (arrived → picked up → completed) |

`status` values: `PENDING`, `ASSIGNED`, `ARRIVED`, `PICKED_UP`,
`COMPLETED`, `CANCELLED`. `cancelledBy` (when applicable) is one of
`GUEST`, `DRIVER`, `ADMIN` — the source of a cancellation is always
preserved, never collapsed into a generic "cancelled" state.

---

## Real-time events (Socket.IO)

Not REST, but part of the same API surface — see `Architecture.md` for
the full authentication and room model. Emitted server → client, one
per authenticated user's private room:

| Event | Payload | Fired when |
|---|---|---|
| `socket:connected` | `{ connected, userId }` | Immediately after a socket authenticates |
| `ride:assigned` | `{ ride }` | A driver is matched to a ride |
| `ride:accepted` | `{ ride }` | A driver acknowledges an assigned ride |
| `ride:status` | `{ ride }` | Any ride status transition |
| `ride:completed` | `{ ride }` | A ride is marked completed |
| `driver:status` | `{ driver }` | A driver's own status changes |

## Note on `/api/vehicles`

A `vehicle.routes.js` file exists in the repo but is currently empty
and not mounted in `app.js` — vehicles are created and managed as a
side effect of driver creation, not through a standalone endpoint yet.
