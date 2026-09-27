/*
 * Boots index.js against an in-memory Mongo, a fake Firebase token verifier and
 * a fake Stripe, then exercises the role based access rules.
 *
 *   npm test
 */
const Module = require("module");
const path = require("path");

const SERVER = path.join(__dirname, "..");
const PORT = Number(process.env.TEST_PORT || 3999);

process.env.PORT = String(PORT);
process.env.PAYMENT_GATEWAY_KEY = "sk_test_fake";
process.env.IMGBB_API_KEY = "fake_imgbb_key";
process.env.MONGODB_URI = "mongodb://127.0.0.1:27017";
process.env.DB_NAME = "zapShiftTest";

const serverRequire = Module.createRequire(path.join(SERVER, "index.js"));
process.env.NODE_PATH = path.join(SERVER, "node_modules");
Module._initPaths();

/* ---------------- fake mongodb ---------------- */
const { ObjectId } = require(path.join(SERVER, "node_modules/mongodb"));

const clone = (value) => {
  if (value instanceof ObjectId || value instanceof Date) return value;
  if (ArrayBuffer.isView(value) || value instanceof RegExp) return value;
  if (value && typeof value === "object")
    return Array.isArray(value)
      ? value.map(clone)
      : Object.fromEntries(
          Object.entries(value).map(([k, v]) => [k, clone(v)])
        );
  return value;
};

const matches = (doc, filter) =>
  Object.entries(filter || {}).every(([key, cond]) => {
    if (key === "$or") return cond.some((sub) => matches(doc, sub));
    const actual = doc[key];
    if (cond instanceof RegExp) return typeof actual === "string" && cond.test(actual);
    if (cond instanceof ObjectId) return String(actual) === String(cond);
    return actual === cond;
  });

const apply = (doc, update) => {
  if (update.$set) Object.assign(doc, clone(update.$set));
  if (update.$unset)
    Object.keys(update.$unset).forEach((key) => delete doc[key]);
  return doc;
};

const sortBy = (key, dir) => (a, b) => {
  const av = a[key] instanceof Date ? a[key].getTime() : a[key];
  const bv = b[key] instanceof Date ? b[key].getTime() : b[key];
  if (av === bv) return 0;
  return (av > bv ? 1 : -1) * dir;
};

class FakeCollection {
  constructor(seed = []) {
    this.docs = seed.map((doc) => ({ ...clone(doc), _id: doc._id || new ObjectId() }));
  }
  async findOne(filter) {
    return clone(this.docs.find((d) => matches(d, filter)) || null);
  }
  find(filter) {
    const rows = this.docs.filter((d) => matches(d, filter));
    return {
      sort: (spec) => {
        const [key, dir] = Object.entries(spec)[0];
        return { toArray: async () => clone(rows.sort(sortBy(key, dir))) };
      },
    };
  }
  async insertOne(doc) {
    const _id = doc._id || new ObjectId();
    this.docs.push({ ...clone(doc), _id });
    return { insertedId: _id };
  }
  async updateOne(filter, update) {
    const doc = this.docs.find((d) => matches(d, filter));
    if (!doc) return { matchedCount: 0, modifiedCount: 0 };
    apply(doc, update);
    return { matchedCount: 1, modifiedCount: 1 };
  }
  async deleteOne(filter) {
    const i = this.docs.findIndex((d) => matches(d, filter));
    if (i === -1) return { deletedCount: 0 };
    this.docs.splice(i, 1);
    return { deletedCount: 1 };
  }
  async deleteMany(filter) {
    const keep = this.docs.filter((d) => !matches(d, filter));
    const deletedCount = this.docs.length - keep.length;
    this.docs = keep;
    return { deletedCount };
  }
  async countDocuments(filter) {
    return this.docs.filter((d) => matches(d, filter)).length;
  }
}

/* the seed data every test runs against */
const OWNER_ID = new ObjectId();
const ADMIN_ID = new ObjectId();
const RIDER_ID = new ObjectId();

const users = new FakeCollection([
  { _id: OWNER_ID, uid: "uid-owner", email: "zapshiftadmin@gmail.com", name: "Owner", role: "admin", riderID: null, created_at: "2026-01-01" },
  { _id: ADMIN_ID, uid: "uid-admin2", email: "second.admin@example.com", name: "Second Admin", role: "admin", riderID: null, created_at: "2026-01-02" },
  { _id: RIDER_ID, uid: "uid-rider", email: "rider@example.com", name: "Rider Guy", role: "rider", riderID: "RDR-AAAA1111", created_at: "2026-01-03" },
]);

const parcels = new FakeCollection([
  { userEmail: "zapshiftadmin@gmail.com", parcelTitle: "Owner parcel", totalCost: 500, status: "pending" },
  { userEmail: "rider@example.com", parcelTitle: "Rider parcel", totalCost: 250, status: "pending" },
]);

const riderApplications = new FakeCollection([
  { email: "rider@example.com", name: "Rider Guy", status: "pending" },
  { riderID: "RDR-AAAA1111", email: "approved@example.com", name: "Approved Rider", status: "approved" },
  { riderID: "RDR-HELD3333", email: "held@example.com", name: "Held Rider", status: "held" },
]);

const payments = new FakeCollection([
  { userEmail: "rider@example.com", amount: 250, status: "paid" },
]);

const collections = {
  users,
  parcels,
  riderApplications,
  payments,
};

const mongoStub = {
  MongoClient: class {
    async connect() {}
    db() {
      return {
        command: async () => ({ ok: 1 }),
        collection: (name) => collections[name],
      };
    }
  },
  ServerApiVersion: { v1: "v1" },
  ObjectId,
};

/* ---------------- fake firebase ---------------- */
const TOKENS = {
  "token-owner": { uid: "uid-owner", email: "zapshiftadmin@gmail.com" },
  "token-admin2": { uid: "uid-admin2", email: "second.admin@example.com" },
  "token-rider": { uid: "uid-rider", email: "rider@example.com" },
  "token-stranger": { uid: "uid-stranger", email: "stranger@example.com" },
  "token-ghost": { uid: "uid-ghost", email: "ghost@example.com" },
};

const firebaseStub = {
  initializeApp: () => {},
  cert: (sa) => sa,
  auth: () => ({
    verifyIdToken: async (token) => {
      if (!TOKENS[token]) throw new Error("invalid token");
      return { ...TOKENS[token], email_verified: true };
    },
  }),
};

const stripeStub = () => ({
  paymentIntents: {
    create: async ({ amount, currency }) => ({
      client_secret: `secret_${amount}_${currency}`,
      id: "pi_fake",
    }),
  },
});

/* ---------------- install the stubs ---------------- */
const stub = (request, exports) => {
  const id = serverRequire.resolve(request);
  require.cache[id] = {
    id,
    filename: id,
    loaded: true,
    exports,
    children: [],
    paths: [],
  };
};

stub("mongodb", mongoStub);
stub("firebase-admin", firebaseStub);
stub("firebase-admin/auth", { getAuth: firebaseStub.auth });
stub("stripe", stripeStub);

require(path.join(SERVER, "index.js"));

/* ---------------- test harness ---------------- */
let pass = 0;
let fail = 0;

const call = (method, url, { token, body } = {}) =>
  new Promise((resolve) => {
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const req = require("http").request(
      { host: "127.0.0.1", port: PORT, method, path: url, headers },
      (res) => {
        let raw = "";
        res.on("data", (c) => (raw += c));
        res.on("end", () => {
          let data = raw;
          try {
            data = JSON.parse(raw);
          } catch {}
          resolve({ status: res.statusCode, data });
        });
      }
    );

    if (body) req.write(typeof body === "string" ? body : JSON.stringify(body));
    req.end();
  });

const check = (label, actual, expected) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    pass++;
    console.log(`  PASS  ${label}`);
  } else {
    fail++;
    console.log(`  FAIL  ${label}`);
    console.log(`        expected ${JSON.stringify(expected)} got ${JSON.stringify(actual)}`);
  }
};

const section = (title) => console.log(`\n${title}`);

const run = async () => {
  await new Promise((r) => setTimeout(r, 900));

  const adminOnly = [
    ["GET", "/api/users"],
    ["GET", "/api/rider-applications"],
    ["PATCH", "/api/rider-applications/" + new ObjectId().toHexString()],
    ["DELETE", "/api/rider-applications"],
  ];

  /* token-rider owns the rider record with riderID RDR-AAAA1111 */
  const riderOnlyUrls = [
    ["GET", "/api/rider/parcels"],
    ["PATCH", "/api/rider/parcels/" + new ObjectId().toHexString() + "/status"],
  ];

  section("1. no token is rejected everywhere");
  for (const [method, url] of [
    ...adminOnly,
    ...riderOnlyUrls,
    ["GET", "/api/users/me"],
    ["GET", "/api/parcels"],
    ["POST", "/api/parcels"],
    ["POST", "/api/rider-applications"],
    ["GET", "/api/payments"],
    ["POST", "/create-payment-intent"],
    ["POST", "/user"],
  ]) {
    const r = await call(method, url);
    check(`${method} ${url} -> 401`, r.status, 401);
  }

  section("2. a forged or expired token is rejected");
  check("GET /api/users with a made up token -> 401", (await call("GET", "/api/users", { token: "not-a-real-token" })).status, 401);
  check("GET /api/users/me with a made up token -> 401", (await call("GET", "/api/users/me", { token: "not-a-real-token" })).status, 401);

  section("3. a plain user is refused by every admin endpoint");
  for (const [method, url] of [
    ...adminOnly,
    ["DELETE", "/api/parcels/" + new ObjectId().toHexString()],
  ]) {
    const r = await call(method, url, { token: "token-rider" });
    check(`${method} ${url} -> 403`, r.status, 403);
  }

  /* token-rider is a rider, so it must not reach the rider panel twice over.
     the rider endpoints are swept with a plain user instead */
  section("3b. a plain user is refused by every rider endpoint");
  for (const [method, url] of riderOnlyUrls) {
    const r = await call(method, url, { token: "token-stranger" });
    check(`${method} ${url} -> 403`, r.status, 403);
  }
  check("an admin is not a rider", (await call("GET", "/api/rider/parcels", { token: "token-owner" })).status, 403);
  check("a rider is not an admin", (await call("GET", "/api/users", { token: "token-rider" })).status, 403);

  section("4. a user cannot promote themselves to admin");
  const selfPromote = await call("PATCH", `/api/users/${RIDER_ID.toHexString()}/role`, {
    token: "token-rider",
    body: { role: "admin" },
  });
  check("PATCH own role -> 403", selfPromote.status, 403);
  check("role in the database is untouched", users.docs.find((d) => String(d._id) === String(RIDER_ID)).role, "rider");

  section("5. a user cannot change anybody else's role");
  const otherPromote = await call("PATCH", `/api/users/${ADMIN_ID.toHexString()}/role`, {
    token: "token-rider",
    body: { role: "user" },
  });
  check("PATCH another account -> 403", otherPromote.status, 403);

  section("6. a user only sees their own data");
  const riderParcels = await call("GET", "/api/parcels", { token: "token-rider" });
  if (!Array.isArray(riderParcels.data)) {
    console.log("  DEBUG raw response:", riderParcels.status, JSON.stringify(riderParcels.data));
  }
  check("GET /api/parcels -> only own", riderParcels.data.map((p) => p.parcelTitle), ["Rider parcel"]);

  const riderSneaks = await call("GET", "/api/parcels?email=zapshiftadmin@gmail.com", { token: "token-rider" });
  check("GET /api/parcels?email=<someone else> -> still only own", riderSneaks.data.map((p) => p.parcelTitle), ["Rider parcel"]);

  const foreignId = parcels.docs[0]._id.toHexString();
  check("GET someone else's parcel -> 404", (await call("GET", `/api/parcels/${foreignId}`, { token: "token-rider" })).status, 404);

  const riderPayments = await call("GET", "/api/payments", { token: "token-rider" });
  check("GET /api/payments -> only own", riderPayments.data.map((p) => p.amount), [250]);

  section("7. a user cannot set a parcel status");
  const ownParcelId = parcels.docs[1]._id.toHexString();
  await call("PUT", `/api/parcels/${ownParcelId}`, { token: "token-rider", body: { status: "delivered" } });
  check("status stays server controlled", parcels.docs[1].status, "pending");

  section("8. a user cannot claim someone else's parcel on create");
  await call("POST", "/api/parcels", {
    token: "token-rider",
    body: { userEmail: "zapshiftadmin@gmail.com", parcelTitle: "Stolen", totalCost: 1, status: "delivered" },
  });
  const created = parcels.docs[parcels.docs.length - 1];
  check("owner is taken from the token", created.userEmail, "rider@example.com");
  check("status is forced to pending", created.status, "pending");

  section("9. an admin sees and does everything");
  const parcelsBefore = parcels.docs.length;
  const allParcels = await call("GET", "/api/parcels", { token: "token-owner" });
  check("GET /api/parcels -> all", allParcels.data.length, parcelsBefore);
  const allUsers = await call("GET", "/api/users", { token: "token-owner" });
  check("GET /api/users -> all", allUsers.data.length, 3);
  check("GET /api/rider-applications -> 200", (await call("GET", "/api/rider-applications", { token: "token-owner" })).status, 200);
  check("GET /api/payments -> all", (await call("GET", "/api/payments", { token: "token-owner" })).data.length, 1);
  check("DELETE /api/parcels/:id -> 200", (await call("DELETE", `/api/parcels/${foreignId}`, { token: "token-owner" })).status, 200);

  section("10. an admin can promote somebody else");
  const promote = await call("PATCH", `/api/users/${RIDER_ID.toHexString()}/role`, {
    token: "token-owner",
    body: { role: "admin" },
  });
  check("rider cannot be made admin -> 403", promote.status, 403);

  const strangerPromoted = await call("PATCH", `/api/users/${RIDER_ID.toHexString()}/role`, {
    token: "token-owner",
    body: { role: "user" },
  });
  check("demote rider -> 200", strangerPromoted.status, 200);
  await call("PATCH", `/api/users/${RIDER_ID.toHexString()}/role`, { token: "token-owner", body: { role: "rider" } });

  section("11. an admin cannot demote themselves or the last admin");
  check("own role change -> 403", (await call("PATCH", `/api/users/${OWNER_ID.toHexString()}/role`, { token: "token-owner", body: { role: "user" } })).status, 403);

  const demoteOtherAdmin = await call("PATCH", `/api/users/${ADMIN_ID.toHexString()}/role`, {
    token: "token-owner",
    body: { role: "user" },
  });
  check("demoting the other admin is allowed while two exist", demoteOtherAdmin.status, 200);
  const lastAdmin = await call("PATCH", `/api/users/${ADMIN_ID.toHexString()}/role`, {
    token: "token-admin2",
    body: { role: "user" },
  });
  check("the only remaining admin cannot be demoted -> 403", lastAdmin.status, 403);

  section("12. registration cannot hand itself a role");
  const before = users.docs.length;
  const reg = await call("POST", "/user", {
    token: "token-stranger",
    body: { email: "stranger@example.com", name: "Stranger", role: "admin", riderID: "RDR-HACKED", riderInfo: { nid: "1234" } },
  });
  check("POST /user -> 200", reg.status, 200);
  const stranger = users.docs[users.docs.length - 1];
  check("a new record was written", users.docs.length, before + 1);
  check("role is forced to user", stranger.role, "user");
  check("riderID is forced to null", stranger.riderID, null);
  check("riderInfo is not accepted", stranger.riderInfo, undefined);
  check("email comes from the token", stranger.email, "stranger@example.com");

  section("13. an account with no database record is never an admin");
  check("GET /api/users/me -> 404", (await call("GET", "/api/users/me", { token: "token-ghost" })).status, 404);
  for (const [method, url] of adminOnly) {
    check(`${method} ${url} -> 403`, (await call(method, url, { token: "token-ghost" })).status, 403);
  }
  check("and it is not treated as an admin on its own data", (await call("GET", "/api/users", { token: "token-ghost" })).status, 403);

  section("14. the payment amount comes from the stored parcel");
  const ownedByAdmin = { _id: new ObjectId(), userEmail: "zapshiftadmin@gmail.com", parcelTitle: "Pay me", totalCost: 500 };
  parcels.docs.push(ownedByAdmin);

  const intent = await call("POST", "/create-payment-intent", {
    token: "token-owner",
    body: { amountInCents: 1, parcelInfo: { _id: ownedByAdmin._id.toHexString(), totalCost: 1 } },
  });
  check("a tampered amount is ignored, 500 becomes 50000", intent.data.clientSecret, "secret_50000_usd");

  const tamper = await call("POST", "/create-payment-intent", {
    token: "token-rider",
    body: { amountInCents: 1, parcelInfo: { _id: ownedByAdmin._id.toHexString(), totalCost: 1 } },
  });
  check("paying for someone else's parcel -> 404", tamper.status, 404);

  const badId = await call("POST", "/create-payment-intent", {
    token: "token-rider",
    body: { amountInCents: 1, parcelInfo: { _id: "not-an-id" } },
  });
  check("a bogus parcel id -> 400", badId.status, 400);

  section("15. rider assignment is an admin only decision");
  const toAssign = { _id: new ObjectId(), userEmail: "rider@example.com", parcelTitle: "Needs a rider" };
  parcels.docs.push(toAssign);
  const toAssignId = toAssign._id.toHexString();

  const assignUrl = `/api/parcels/${toAssignId}/rider`;
  check("PATCH assign with no token -> 401", (await call("PATCH", assignUrl)).status, 401);
  check("PATCH assign as a plain user -> 403", (await call("PATCH", assignUrl, { token: "token-rider", body: { riderID: "RDR-AAAA1111" } })).status, 403);
  check("no rider was written", toAssign.riderID, undefined);

  const assignBlocked = await call("PUT", `/api/parcels/${toAssignId}`, {
    token: "token-rider",
    body: { riderID: "RDR-AAAA1111" },
  });
  check("a plain user cannot sneak a rider in through PUT -> 200", assignBlocked.status, 200);
  check("the rider field is still server controlled", toAssign.riderID, undefined);

  const held = await call("PATCH", assignUrl, { token: "token-owner", body: { riderID: "RDR-HELD3333" } });
  check("a rider that is not approved -> 400", held.status, 400);
  const ghost = await call("PATCH", assignUrl, { token: "token-owner", body: { riderID: "RDR-NOPE0000" } });
  check("an unknown rider -> 404", ghost.status, 404);

  const assigned = await call("PATCH", assignUrl, { token: "token-owner", body: { riderID: "RDR-AAAA1111" } });
  check("an admin can assign an approved rider -> 200", assigned.status, 200);
  check("riderID is stored", assigned.data.riderID, "RDR-AAAA1111");
  check("the rider name is stored for display", assigned.data.riderName, "Approved Rider");

  const unassigned = await call("PATCH", assignUrl, { token: "token-owner", body: { riderID: null } });
  check("an admin can unassign -> 200", unassigned.status, 200);
  check("riderID is cleared", unassigned.data.riderID, undefined);

  check("PATCH assign on a missing parcel -> 404", (await call("PATCH", `/api/parcels/${new ObjectId().toHexString()}/rider`, { token: "token-owner", body: { riderID: "RDR-AAAA1111" } })).status, 404);
  check("PATCH assign with a bad id -> 400", (await call("PATCH", "/api/parcels/nope/rider", { token: "token-owner", body: { riderID: "RDR-AAAA1111" } })).status, 400);

  section("16. a rider only sees the parcels assigned to them");
  const mine = { _id: new ObjectId(), userEmail: "customer@example.com", parcelTitle: "Rider job", status: "pending", riderID: "RDR-AAAA1111" };
  const notMine = { _id: new ObjectId(), userEmail: "other@example.com", parcelTitle: "Somebody else's job", status: "pending", riderID: "RDR-HELD3333" };
  const orphan = { _id: new ObjectId(), userEmail: "nobody@example.com", parcelTitle: "Unassigned job", status: "pending" };
  parcels.docs.push(mine, notMine, orphan);

  const deliveries = await call("GET", "/api/rider/parcels", { token: "token-rider" });
  check("GET /api/rider/parcels -> 200", deliveries.status, 200);
  check("only this rider's parcels come back", deliveries.data.map((p) => p.parcelTitle), ["Rider job"]);
  check("another rider's parcel is not visible", deliveries.data.some((p) => p.parcelTitle === "Somebody else's job"), false);
  check("an unassigned parcel is not visible", deliveries.data.some((p) => p.parcelTitle === "Unassigned job"), false);

  const statusUrl = (doc) => `/api/rider/parcels/${doc._id.toHexString()}/status`;

  const advanced = await call("PATCH", statusUrl(mine), { token: "token-rider", body: { status: "picked_up" } });
  check("a rider can move their own parcel -> 200", advanced.status, 200);
  check("the status is stored", advanced.data.status, "picked_up");

  check("a rider cannot move somebody else's parcel -> 404", (await call("PATCH", statusUrl(notMine), { token: "token-rider", body: { status: "picked_up" } })).status, 404);
  check("somebody else's parcel is untouched", notMine.status, "pending");
  check("a rider cannot move an unassigned parcel -> 404", (await call("PATCH", statusUrl(orphan), { token: "token-rider", body: { status: "picked_up" } })).status, 404);

  check("a bogus status -> 400", (await call("PATCH", statusUrl(mine), { token: "token-rider", body: { status: "teleported" } })).status, 400);
  check("a rider cannot set pending, that is an admin call -> 400", (await call("PATCH", statusUrl(mine), { token: "token-rider", body: { status: "pending" } })).status, 400);
  check("a bogus parcel id -> 400", (await call("PATCH", "/api/rider/parcels/nope/status", { token: "token-rider", body: { status: "picked_up" } })).status, 400);
  check("a missing parcel -> 404", (await call("PATCH", `/api/rider/parcels/${new ObjectId().toHexString()}/status`, { token: "token-rider", body: { status: "picked_up" } })).status, 404);

  const delivered = await call("PATCH", statusUrl(mine), { token: "token-rider", body: { status: "delivered" } });
  check("a rider can finish the job -> 200", delivered.status, 200);
  check("the parcel reads as delivered", delivered.data.status, "delivered");

  const reassigned = await call("PATCH", `/api/parcels/${mine._id.toHexString()}/rider`, { token: "token-owner", body: { riderID: null } });
  check("an admin can take the job back -> 200", reassigned.status, 200);
  const afterUnassign = await call("GET", "/api/rider/parcels", { token: "token-rider" });
  check("an unassigned parcel leaves the rider queue", afterUnassign.data.length, 0);

  section("17. image upload needs a token");
  check("POST /api/upload-image with no token -> 401", (await call("POST", "/api/upload-image")).status, 401);

  console.log(`\n${pass} passed, ${fail} failed\n`);
  process.exit(fail === 0 ? 0 : 1);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
