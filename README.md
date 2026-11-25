# ZapShift

A courier and parcel-delivery platform. Customers send and track parcels, riders
apply to deliver them and manage their earnings, and admins run the whole
operation from a separate dashboard.

The repository is a two-package project with **no root package manager**. Each
folder is installed and run on its own:

```
zap-shift/
├── client/   React 19 + Vite single-page app (the website)
├── server/   Express 5 + MongoDB API (the backend)
└── README.md this overview
```

Detailed documentation lives next to the code:

- [`client/README.md`](client/README.md) — front-end structure, features and setup
- [`server/README.md`](server/README.md) — API structure, endpoints and setup

---

## What it is

ZapShift models a real courier operation with three roles:

- **Customers (user)** — book parcels, pay for them, track them, and manage their
  own shipment history.
- **Riders** — apply through the public site, get approved by an admin, receive
  assigned deliveries, move them through the delivery lifecycle, and withdraw
  their earnings.
- **Admins** — review rider applications, assign riders to paid parcels, manage
  users, parcels and payments, change roles, block accounts, and read
  platform-wide statistics.

The site is aimed at Bangladesh: eight divisions, 64 branches, service centres,
and prices/earnings calculated in taka.

## How it works

### 1. Accounts and roles

Sign-up and sign-in are handled by **Firebase Authentication** (email/password or
a Google popup). The client attaches the Firebase ID token to every API request;
the server verifies it with `verifyIdToken(token, true)` and then loads the
account's record from MongoDB. **The role is read from the database on every
request**, never from the token, request body or browser storage.

A brand-new account is always a plain `user`. Only an admin can promote someone
to `rider` or `admin`, and the API refuses self-promotion, changing someone
else's role from a non-admin account, demoting the last admin, blocking an admin,
or turning a rider back into a normal user.

### 2. Booking a parcel

The customer fills a three-section form (parcel, sender, receiver). Region and
service-centre selects cascade, so a centre can only be chosen inside its own
region. The browser calculates the cost and shows a confirmation dialog before
anything is saved:

```
productDeliveryCost = 60                              documents
                    = 80                              non-documents up to 1 kg
                    = 80 + (weight - 1) * 20          heavier non-documents
                    += 40                             different regions
serviceCharge       = round(productDeliveryCost * 0.1)
totalCost           = productDeliveryCost + serviceCharge
```

The server always records the owner from the token, so a crafted request cannot
create a parcel for somebody else.

### 3. Payment

Checkout uses Stripe card elements. The server creates the payment intent with
the amount **stored on the parcel**, ignoring any amount sent by the client.
After confirmation, the client records the payment and marks the parcel paid.
Only a paid parcel can be given to a rider.

### 4. Delivery

An admin assigns an approved rider to a paid parcel. The parcel moves to
`rider_assigned`, then the rider drives it through `picked_up` → `in_transit` →
`delivered` (or `cancelled`). The server stamps `pickedUpAt` and, once,
`deliveredAt`. Cross-region parcels can also be shown as `transferred` while the
company truck moves them to the destination centre.

### 5. Earnings

Rider pay is computed on the server, never in the browser. It is a share of the
**delivery fee only** (the 10% service charge is not shared):

| Situation | Share |
| --- | :---: |
| Delivered to the rider's own service centre | 80% |
| Delivered to another centre in the rider's region | 65% |

A delivery only counts as earned once it is `delivered`. The wallet is not
stored: it is always `earned (delivered parcels) − cashouts`. A cashout must be a
whole number of at least 110 taka and no more than the wallet holds.

### 6. Administration

Admins review applications (`pending`, `approved`, `held`, `rejected`), and
approval writes `role: rider`, a permanent `RDR-XXXXXXXX` id, and a snapshot of
the rider's details onto the user record. They can assign/reassign riders,
search all parcels and payments, view per-user totals, promote/demote accounts
(with the restrictions above), and block or unblock users. A blocked account is
turned out by the server on every request and its session is ended on the client.

---

## Tech stack

### Client (`client/`)

| Concern | Choice |
| --- | --- |
| Framework / build | React 19, Vite 7 |
| Routing | React Router 7 (`createBrowserRouter`) |
| Styling | Tailwind CSS 4 with CSS variables; light/dark theme |
| Server state | TanStack Query 5 |
| Forms | react-hook-form 7 |
| HTTP | axios 1.20 with auth/refresh/error interceptors |
| Auth | Firebase 13 (email/password + Google popup) |
| Payments | Stripe React + Stripe JS |
| Maps | Leaflet 1.9 + react-leaflet 5 (OpenStreetMap tiles) |
| Charts | Recharts 3 |
| UI extras | lucide-react, react-hot-toast, react-responsive-carousel, react-fast-marquee |
| Quality | ESLint 9, Node's built-in test runner |

### Server (`server/`)

| Concern | Choice |
| --- | --- |
| Runtime / framework | Node, CommonJS, Express 5 |
| Database | MongoDB 7 driver (database `zapShift`) |
| Auth | firebase-admin 14 (ID token verification) |
| Payments | Stripe 22 (payment intents) |
| Uploads | multer 2 (memory storage) → imgBB proxy, 5 MB limit |
| Other | CORS (optional origin allowlist), dotenv |
| Quality | Node's built-in test runner with fakes for Mongo/Firebase/Stripe |

---

## Project structure

```
client/
├── src/
│   ├── api/            data-access hooks (parcels, payments, rider)
│   ├── assets/         images, logos, banners, brand marks
│   ├── components/     navbar, footer, branch map, charts, badges, toasts
│   ├── context/        AuthContext, AxiosContext, ThemeContext
│   ├── data/           statuses, service centres, 64 branches, role helpers
│   ├── firebase/       Firebase initialisation
│   ├── hooks/          useAuth, useAxios, rider/stat/tracking helpers
│   ├── layouts/        Root, Auth, Dashboard, Admin, Rider shells
│   ├── pages/          home, coverage, service, auth, customer, admin, rider
│   ├── routes/         router + private/admin/rider guards
│   ├── utils/          pure statistics helpers
│   └── main.jsx        provider tree and router entry point
├── tests/              client logic tests
├── .env / .env.production / vercel.json / eslint.config.js
└── README.md

server/
├── index.js            the whole API: middleware, RBAC and all routes
├── earnings.js         server-side rider pay rules
├── serviceCenters.js   authoritative centres and regions
├── tests/rbac.test.js  role-based access suite
├── .env
└── README.md
```

## Features implemented

**Public site**

- Marketing home page with banner carousel, how-it-works, services, scrolling
  partner logos, "why us", customer reviews and FAQ accordion.
- Coverage page with an interactive Leaflet map of 64 branches, free-text search
  and division filter.
- Services overview and a rider application form (login required).
- Email/password and Google sign-in, profile picture upload to imgBB, and a
  post-login redirect back to the page originally requested.

**Customer dashboard**

- Overview statistics, recent parcels and a parcel-mix chart.
- Send Parcel with live cost calculation and confirmation dialog.
- My Parcels (view, edit, cancel, pay), Track Parcel, Update Parcel, Stripe
  checkout, payment history and a shared profile page.

**Rider dashboard**

- Status counts, delivery-stage bar chart, searchable assigned deliveries with
  next-step actions, earnings breakdown (today/week/month/year), wallet and
  cashout with history, and profile with the rider record.

**Admin dashboard**

- Platform totals, revenue and charts; pending and active/held rider lists;
  manage users, parcels and payments; assign rider; role/block administration.

**Cross-cutting**

- Three guarded dashboard areas; role-aware navbar and landing page.
- Token refresh and retry on 401, role reload on 403, sign-out on account block.
- Toasts for success and failure, dark mode, responsive layouts and mobile
  drawers.

For the full route and endpoint maps, see the two package READMEs.

---

## Data model

Five MongoDB collections in `zapShift`:

| Collection | Holds |
| --- | --- |
| `users` | Firebase uid, email, profile, `role`, `blocked`, rider id and rider snapshot |
| `parcels` | Owner email, sender/receiver details, costs, delivery + payment status, assigned rider, pickup/delivery timestamps |
| `riderApplications` | Application details, reserved rider id, status, service centre |
| `payments` | User, parcel, amount, Stripe transaction id, method, status |
| `cashouts` | Rider id, amount, status and date |

---

## Installation

### Prerequisites

- Node.js 18 or newer
- MongoDB (Atlas cluster or local)
- A Firebase project with Authentication enabled
- Stripe test-mode keys
- An imgBB API key for picture uploads

### 1. Install both packages

```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure the server

Create `server/.env`:

```ini
PORT=3000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net
PAYMENT_GATEWAY_KEY=sk_test_...
IMGBB_API_KEY=<imgbb key>

# optional
DB_NAME=zapShift
CLIENT_URL=http://localhost:5173
```

For Firebase admin credentials, either set `FIREBASE_PROJECT_ID`,
`FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` in the environment, or place
the service account JSON at `server/firebase-adminsdk.json`. That file is
git-ignored — never commit it. If `CLIENT_URL` is unset, CORS allows any origin;
set it to a comma-separated allowlist in production.

### 3. Configure the client

Create `client/.env`:

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

`VITE_API_URL` falls back to `http://localhost:3000` if omitted. In Firebase,
enable **Email/Password** and **Google** sign-in and authorise
`http://localhost:5173`. Values prefixed `VITE_` are bundled into the browser,
so never put a secret there.

### 4. Run

```bash
cd server && npm run dev   # http://localhost:3000
cd client && npm run dev   # http://localhost:5173
```

Client scripts: `dev`, `build`, `lint`, `test`, `preview`.
Server scripts: `dev`, `start`, `test`.

### 5. Create the first admin

The API deliberately refuses to let an account assign itself a role, so promote
the first admin directly in MongoDB:

```js
db.users.updateOne(
  { email: "you@example.com" },
  { $set: { role: "admin", updated_at: new Date() } }
)
```

Sign in again and the navbar arrow points to `/admin`.

---

## Tests

- **Client:** `npm test` (or `node --test tests/*.test.js`) — 122 checks over
  earnings rules, statistics helpers, status registry, theme contrast, artwork
  and post-login routing. All pass.
- **Server:** `npm test` (or `node tests/rbac.test.js`) — role-based access
  suite using an in-memory fake Mongo, fake Firebase verifier and fake Stripe.
  It currently needs Firebase credentials to be present when `index.js` loads
  (see the credential options above), otherwise it exits at startup.

## Future work

- Reintroduce **password reset** as a real Firebase `sendPasswordResetEmail`
  flow. The old form-only stub was removed during cleanup because it did
  nothing; the login screen no longer links to it.
- Move the `paid` transition behind a **Stripe webhook** so a client request
  cannot mark a parcel paid without paying, and stop accepting `paymentStatus`
  in the generic parcel-update endpoint.
- Wire a **payout provider** behind rider cashouts; today a cashout is recorded
  as `paid` but no money moves.
- Replace the placeholder **branch coordinates and phone numbers** with real
  data.
- Optimise the banner images (about 2.2 MB of PNG) and lazy-load them.
- Require a `CLIENT_URL` allowlist in production instead of falling back to
  open CORS.
- Add client integration/E2E tests and more server unit tests beyond the RBAC
  suite.
- Wire the marketing CTAs ("Become a Merchant", "Earn with ZapShift") to real
  destinations.

## License

ISC
