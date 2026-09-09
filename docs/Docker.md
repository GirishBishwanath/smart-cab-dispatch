# Backend Docker Runtime

The backend is the only application containerized in Phase 2. Frontends remain on Vercel, MongoDB remains on MongoDB Atlas, and OSRM remains an external service.

## Build

```bash
docker build -t smart-cab-dispatch-backend ./backend
```

## Run

Provide the same runtime environment variables used by the native Render service. Do not bake secrets into the image.

```bash
docker run --rm \
  -p 5000:5000 \
  --env-file backend/.env \
  smart-cab-dispatch-backend
```

The container exposes port `5000` by default, but the application honors the `PORT` environment variable supplied by the runtime.

## Health

The image includes a Docker healthcheck against `GET /health`. A healthy response is:

```json
{"success":true,"status":"ok"}
```

The backend connects to MongoDB before it starts listening, so a runtime health test also depends on valid MongoDB connectivity and the required environment variables.