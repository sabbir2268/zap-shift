# ZapShift — Client

The React single-page app for ZapShift: the public marketing website plus the
customer, rider and admin dashboards. It talks to the API in [`../server`](../server/README.md)
over HTTP; it contains no backend code.

## Stack

| Concern | Choice |
| --- | --- |
| Framework / build | React 19, Vite 7 |
| Routing | React Router 7 (`createBrowserRouter`) |
| Styling | Tailwind CSS 4 driven by CSS variables; light/dark theme |
| Server state | TanStack Query 5 |
| Forms | react-hook-form 7 |
| HTTP | axios 1.20 with request/response interceptors |
| Auth | Firebase 13 — email/password and Google popup |
| Payments | Stripe React + Stripe JS card elements |
| Maps | Leaflet 1.9 + react-leaflet 5, OpenStreetMap tiles |
| Charts | Recharts 3 |
| UI | lucide-react, react-hot-toast, responsive carousel, fast marquee |
| Quality | ESLint 9 flat config; Node's built-in test runner |
| Deploy | `vercel.json` rewrites every path to `index.html` for client-side routing |

## Structure

```
src/
├── api/            useParcels, usePayments, useRider — thin data-access hooks
├── assets/         images, logos, banners, brand marks
├── components/
│   ├── BranchMap/      Leaflet map used by the coverage page
│   ├── Buttons/, logo/, navbar/, footer/
│   ├── DeliveryChart/, ParcelMixChart/, StatsBarChart/   Recharts views
│   ├── StatusBadge/, PageLoader/, ThemeToggle/, Toast/
├── context/
│   ├── AuthContext/    Firebase session, profile and role
│   ├── AxiosContext/   shared axios instance and interceptors
│   └── ThemeContext/   light/dark choice persisted in localStorage
├── data/           statuses, service centres, 64 branches, role helpers
├── firebase/       Firebase app initialisation
├── hooks/          useAuth, useAxios, rider/stat/tracking/redirect helpers
├── layouts/        Root, Auth, Dashboard, Admin, Rider shells
├── pages/          home, coverage, service, auth, customer, admin, rider
├── routes/         Router.jsx + PrivateRoutes, AdminRoutes, RoleRoutes
├── utils/          pure statistics helpers (also covered by tests)
└── main.jsx        provider tree: Theme → Query → Auth → Axios → Router → Toaster
tests/              logic tests run by Node
```

## Routes and pages

| Area | Routes | Guard |
| --- | --- | --- |
| Public | `/`, `/coverage`, `/service` | none |
| Public | `/be_a_rider` | signed in |
| Auth | `/login`, `/register` | none |
| Customer | `/dashboard`, `send-parcel`, `parcels`, `track`, `profile`, `payments`, `update-parcel/:id`, `payment/:id` | signed in; admins/riders are redirected to their own panels |
| Admin | `/admin`, `pending-riders`, `active-riders`, `manage-users`, `manage-parcels`, `assign-rider`, `manage-payments`, `administration`, `profile` | signed in + `admin` role |
| Rider | `/rider`, `deliveries`, `earnings`, `profile` | signed in + `rider` role |

`PrivateRoutes` waits for the Firebase session and remembers the attempted page
so login can return there. `AdminRoutes` and `RoleRoutes` wait for the role to
load before granting access; a promoted admin or rider is never bounced by a
race. These guards are for UX only — the server checks the same rules again.

## Features

- **Home** — banner carousel, how-it-works, services, partner marquee, "why us",
  customer reviews and FAQ.
- **Coverage** — 64 branches on a Leaflet map with text search, division filter
  and clickable markers that fly to the branch.
- **Auth** — validation on every field, Google popup sign-in, profile picture
  upload to imgBB during registration, and redirect back to the original page.
- **Customer** — booking form with cascading region/centre selects, live cost
  calculation and confirmation modal; parcel cards with view/edit/cancel/pay;
  tracking; Stripe checkout; payment history; parcel-mix chart.
- **Rider** — assigned-delivery list with next-step actions, a delivery-stage
  bar chart, server-calculated earnings, wallet with cashout and history, and a
  breakdown by today/week/month/year.
- **Admin** — platform totals and charts, rider review (cards for pending, table
  for active/held with pause/reactivate), user/parcel/payment management, rider
  assignment to paid parcels, role and block administration.
- **Shared profile** — one profile page for all roles; riders additionally see
  their rider record and current rider status.
- **Cross-cutting** — dark mode, responsive layouts with mobile drawers, toasts
  for success and failure, and automatic token refresh/retry.

## Data flow

1. `AuthProvider` listens to Firebase auth state and loads `/api/users/me` to
   learn the role. It reloads the role when the ID token changes or a request is
   forbidden, and ends the session if the account was blocked.
2. `axiosClient` attaches the current Firebase ID token to every request,
   removes the JSON content type for `FormData`, refreshes and replays once on
   `401`, and notifies subscribers on `403`.
3. Pages read server data through TanStack Query or small `useAxios` calls; pure
   calculations (cost, earnings display, statistics, status labels) live in
   `utils/` and `data/` so they can be unit-tested without a browser.
4. Styling uses CSS variables in `src/index.css`; the `dark` class is applied to
   `<html>` and persisted under `zapshift-theme`.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

Create `.env` before starting:

```ini
VITE_API_URL=http://localhost:3000
VITE_apiKey=...
VITE_authDomain=...
VITE_projectId=...
VITE_storageBucket=...
VITE_messagingSenderId=...
VITE_appId=...
VITE_payment_key=pk_test_...
```

`VITE_API_URL` defaults to `http://localhost:3000`. Enable Email/Password and
Google providers in the Firebase console and authorise `http://localhost:5173`.
Only Stripe's **publishable** key belongs here; the secret key stays on the
server. `.env.production` holds the production API URL.

Scripts: `dev`, `build`, `lint`, `test`, `preview`.

## Tests

```bash
npm test          # or: node --test tests/*.test.js
```

122 checks cover the earnings tiers and service-centre rules, delivery and
platform statistics, status registry, theme contrast, artwork treatment and
post-login routing. They are pure Node tests — no browser or API required.

## Notes / future work

- The old forgot-password screen was only a form that logged its input, so it
  was removed. Reintroduce it properly with `sendPasswordResetEmail`.
- The FAQ and review copy now describes courier services instead of the old
  placeholder product; branch names and the footer use the ZapShift brand.
- The coverage coordinates and phone numbers are still placeholders.
- Banner images are large PNGs and are not lazy-loaded yet.
- The marketing CTA buttons are presentational; wire them to real destinations.
- Client integration/E2E tests are not set up yet.

See the [root README](../README.md) for the full platform overview and the
[server README](../server/README.md) for the API.
