# Deployment

Smart Cab Dispatch is deployed as five independent applications from one GitHub repository.

## Production topology

| Application | Platform | Root Directory | Production URL |
|---|---|---|---|
| Backend | Render | `backend` | https://smart-cab-backend-jcfm.onrender.com |
| Landing | Vercel | `landing` | https://smart-cab-dispatch.vercel.app |
| Guest | Vercel | `guest-portal` | https://smart-cab-dispatch-guest.vercel.app |
| Driver | Vercel | `driver-portal` | https://smart-cab-dispatch-driver.vercel.app |
| Admin | Vercel | `admin-portal` | https://smart-cab-dispatch-admin.vercel.app |

## Deployment pipeline

The repository uses GitHub Actions as the CI quality gate for changes pushed to `main` and for pull requests. The workflow installs dependencies and validates lint/build for all four frontend applications, validates backend syntax and tests, and builds the backend Docker image. The CI workflow does not deploy production itself.

The current production deployment path remains hosting-provider driven:

```text
Pull request
    ↓
GitHub Actions CI
    ↓
Merge / push to main
    ↓
Vercel production deployments + Render backend deployment
```

Vercel and Render remain separate because the repository contains four independent Vite applications and one independent backend service. Docker is currently used to make the backend runtime reproducible and to validate the backend image in CI; it is not required to replace the existing hosting configuration.

## Backend — Render

The current Render service is configured as a native Node.js Web Service:

- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Branch: `main`
- Auto-Deploy: enabled

Production environment variables:

```env
MONGO_URI=<MongoDB Atlas connection string>
JWT_SECRET=<strong secret>
GOOGLE_CLIENT_ID=<Google OAuth client ID>
OSRM_BASE_URL=https://router.project-osrm.org
OSRM_ETA_FACTOR=1.4
ALLOWED_ORIGINS=<production frontend origins>
```

Render provides `PORT` for the running service. The application also has a local fallback port for development.

### MongoDB transaction and index requirements

Phase 5 uses MongoDB multi-document transactions to keep driver reservation, ride creation, driver linkage, and ride lifecycle mutations atomic. Production therefore requires a MongoDB deployment topology that supports transactions; the production MongoDB Atlas deployment must satisfy this requirement.

Phase 5 also adds a unique sparse index on `Ride.rideRequest` so one ride request cannot produce multiple rides. Before rolling the schema change into an existing production dataset, verify that all non-null `rideRequest` values are unique and confirm that the index can be created successfully. Do not manually create a competing index with different options.

### Docker deployment decision

A production Docker migration is **not currently required**. The repository has a validated backend Dockerfile, and Render supports Docker-based services, but the existing native Node deployment already matches the application's runtime needs. Migrating the Render service to Docker would add deployment configuration churn without solving a demonstrated production problem.

Keep the Docker image as the reproducible runtime artifact used for local validation and CI. Revisit a Render Docker deployment if the project later needs tighter OS/runtime control, guaranteed image parity with another environment, or another concrete Docker-specific operational requirement.

## Frontends — Vercel

Each frontend is configured as a separate Vercel project using the corresponding repository subfolder as its Root Directory.

Build configuration:

```text
Framework: Vite
Build: npm run build
Output: dist
Install: npm install
```

SPA routing requires each app's `vercel.json` rewrite configuration so direct navigation to client-side routes resolves to `index.html`.

### Landing

```env
VITE_GUEST_PORTAL_URL=https://smart-cab-dispatch-guest.vercel.app
VITE_DRIVER_PORTAL_URL=https://smart-cab-dispatch-driver.vercel.app
VITE_ADMIN_PORTAL_URL=https://smart-cab-dispatch-admin.vercel.app
```

### Guest

```env
VITE_API_URL=https://smart-cab-backend-jcfm.onrender.com/api
VITE_SOCKET_URL=https://smart-cab-backend-jcfm.onrender.com
VITE_GOOGLE_CLIENT_ID=<Google OAuth client ID>
VITE_LANDING_URL=https://smart-cab-dispatch.vercel.app
```

### Driver

```env
VITE_API_URL=https://smart-cab-backend-jcfm.onrender.com/api
VITE_SOCKET_URL=https://smart-cab-backend-jcfm.onrender.com
VITE_LANDING_URL=https://smart-cab-dispatch.vercel.app
```

### Admin

```env
VITE_API_URL=https://smart-cab-backend-jcfm.onrender.com/api
VITE_SOCKET_URL=https://smart-cab-backend-jcfm.onrender.com
VITE_LANDING_URL=https://smart-cab-dispatch.vercel.app
```

Never commit real secrets or production credentials to the repository. Vite variables are embedded during the frontend build, so environment-variable changes require a new deployment.

## CORS

The Express REST API and Socket.IO server both enforce allowed origins. Production frontend origins must therefore be included in the backend's `ALLOWED_ORIGINS` configuration.

Current production origins:

```text
https://smart-cab-dispatch.vercel.app
https://smart-cab-dispatch-admin.vercel.app
https://smart-cab-dispatch-driver.vercel.app
https://smart-cab-dispatch-guest.vercel.app
```

## Google OAuth

Google Identity Services requires the production frontend origin to be registered as an Authorized JavaScript origin for the configured OAuth client. The origin must match the scheme and hostname exactly.

## Deployment order

1. Open a pull request for application changes.
2. GitHub Actions validates dependencies, lint/build, backend syntax/tests, and the backend Docker image.
3. Merge the validated change into `main`.
4. Vercel deploys the affected frontend project(s) from `main`.
5. Render deploys the backend from `main` using its existing native Node runtime.
6. Verify the backend health endpoint and perform the production smoke test for changes that affect runtime behavior.

The exact timing and provider deployment behavior are controlled by the Vercel/Render project settings rather than by the GitHub Actions workflow.

## Production smoke test

```text
Landing → Guest login
Guest → Pin pickup + destination → Create request
Admin → Approve request
Driver → Receive assignment → Accept
Driver → Share live location
Guest/Admin → Observe live marker + route + ETA
Driver → Arrive → Pick up → Complete
Guest/Admin → Verify final ride state and history
```
