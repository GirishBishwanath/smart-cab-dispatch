# System Design Notes

This document covers how the current implementation actually behaves,
where it would break under real load, and what I'd change first —
written against the real `dispatch.service.js` and Socket.IO layer in
this repo, not a hypothetical system.

## Current dispatch algorithm, honestly

`dispatch.service.js` does a **synchronous, first-fit match**:

```
1. Query all Driver documents where status = AVAILABLE, currentRide = null
2. For each, in query order, check if their Vehicle's
   seatCapacity/luggageCapacity satisfy the request
3. Assign the first one that fits
```

This is correct for the demo's scale (a handful of drivers) and is
honest about what it is — it is **not** distance-aware, and it is
**not** load-balanced. Two problems this causes at real scale:

- **No distance weighting** — a driver 50km away can be matched ahead
  of one 500m away, if the 500m driver simply comes later in the
  MongoDB query's natural order
- **Uneven driver utilization** — the same "first available" driver
  in query order tends to get matched repeatedly if requests arrive
  close together, since there's no rotation

### What I'd change first

Replace step 2's linear scan with a distance-sorted candidate list —
compute haversine distance from each available driver's
`currentLocation` to the request's `pickupLocation`, sort ascending,
then apply the same capacity filter. This is a small, low-risk change
(pure function, no new infrastructure) that directly fixes the biggest
correctness gap, before reaching for anything heavier like a
geospatial index or an external routing service.

For real production scale (hundreds of concurrent requests), the next
step past that would be a MongoDB **geospatial index**
(`2dsphere` on `Driver.currentLocation`, converted to GeoJSON) so the
candidate query itself is proximity-filtered at the database level
instead of loading every available driver into memory and sorting in
Node.

## Where a message queue would go

Right now, `RideRequest` approval synchronously calls the dispatch
match inline, in the same request/response cycle as the admin's
"approve" click. That's fine at current volume. It stops being fine
once:

- Matching becomes expensive (distance queries against hundreds of
  drivers, or a call to an external routing API for ETA)
- Multiple admins can approve concurrently and race on the same
  driver pool

At that point, I'd move dispatch off the request thread: approval
publishes a `ride_request.approved` event onto a queue (Redis +
BullMQ is the lightest option that fits this stack; Kafka would only
be justified if there were multiple independent services consuming
the same event stream, which there aren't here — a single Node
backend has no legitimate multi-consumer need for a distributed log).
A worker process consumes the queue, runs the match, and pushes the
result back over Socket.IO. This also naturally solves the
concurrent-approval race, since the queue serializes matching.

## Socket.IO at more than one backend instance

The current Socket.IO server holds all connection state in-process
(`config/socket.js`, in-memory `io` instance, room membership tracked
by the Socket.IO server itself). This works as long as there's exactly
one backend process. The moment the backend is horizontally scaled
(two Render/EC2 instances behind a load balancer), it breaks silently:
a driver connected to instance A won't receive an event emitted by
instance B when a guest on instance B triggers a status change — each
instance only knows about its own local sockets.

The fix is the **Socket.IO Redis adapter**
(`@socket.io/redis-adapter`) — it makes `emitToUser()` broadcast
through Redis pub/sub instead of relying on in-process socket
references, so any instance can reach any connected client regardless
of which instance they're attached to. This is a drop-in addition to
`config/socket.js`, not a rewrite — the room/emit model
(`user:<userId>`) stays exactly the same.

## Caching

The dispatch engine's availability query
(`Driver.find({ status: AVAILABLE, currentRide: null })`) currently
re-hits MongoDB on every single approval. At low volume this is
irrelevant; at higher approval throughput, it's a repeated read of a
working set that changes relatively slowly (driver status changes far
less often than ride requests come in). A Redis cache of
"currently available driver IDs," invalidated on any driver status
change (via the same event that would drive the queue above), removes
that repeated read without adding staleness risk beyond a few hundred
milliseconds.

## Relational vs. document data here

The current schema (`User` → `Guest`/`Driver` → `Vehicle`,
`RideRequest`/`Ride`) is a reasonable fit for MongoDB as-is — the
relationships are shallow (mostly 1:1 or 1:many with a single level of
reference), and there's no deep multi-table join pattern that Mongo
handles poorly. I would **not** migrate this to a relational database
without a concrete reason.

Where a relational store *would* earn its place: a reporting/analytics
module doing aggregate queries across historical rides (revenue by
day, driver utilization over time, cancellation-rate trends) — that's
a genuinely relational access pattern (GROUP BY across many rows,
joins across drivers/vehicles/rides) that Postgres handles more
naturally than Mongo's aggregation pipeline. I'd add Postgres
alongside Mongo for that specific module, not replace the operational
data store that's already working.

## Summary of what's implemented vs. what's a stated tradeoff

| Concern | Current state | Next step if scaling |
|---|---|---|
| Driver matching | First-fit, capacity-checked | Distance-sorted, then geospatial index |
| Dispatch execution | Synchronous, inline on approval | Redis + BullMQ queue, worker-based |
| Real-time delivery | Single in-process Socket.IO instance | Redis adapter for multi-instance |
| Driver availability reads | Direct MongoDB query per match | Redis cache, invalidated on status change |
| Analytics/reporting | Not built | Postgres, added alongside Mongo, not replacing it |