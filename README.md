# ZapShift

A courier and parcel-delivery platform: customers send and track parcels, riders
apply to deliver them, and admins run the whole operation from a separate
dashboard.

The repository is a two-package project with no root package manager — each
folder is installed and run on its own.

```
zap-shift/
├── client/   React 19 + Vite single page app
└── server/   Express 5 + MongoDB API
```

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Routing map](#routing-map)
- [Roles and permissions](#roles-and-permissions)
- [API reference](#api-reference)
- [How the key features work](#how-the-key-features-work)
- [Data model](#data-model)
- [Security model](#security-model)
- [Tests](#tests)
- [Known gaps](#known-gaps)

---

## Features

### Public site

| Page | Route | What it does |
| --- | --- | --- |
| Home | `/` | Marketing page: auto-playing banner carousel, how-it-works steps, services grid, scrolling partner logos, "why us" highlights, customer reviews carousel, FAQ accordion |
| Coverage | `/coverage` | Interactive Leaflet map of 64 branches across 8 divisions, with text search, division filter and clickable markers |
| Services | `/service` | Service overview cards with a call to action into the dashboard |
| Be a Rider | `/be_a_rider` | Rider job application form, login required |

### Authentication

- Email and password sign up and sign in, with per-field validation
- Google sign in through a Firebase popup
- Profile picture upload during registration, stored on imgBB
- Sign out from the navbar, the dashboard sidebar and the profile page
- Post-login redirect that remembers the page you originally asked for
- Password reset page (UI only, see [known gaps](#known-gaps))

### Customer dashboard

| Page | Route | What it does |
| --- | --- | --- |
| Dashboard | `/dashboard` | Total / pending / in-transit / delivered counts and the five most recent parcels |
| Send Parcel | `/dashboard/send-parcel` | Full booking form: parcel, sender and receiver details, cascading region and service-centre selects, live cost calculation, confirmation modal before saving |
| My Parcels | `/dashboard/parcels` | Card grid of your parcels with view details, cancel, update, and pay actions |
| Track Parcel | `/dashboard/track` | Look up a single parcel by id and see its route, contacts, cost and status |
| Update Parcel | `/dashboard/update-parcel/:id` | Edit an existing parcel |
| Payment | `/dashboard/payment/:id` | Stripe card checkout for one parcel |
| Payment History | `/dashboard/payments` | Every payment you have made, with transaction ids |
| Profile | `/dashboard/profile` | Read-only account card, sign-in method, verification state, member since |

### Admin dashboard

| Page | Route | What it does |
| --- | --- | --- |
| Dashboard | `/admin` | Platform totals, revenue, rider pipeline and recent parcels |
| Pending Rider | `/admin/pending-riders` | Applications waiting for review, card grid, searchable |
| Active Rider | `/admin/active-riders` | Approved riders in a table, searchable, with pause and reactivate per row |
| Manage User | `/admin/manage-users` | Customers derived from parcel activity, with per-user parcel and spend totals |
| Manage Parcel | `/admin/manage-parcels` | Every parcel on the platform, searchable, with detail view and delete |
| Manage Payment | `/admin/manage-payments` | Every payment, with total revenue and paying-user counts |
| Administration | `/admin/administration` | Promote or demote any account between user, rider and admin |

### Cross-cutting

- Role-based route guards on both dashboards
- Token attached to every API call, with automatic refresh and retry
- Toasts for every success and failure path
- Responsive from 320px up, with mobile drawers on both dashboards

---

## Tech stack

### Client (`client/`)

| Concern | Choice |
| --- | --- |
| Framework | React 19.1 |
| Build | Vite 7.1 |
| Routing | react-router 7.9 (`createBrowserRouter`) |
| Styling | Tailwind CSS 4.1 with daisyUI 5.0, driven by CSS variables |
| Server state | TanStack Query 5.103 |
| Forms | react-hook-form 7.87 |
| HTTP | axios 1.20 with auth and error interceptors |
| Auth | Firebase 12.19 (email/password and Google) |
| Payments | Stripe (`@stripe/react-stripe-js`, `@stripe/js`) |
| Maps | Leaflet 1.9 with react-leaflet 5, OpenStreetMap tiles |
| UI extras | lucide-react icons, react-hot-toast, react-responsive-carousel, react-fast-marquee |
| Lint | ESLint 9 flat config |

### Server (`server/`)

| Concern | Choice |
| --- | --- |
| Runtime | Node with CommonJS |
| Framework | Express 5.2 |
| Database | MongoDB 7.6 driver |
| Auth | firebase-admin 14.4, verifies ID tokens |
| Payments | stripe 22.6, creates payment intents |
| Uploads | multer 2.4, proxies images to imgBB |
| Misc | cors, dotenv |

---

## Project structure

```
client/
├── src/
│   ├── api/                 data access hooks (parcels, payments)
│   ├── assets/              images, logos, banners, brand marks
│   ├── components/          navbar, footer, buttons, map, shared UI
│   ├── context/
│   │   ├── AuthContext/     Firebase session + role
│   │   └── AxiosContext/    axios instance + interceptors
│   ├── data/                roles, parcel statuses, branch locations
│   ├── firebase/            Firebase app initialisation
│   ├── hooks/               useAuth, useAxios, useTrackingUpdate
│   ├── layouts/             Root, Dashboard, Admin, Auth shells
│   ├── pages/
│   │   ├── home/            home page sections
│   │   ├── coverage/        branch map page
│   │   ├── service/         services page
│   │   ├── beARider/        rider application
│   │   ├── auth/            login, register, social, forgot password
│   │   ├── dashboard/       customer pages
│   │   └── admin/           admin pages
│   └── routes/              router and route guards
└── .env

server/
├── index.js                 the entire API, single file
├── firebase-adminsdk.json   service account, git ignored
├── tests/rbac.test.js       role based access test suite
└── .env
```

---

## Getting started

### Prerequisites

- Node.js 18 or newer (developed on 24)
- A MongoDB Atlas cluster or local MongoDB
- A Firebase project with Authentication enabled
- A Stripe account for test-mode keys
- An imgBB API key for image uploads

### 1. Install

The two packages are independent, install each separately.

```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure the server

Create `server/.env`:

```ini
PORT=3000
DB_USER=<mongodb username>
DB_PASS=<mongodb password>
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net
PAYMENT_GATEWAY_KEY=sk_test_...
IMGBB_API_KEY=<imgbb key>
```

`DB_NAME` is optional and defaults to `zapShift`.

Place your Firebase service account JSON at `server/firebase-adminsdk.json`.
It is git ignored, so never commit it.

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

In the Firebase console enable the **Email/Password** and **Google** sign-in
providers. Add `http://localhost:5173` to the authorised domains.

> `VITE_API_URL` is read by the app but is easy to miss. Without it the client
> falls back to `http://localhost:3000`.

### 4. Run

Two terminals:

```bash
cd server && npm run dev     # http://localhost:3000
cd client && npm run dev     # http://localhost:5173
```

Client scripts are `dev`, `build`, `lint` and `preview`. Server scripts are
`dev`, `start` and `test`.

### 5. Create the first admin

The server refuses to let any account assign itself a role, so the first admin
has to be promoted directly in MongoDB. Connect with Compass or the shell:

```js
db.users.updateOne(
  { email: "you@example.com" },
  { $set: { role: "admin", updated_at: new Date() } }
)
```

Sign in again and the navbar arrow points at `/admin`. There is no in-app way
to promote the very first admin, by design, so that nobody can escalate
themselves into the panel.

---

## Environment variables

### Server (`server/.env`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | yes | Port the API listens on, default 3000 |
| `MONGODB_URI` | yes | Full MongoDB connection string |
| `DB_USER` | provider specific | Used when the URI is assembled manually |
| `DB_PASS` | provider specific | Used when the URI is assembled manually |
| `PAYMENT_GATEWAY_KEY` | yes | Stripe secret key, used server side only |
| `IMGBB_API_KEY` | for uploads | Image host key, never sent to the browser |
| `DB_NAME` | no | Database name, defaults to `zapShift` |

### Client (`client/.env`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | yes | Base URL of the API, defaults to `http://localhost:3000` |
| `VITE_apiKey` | yes | Firebase web api key |
| `VITE_authDomain` | yes | Firebase auth domain |
| `VITE_projectId` | yes | Firebase project |
| `VITE_storageBucket` | yes | Firebase storage bucket |
| `VITE_messagingSenderId` | yes | Firebase messaging sender |
| `VITE_appId` | yes | Firebase web app id |
| `VITE_payment_key` | for payments | Stripe **publishable** key, safe for the browser |

Everything prefixed `VITE_` is inlined into the JavaScript bundle at build
time, so never put a secret in the client env file.

---

## Routing map

Defined in `client/src/routes/Router.jsx` with `createBrowserRouter`. Four
layout branches.

### Public — `RootLayout`

| Path | Page | Guard |
| --- | --- | --- |
| `/` | Home | none |
| `/coverage` | Coverage | none |
| `/service` | Service | none |
| `/be_a_rider` | BeARider | login required |

### Customer — `DashboardLayout`

| Path | Page | Guard |
| --- | --- | --- |
| `/dashboard` | DashboardHome | login required, and admins are redirected to `/admin` |
| `/dashboard/send-parcel` | SendParcel | login required |
| `/dashboard/parcels` | MyParcels | login required |
| `/dashboard/track` | TrackParcel | login required |
| `/dashboard/profile` | Profile | login required |
| `/dashboard/update-parcel/:id` | UpdateParcel | login required, own parcel only |
| `/dashboard/payment/:id` | Payment | login required, own parcel only |
| `/dashboard/payments` | PaymentHistory | login required |

### Admin — `AdminLayout`

| Path | Page | Guard |
| --- | --- | --- |
| `/admin` | AdminHome | login required **and admin role** |
| `/admin/pending-riders` | PendingRiders | login required **and admin role** |
| `/admin/active-riders` | ActiveRiders | login required **and admin role** |
| `/admin/manage-users` | ManageUsers | login required **and admin role** |
| `/admin/manage-parcels` | ManageParcels | login required **and admin role** |
| `/admin/manage-payments` | ManagePayments | login required **and admin role** |
| `/admin/administration` | Administration | login required **and admin role** |

### Auth — `AuthLayout`

| Path | Page |
| --- | --- |
| `/login` | Login |
| `/register` | Register |
| `/forgot-password` | ForgotPassword |

### The two guards

`PrivateRoutes` (`client/src/routes/PrivateRoutes.jsx`) waits for the Firebase
session, then redirects to `/login` and stores the attempted location so login
can send the user back where they were going.

`AdminRoutes` (`client/src/routes/AdminRoutes.jsx`) additionally waits for the
role to load, then renders an access-denied screen for anyone who is not an
admin. A promoted admin is never bounced out by a race, because the guard waits
for the role instead of assuming.

`AdminRedirect` is the mirror image and lives on `/dashboard`, so an admin can
never end up in the customer dashboard.

These guards are for user experience only. Every admin endpoint re-checks the
role on the server, so editing the browser cannot help.

---

## Roles and permissions

Three roles, stored in `users.role` in MongoDB and read by the server on every
request.

| Role | Can do |
| --- | --- |
| `user` | Send, view, edit, cancel and pay for their own parcels, apply to be a rider |
| `rider` | Everything a user can do. Rider identity fields (`riderID`, `riderSince`, `riderInfo`) are issued by the server on approval |
| `admin` | Everything a user can do, plus the entire admin dashboard |

### The permission matrix

| Capability | user | rider | admin |
| --- | :---: | :---: | :---: |
| View own parcels | yes | yes | yes |
| View another account's parcels | no | no | yes |
| Edit parcel delivery status | no | no | yes |
| Delete any parcel | no | no | yes |
| Delete own parcel | yes | yes | yes |
| View own payments | yes | yes | yes |
| View all payments | no | no | yes |
| List all users | no | no | yes |
| List rider applications | no | no | yes |
| Approve, hold or reject an application | no | no | yes |
| Change a role | no | no | yes, but not their own |
| Upload an image | yes | yes | yes |

### Role rules the server enforces

- Nobody can change their own role, so nobody can promote themselves or lock
  themselves out.
- The last remaining admin cannot be demoted, which would lock everyone out.
- A rider cannot be given the admin role.
- Registration always writes `role: "user"`. A request body containing
  `role`, `riderID` or `riderInfo` is discarded.
- An account with no database record is treated as a plain user, never as an
  admin.

---

## API reference

Base URL is `VITE_API_URL`. Every endpoint below except `GET /` requires an
`Authorization: Bearer <firebase id token>` header.

Legend: **own** means the record is scoped to the caller, **admin** means the
`admin` role is required.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/` | public | Liveness check |
| `POST` | `/user` | signed in | Create the caller's user record with role `user` |
| `GET` | `/api/users/me` | signed in | The caller's own record, this is where the client reads its role |
| `GET` | `/api/users` | **admin** | Every user, newest first |
| `PATCH` | `/api/users/:id/role` | **admin** | Change a role, with the restrictions above |
| `GET` | `/api/parcels` | own, admin sees all | List parcels, `?email=` filters for admins only |
| `GET` | `/api/parcels/:id` | own, admin sees any | One parcel, 404 if it is not yours |
| `POST` | `/api/parcels` | signed in | Create a parcel, owner is taken from the token |
| `PUT` | `/api/parcels/:id` | own, admin sees any | Update a parcel, delivery status is admin only |
| `DELETE` | `/api/parcels/:id` | **admin** | Delete a parcel |
| `PATCH` | `/api/parcels/:id/rider` | **admin** | Assign or clear a rider, refused unless the parcel is `paid` |
| `GET` | `/api/rider/parcels` | rider | The parcels assigned to this rider, each carrying its server worked out earning |
| `PATCH` | `/api/rider/parcels/:id/status` | rider, own parcels only | Move a delivery along, stamps `deliveredAt` on the way in |
| `GET` | `/api/rider/cashouts` | rider | This rider's cashout history and the wallet figures behind it |
| `POST` | `/api/rider/cashouts` | rider | Take money out of the wallet, 110 taka minimum and never more than the wallet holds |
| `GET` | `/api/rider-applications` | **admin** | Every rider application |
| `POST` | `/api/rider-applications` | signed in | Apply to be a rider, always starts `pending` |
| `PATCH` | `/api/rider-applications/:id` | **admin** | Set application status, approving issues a rider id |
| `DELETE` | `/api/rider-applications` | **admin** | Delete every application |
| `GET` | `/api/payments` | own, admin sees all | List payments |
| `POST` | `/api/payments` | signed in | Record a payment, owner is taken from the token |
| `POST` | `/create-payment-intent` | own, admin sees any | Create a Stripe intent, amount comes from the stored parcel |
| `POST` | `/api/upload-image` | signed in | Upload an image, proxied to imgBB, 5 MB limit |

### Status codes

| Code | Meaning |
| --- | --- |
| `400` | Bad request, for example an invalid id or an unknown status |
| `401` | Missing, malformed, expired or revoked token |
| `403` | Signed in, but the role or ownership does not allow it |
| `404` | Not found, also returned instead of 403 so the response does not confirm that someone else's record exists |
| `503` | The database is not connected yet |

---

## How the key features work

### Token verification and role resolution

Authentication and authorization are deliberately separate steps.

1. The axios request interceptor in `client/src/context/AxiosContext/axiosClient.js`
   reads the current Firebase user, asks for an ID token and attaches it as a
   bearer token. FormData payloads drop the JSON content type first so the
   browser can set the multipart boundary.
2. `requireAuth` on the server (`server/index.js`) rejects anything without a
   well-formed `Bearer` token, then verifies it with
   `verifyIdToken(token, true)`. The second argument also rejects tokens
   belonging to deleted or disabled accounts.
3. Only after the token is proven does it load the caller's record from MongoDB
   and read the role from there. The role is never taken from the token or from
   the request body.
4. `requireRole("admin")` compares the stored role against the allow list.
5. On a `401` the client force-refreshes the token and replays the request once.
   On a `403` the client re-reads its own role, so a demotion takes effect
   without a page reload.

### Parcel booking and cost

`/dashboard/send-parcel` is a three-section form: parcel info, sender info and
receiver info. Region and service centre are cascading selects, and the service
centre stays disabled until a region is chosen.

The cost is calculated on the client and shown in a confirmation modal before
anything is saved:

```
productDeliveryCost = 60                              for documents
                    = 80                              for non-documents up to 1 kg
                    = 80 + (weight - 1) * 20          for heavier non-documents
                    += 40                             when the regions differ
serviceCharge       = round(productDeliveryCost * 0.1)
totalCost           = productDeliveryCost + serviceCharge
```

Nothing is written until **Confirm Parcel** is pressed, so the user can go back
and edit from the modal.

### Payments

The checkout on `/dashboard/payment/:id` runs four steps:

1. Fetch the parcel, the amount is its stored `totalCost`.
2. `createPaymentMethod` with the Stripe card element.
3. `POST /create-payment-intent`. The server **ignores any amount in the
   request** and reads the amount from the stored parcel, so the price cannot be
   tampered with.
4. `confirmCardPayment`, and on success the parcel is marked paid and a payment
   record is stored with the transaction id.

Payment status values are `unpaid` and `paid`. The payment button on a parcel
card is disabled once it is paid.

### Rider applications

A signed-in user applies from `/be_a_rider`. The server files the application
under the caller's own uid and email and forces the status to `pending`.

Admins review them from `/admin/pending-riders` and `/admin/active-riders`.
Setting an application to `approved` makes the server write `role`, `riderID`,
`riderSince` and a `riderInfo` snapshot onto the linked user record, so the
rider keeps one id for life. An applicant without a user record is approved but
reported in a second toast, and an already-promoted rider is never given a
second id.

Application statuses are `pending`, `approved`, `held` and `rejected`. Both
rider pages share `client/src/pages/admin/riders/RiderList.jsx`, which is
configured with props, so the two pages differ only in layout: pending
applications render as a card grid, active riders render as a table.

On the active riders page, held riders are merged into the same table and
highlighted in orange, with an `Active (n)` and `On Hold (n)` legend above it.
Each row can be paused or reactivated with one click, and the same four
statuses are also settable from the detail modal.

### Delivery and payment statuses

Defined in `client/src/data/parcelStatuses.js`.

| Delivery status | Label |
| --- | --- |
| `pending` | Pending |
| `picked_up` | Picked Up |
| `in_transit` | In Transit |
| `delivered` | Delivered |
| `cancelled` | Cancelled |

| Payment status | Label |
| --- | --- |
| `unpaid` | Unpaid |
| `paid` | Paid |

Only `pending`, `in_transit` and `delivered` are counted in the dashboard
breakdowns. Cancelling a parcel from **My Parcels** deletes the record outright
rather than setting `cancelled`.

### Rider earnings and cashout

A rider earns when a parcel is delivered, never before. The amount and the tier
are worked out on the server (`server/earnings.js`) and shipped on every parcel,
so the browser is only ever told the figure.

The earnings page at `/rider/earnings` keeps four numbers apart:

| Figure | What it is |
| --- | --- |
| Total Earning | Every delivered delivery, all time |
| Pending | What the deliveries still open are worth, not money in hand |
| In Wallet | Earned money that has not been cashed out |
| Cashed Out | The sum of the cashouts already on the rider's record |

The wallet is never stored. It is `earned` from the rider's own delivered parcels
minus every cashout in the `cashouts` collection, so a cashout cannot be spent
twice and cancelling a delivery can never leave a balance behind that was never
earned.

A cashout is refused by the server unless it is a whole number of at least 110
taka and no more than the wallet holds. The same rule is checked in the form, so
the rider is told what is wrong before the request is sent.

Underneath the four figures the same earned money is split by when it was earned:
today, this week (from Sunday), this month and this year. The day comes from
`deliveredAt`, which the server stamps once when a rider marks a parcel
delivered.

### Coverage map

`/coverage` renders 64 branches from `client/src/data/branches.js` on a Leaflet
map with OpenStreetMap tiles. The list can be narrowed by free text across name,
district, division and address, or by division. Clicking a card flies the map
to that branch and opens its popup. The shipped coordinates are placeholders.

---

## Data model

Five MongoDB collections in the `zapShift` database.

### `users`

| Field | Notes |
| --- | --- |
| `_id` | ObjectId |
| `uid` | Firebase uid, the reliable link to an account |
| `email` | Lowercased, unique per Firebase account |
| `name`, `phone`, `photoURL` | Profile details |
| `role` | `user`, `rider` or `admin` |
| `riderID` | `RDR-XXXXXXXX`, eight hex characters, reserved when the rider applies |
| `riderSince` | When the application was approved |
| `riderInfo` | Snapshot of the application, including NID and service center |
| `created_at`, `last_log_in`, `updated_at` | ISO strings and dates |

### `parcels`

| Field | Notes |
| --- | --- |
| `_id` | ObjectId |
| `userEmail` | Owner, always taken from the token on create |
| `parcelTitle`, `parcelType` | `document` or `non-document` |
| `weight` | Kilograms |
| `senderName`, `senderContact`, `senderRegion`, `senderServiceCenter`, `senderAddress`, `pickupInstruction` | Pickup side |
| `receiverName`, `receiverContact`, `receiverRegion`, `receiverServiceCenter`, `receiverAddress`, `deliveryInstruction` | Delivery side |
| `productDeliveryCost`, `serviceCharge`, `totalCost` | Calculated at booking |
| `status` | Delivery status, admin controlled |
| `paymentStatus` | `unpaid` or `paid`, a rider is only ever assigned to a `paid` parcel |
| `riderID`, `riderName`, `riderEmail`, `assignedAt` | Written by the admin assignment endpoint |
| `deliveredAt` | Stamped once when a rider marks the parcel delivered, this is the day the earning is grouped under |
| `createdAt`, `updatedAt` | Dates |

### `riderApplications`

`uid`, `riderID`, `name`, `age`, `email`, `region`, `nid`, `contact`,
`serviceCenter`, `subscribeEmail`, `status`, `createdAt`, `updatedAt`. The rider id
is reserved when the application is created, in the form `RDR-XXXXXXXX` where
the eight characters are random uppercase hex, so approving never has to
allocate one and a rider keeps the same id for life.

### `payments`

`userEmail`, `userName`, `parcelId`, `parcelTitle`, `amount`,
`transactionId`, `paymentMethod`, `status`, `createdAt`.

### `cashouts`

`riderID`, `riderEmail`, `amount`, `status` (`paid`), `createdAt`. The server holds
the balance as earned money from delivered parcels minus every cashout in this
collection, so the wallet is never a number to edit by hand.

---

## Security model

- **The role lives on the server.** `role` is read from MongoDB per request.
  The id token, the request body and local storage are all ignored for
  authorization decisions.
- **No hardcoded owner email.** An earlier version treated one specific address
  as an admin. Access now depends on the role alone.
- **Ownership is enforced server-side.** Non-admins are pinned to their own
  rows on parcels and payments. A `?email=` query parameter only works for
  admins, and a foreign parcel returns 404 rather than 403 so the response does
  not confirm that it exists.
- **Price integrity.** The payment intent amount is read from the stored parcel.
- **Input hygiene.** Parcel owner, creation time, ids and delivery status are
  server controlled and stripped from request bodies. Emails are matched case
  insensitively so casing cannot be used to impersonate an account.
- **No self-escalation.** See the role rules above.
- **Upload endpoint is authenticated**, and the service account JSON, the
  database password, the Stripe secret key and the imgBB key are all git ignored
  and never reach the browser.

---

## Tests

The server ships with a role based access test suite that boots the real API
against an in-memory Mongo, a fake Firebase token verifier and a fake Stripe, so
it runs with no external services and no network.

```bash
cd server && npm test
```

54 checks across 15 areas: missing and forged tokens, a non-admin on every
admin endpoint, self-promotion, changing somebody else's role, the last admin,
ownership scoping on parcels and payments, delivery status control, parcel
ownership on create, registration not being able to assign itself a role, an
account with no record never being an admin, payment amount tampering, and the
upload endpoint requiring a token.

```
54 passed, 0 failed
```

The client has lint and build but no test runner yet.

---

## Known gaps

Honest list of what is not finished.

- **Password reset does nothing.** `/forgot-password` validates the form and
  stops there. Firebase `sendPasswordResetEmail` is not wired up.
- **CORS is wide open.** `app.use(cors())` accepts any origin, so a stolen token
  could be replayed from another site. Add a `CLIENT_ORIGIN` allowlist.
- **A user can set their own `paymentStatus`.** The payment flow needs to write
  `paid`, so the same endpoint lets a user mark a parcel paid without paying.
  The real fix is a Stripe webhook that marks the parcel after Stripe confirms.
- **The service page is half finished.** Four of the six service cards are
  commented out and "Learn More" is not a link.
- **The FAQ copy is wrong.** It still describes a posture corrector product.
- **Branch data is placeholder.** 64 branches with a `01XXXXXXXXX` phone
  pattern and approximate coordinates.
- **The footer still says "Profast Courier"** and the branch names say
  "Profast". `index.html` is still titled "Vite + React" and
  `package.json` is still named `module44`.
- **The three banner images are around 740 KB each**, about 2.2 MB of PNG in
  the bundle, and nothing in the app lazy-loads them.
- **No client tests**, and the server has no unit tests, only the access suite.
- **A cashout does not move real money.** The wallet, the 110 taka minimum and
  the history are all real and enforced on the server, but there is no payout
  provider behind them, so a cashout is recorded as `paid` rather than sent to a
  mobile wallet or bank account.

---

## License

ISC
