# ZapShift — Server

The Express API behind ZapShift. It owns authentication and authorization,
parcels, rider applications and assignments, payments, rider earnings and
cashouts, and image uploads. It has no front-end code — see
[`../client/README.md`](../client/README.md) for that.

## Stack

| Concern | Choice |
| --- | --- |
| Runtime / framework | Node (CommonJS), Express 5 |
| Database | MongoDB driver 7, database `zapShift` by default |
| Auth | firebase-admin 14 — verifies Firebase ID tokens |
| Payments | Stripe 22 — creates payment intents |
| Uploads | multer 2 (memory storage, 5 MB limit) proxied to imgBB |
| CORS | `cors`, with an optional `CLIENT_URL` allowlist |
| Config | dotenv |
| Tests | Node's built-in runner with fakes for Mongo, Firebase and Stripe |

## Files

```
index.js            the whole API: middleware, RBAC, collections, all routes
earnings.js         rider pay rules and the earnings summary (server-side only)
serviceCenters.js   authoritative service centres and their regions
tests/rbac.test.js  role-based access control suite
.env                local configuration (git ignored)
```

## How requests are authorised

1. `requireAuth` reads `Authorization: Bearer <token>` and verifies it with
   `getAuth().verifyIdToken(token, true)` — the second argument also rejects
   deleted or disabled accounts.
2. It loads the caller's record from MongoDB and attaches `req.auth` (uid/email)
   and `req.user` (database record with its role). An account with no record is
   treated as a plain `user`, never as an admin.
3. A `blocked: true` flag is refused centrally in the middleware with a `403`,
   so every endpoint is covered without remembering to check individually.
4. `requireRole(...)` is mounted as `adminOnly` or `riderOnly` where needed.

The role is **only** ever read from the database for an authorization decision.
It is never trusted from the token, request body or browser.

Owner scoping is also server-side: non-admins are pinned to their own rows on
parcels and payments, a `?email=` query only works for admins, and a foreign
record returns `404` instead of `403` so it is not confirmed to exist.

## Endpoints

Base URL is the port this server listens on (`PORT`, default `3000`). Every route
below except `GET /` requires a Firebase bearer token. **own** means the record
is scoped to the caller; **admin**/**rider** require that stored role.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/` | public | Liveness check |
| `POST` | `/user` | signed in | Create the caller's user record, always `role: user` |
| `GET` | `/api/users/me` | signed in | Own record plus current rider application status |
| `GET` | `/api/users` | admin | All users |
| `PATCH` | `/api/users/:id/role` | admin | Change a role, with the restrictions below |
| `PATCH` | `/api/users/:id/block` | admin | Block or unblock an account |
| `GET` | `/api/parcels` | own / admin | List parcels; `?email=` filters for admins only |
| `GET` | `/api/parcels/:id` | own / admin | One parcel |
| `POST` | `/api/parcels` | signed in | Create a parcel, owner from the token |
| `PUT` | `/api/parcels/:id` | own / admin | Update a parcel; status and rider fields are admin-only |
| `DELETE` | `/api/parcels/:id` | admin | Delete a parcel |
| `PATCH` | `/api/parcels/:id/rider` | admin | Assign/clear a rider; only on a paid parcel |
| `GET` | `/api/rider/parcels` | rider | Own assigned parcels with the computed earning on each |
| `PATCH` | `/api/rider/parcels/:id/status` | rider | Move own delivery along; stamps pickup/delivery times |
| `GET` | `/api/rider/cashouts` | rider | Cashout history and wallet figures |
| `POST` | `/api/rider/cashouts` | rider | Withdraw whole taka, minimum 110, never above wallet |
| `GET` | `/api/rider-applications` | admin | All applications |
| `POST` | `/api/rider-applications` | signed in | Apply, always starts `pending`, rider id reserved |
| `PATCH` | `/api/rider-applications/:id` | admin | Set status; approving promotes the user to rider |
| `DELETE` | `/api/rider-applications` | admin | Delete every application |
| `GET` | `/api/payments` | own / admin | List payments |
| `POST` | `/api/payments` | signed in | Record a payment paid by the caller |
| `POST` | `/create-payment-intent` | signed in | Stripe intent, amount read from the stored parcel |
| `POST` | `/api/upload-image` | signed in | Proxy one image (5 MB max) to imgBB |

Status codes: `400` bad request, `401` missing/bad token, `403` wrong role or
ownership, `404` not found (also used in place of 403 for foreign records),
`503` database not connected yet.

## Role rules enforced here

- Nobody can change their own role or block their own account.
- The last remaining admin cannot be demoted, and an admin account cannot be
  blocked.
- A rider cannot be made an admin or pushed back to a normal user.
- Registration writes `role: user`, `riderID: null` and ignores any role/rider
  fields in the request.
- Approving an application reuses the id reserved when it was filed, so a rider
  keeps one `RDR-XXXXXXXX` id for life; an already-promoted rider is never given
  a second one.

## Rider earnings and cashout

`earnings.js` decides both the tier and the amount, so the browser is only told
the answer:

| Delivery destination | Rate | Basis |
| --- | :---: | --- |
| Rider's own service centre | 80% | `productDeliveryCost` only, never the service charge |
| Another centre in the rider's region | 65% | same |

Cross-region parcels are moved by truck to the destination centre first, so the
delivering rider is always working in that region. Only a `delivered` parcel is
settled; other states show what they *would* pay.

The wallet is derived, not stored: earnings from the rider's delivered parcels
minus every record in `cashouts`. That makes double-spending impossible and
prevents a cancelled delivery from leaving an unearned balance. A cashout must
be a whole number, at least 110 taka, and no more than the wallet. There is no
payout provider behind it yet, so records are written with status `paid`.

## Data model

Five collections in database `zapShift` (`DB_NAME` overrides it):

| Collection | Key fields |
| --- | --- |
| `users` | `uid`, `email`, profile, `role`, `blocked`, `riderID`, `riderSince`, `riderInfo` |
| `parcels` | `userEmail`, sender/receiver details, costs, `status`, `paymentStatus`, rider assignment, `pickedUpAt`, `deliveredAt` |
| `riderApplications` | `uid`, `riderID`, personal details, `serviceCenter`, `status` (`pending`/`approved`/`held`/`rejected`) |
| `payments` | `userEmail`, `parcelId`, `amount`, `transactionId`, `paymentMethod`, `status` |
| `cashouts` | `riderID`, `riderEmail`, `amount`, `status`, `createdAt` |

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

Create `.env`:

```ini
PORT=3000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net
PAYMENT_GATEWAY_KEY=sk_test_...
IMGBB_API_KEY=<imgbb key>
```

Optional variables:

| Variable | Purpose |
| --- | --- |
| `DB_NAME` | Database name, defaults to `zapShift` |
| `CLIENT_URL` | Comma-separated CORS allowlist; when unset, all origins are allowed |
| `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` | Admin credentials supplied via environment (for hosts like Render) |

Alternatively place the Firebase service account JSON at
`firebase-adminsdk.json`. It is git-ignored; never commit it. The secret Stripe
key, database URI and imgBB key are also git-ignored and never sent to the
browser.

Scripts: `dev` (nodemon), `start`, `test`.

The first admin must be promoted directly in MongoDB — the API intentionally
has no in-app way to become one:

```js
db.users.updateOne(
  { email: "you@example.com" },
  { $set: { role: "admin", updated_at: new Date() } }
)
```

## Tests

```bash
npm test          # or: node tests/rbac.test.js
```

The suite boots `index.js` against an in-memory fake Mongo and fake Firebase
token verifier and Stripe client. It checks forged/missing tokens, non-admins on
every admin endpoint, self-promotion, changing another account's role, the last
admin rule, ownership scoping on parcels and payments, delivery-status control,
parcel ownership on creation, registration role rules, accounts without a
record, payment amount tampering, and upload authentication.

Note: `index.js` initialises firebase-admin when it loads, so Firebase
credentials (env vars or the local JSON file) must be available for the suite
to start. Without them it exits with a credential error before any check runs.

## Future work

- Move the `paid` transition into a Stripe webhook and stop accepting
  `paymentStatus` in the generic parcel-update endpoint, so a client cannot
  mark a parcel paid without paying.
- Connect a real payout provider for cashouts instead of recording them as
  `paid`.
- Require `CLIENT_URL` in production rather than falling back to open CORS.
- Add unit tests for `earnings.js`, `serviceCenters.js` and the upload proxy;
  the current suite focuses on access control.
- Validate more client-supplied parcel fields on the server (weights, contacts,
  region/centre pairs).

See the [root README](../README.md) for the platform overview and the
[client README](../client/README.md) for the website.
