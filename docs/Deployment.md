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

## Backend — Render

Configure the Render Web Service with:

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

## Frontends — Vercel

Each frontend is configured as a separate Vercel project using the corresponding repository subfolder as its Root Directory.

Build configuration:

```text
Framework: Vite
Build: npm run build
Output: dist
Install: npm install
```

SPA routing requires the app's `vercel.json` rewrite configuration so direct navigation to client-side routes resolves to `index.html`.

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

1. Deploy the backend and confirm its production URL.
2. Configure and deploy the four Vercel applications with the backend URL.
3. Configure backend `ALLOWED_ORIGINS` with the final frontend origins.
4. Redeploy the backend after CORS changes.
5. Verify Google OAuth's production origin.
6. Smoke-test login, ride creation, dispatch, live location, routing, and ride completion across the portals.

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
