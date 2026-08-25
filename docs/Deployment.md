# Deployment

## Topology

Five separate deployments, one repo:

| App | Platform | Root Directory | Port (local) |
|---|---|---|---|
| `backend` | Render | `backend` | 5000 |
| `landing` | Vercel | `landing` | 5176 |
| `guest-portal` | Vercel | `guest-portal` | 5173 |
| `driver-portal` | Vercel | `driver-portal` | 5174 |
| `admin-portal` | Vercel | `admin-portal` | 5175 |

Each is deployed independently from the same GitHub repository — Vercel
supports importing one repo into multiple projects, each pinned to a
different subfolder via its **Root Directory** setting.

## Backend — Render

1. New Web Service → connect the GitHub repo
2. **Root Directory**: `backend`
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. **Branch**: must explicitly be `main` — Render does not infer this,
   and if it's left pointed at an old feature branch, every subsequent
   push to `main` silently has no effect on production (this happened
   during this project's own deploy — worth double-checking on first
   setup, not just assuming the default branch is used)
6. **Auto-Deploy**: enable it, so pushes to `main` redeploy without a
   manual trigger
7. Environment variables:
   - `PORT` (Render sets this automatically, but the app also falls
     back to `5000` if unset)
   - `MONGO_URI` — MongoDB Atlas connection string
   - `JWT_SECRET`
   - `GOOGLE_CLIENT_ID` — required for `POST /api/auth/google` to work;
     without it, `auth.service.js` throws "Google authentication is not
     configured" on every Google sign-in attempt
   - `NODE_ENV=production` (optional, but conventional)

**MongoDB Atlas connection note**: `mongodb+srv://` connection strings
depend on DNS `SRV` record resolution, which can fail on networks
without a fully IPv4-capable resolver (seen locally in Windows dev,
not on Render). If a `mongodb+srv://` URI fails to connect with
`querySrv ECONNREFUSED`, either switch the local machine's DNS to
`8.8.8.8`/`1.1.1.1`, force Node's resolver
(`dns.setServers(["8.8.8.8", "1.1.1.1"])` — already done in
`server.js`), or use Atlas's plain `mongodb://` connection string
(lists all shard hosts directly, skips the SRV lookup entirely).

## Frontends — Vercel

Repeat these steps once per app (`landing`, `guest-portal`,
`driver-portal`, `admin-portal`):

1. Add New Project → import the same GitHub repo
2. **Root Directory**: click Edit, select the app's subfolder
   (e.g. `guest-portal`) — this is the one setting that makes each
   Vercel project build only that subfolder instead of the whole repo
3. Framework Preset: Vite (auto-detected)
4. Build Command: `npm run build` · Output Directory: `dist` ·
   Install Command: `npm install`
5. Add a `vercel.json` in that subfolder for SPA routing, so refreshing
   a deep route like `/features` or `/dashboard/drivers` doesn't 404:
   ```json
   { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
   ```
6. Set environment variables (see table below)
7. Deploy, then rename the project (Settings → General) to something
   distinguishable, e.g. `smart-cab-dispatch-admin` — renaming updates
   the project's default `.vercel.app` slug
8. If a custom `.vercel.app` name is already claimed by a *Domain*
   entry on a different project (not the project name itself), it has
   to be removed from that project's Settings → Domains before it's
   free to add elsewhere — renaming the project alone doesn't release
   a domain that was added separately

### Environment variables per frontend

| App | Variable | Value |
|---|---|---|
| `landing` | `VITE_GUEST_PORTAL_URL` | deployed guest-portal URL |
| | `VITE_DRIVER_PORTAL_URL` | deployed driver-portal URL |
| | `VITE_ADMIN_PORTAL_URL` | deployed admin-portal URL |
| `guest-portal` | `VITE_API_URL` | `<backend>/api` |
| | `VITE_GOOGLE_CLIENT_ID` | same Client ID as backend's `GOOGLE_CLIENT_ID` |
| | `VITE_LANDING_URL` | deployed landing URL |
| `driver-portal` | `VITE_API_URL` | `<backend>/api` |
| | `VITE_SOCKET_URL` | `<backend>` (no `/api` — Socket.IO connects at the root) |
| | `VITE_LANDING_URL` | deployed landing URL |
| `admin-portal` | `VITE_API_URL` | `<backend>/api` |
| | `VITE_LANDING_URL` | deployed landing URL |

Env var **keys** can't be renamed after the fact in Vercel's UI — if a
key was typed wrong at first pass (e.g. `VITE_API_BASE_URL` instead of
`VITE_API_URL`), delete the variable and re-add it with the correct
key, then **redeploy** — env var changes don't apply to already-built
deployments.

## CORS — two separate configs, both need every frontend origin

The REST API (`app.js`, via the `cors` package) and Socket.IO
(`config/socket.js`, via its own `cors` option passed to `new Server()`)
are **two independent CORS checks**. Both are backed by the same
`ALLOWED_ORIGINS` array in `backend/src/config/env.js`, but if a future
change updates one without the other, REST calls can succeed while
WebSocket connections fail (or vice versa) with no obvious shared
cause — worth checking both whenever a new frontend URL is added.

## Google OAuth — origin registration

Google Identity Services checks the *exact* origin (`https://`, host,
no path, no trailing slash) making the sign-in request against
**Authorized JavaScript origins** in Google Cloud Console
(APIs & Services → Credentials → the OAuth Client). Every deployed
frontend origin that will show the Google button needs to be added
here explicitly — `localhost` origins added during development don't
cover production, and a missing entry produces a client-side
`origin_mismatch` (`Error 400`) that looks like a code bug but isn't
one. Propagation after adding a new origin takes a few minutes.

If sign-in additionally shows "Access blocked: ... doesn't comply with
Google's OAuth 2.0 policy" after the origin is correctly registered,
check the OAuth consent screen's **Publishing status** — while a
project is in **Testing**, only explicitly added test users can sign
in, regardless of origin configuration.

## Deployment order

Because the frontends' env vars reference each other's URLs and the
backend's URL, and the backend's `ALLOWED_ORIGINS` needs to know every
frontend's URL, there's a natural bootstrapping order:

1. Deploy `backend` first, note its URL
2. Deploy the three role portals + `landing`, using the backend URL for
   their `VITE_API_URL`/`VITE_SOCKET_URL`
3. Go back and add all four frontend URLs to `backend`'s
   `ALLOWED_ORIGINS` (both the REST and Socket.IO configs), redeploy
   the backend
4. Add each frontend's URL to the others' `VITE_*_URL` variables where
   they cross-link (landing → portals, portals → landing), redeploy
   those frontends
5. Add the guest-portal's final URL to Google Cloud Console's
   Authorized JavaScript origins
