const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const multer = require("multer");
const crypto = require("crypto");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const admin = require("firebase-admin");
const { getAuth } = require("firebase-admin/auth");
const { getEarning } = require("./earnings.js");

dotenv.config();

const stripe = require("stripe")(process.env.PAYMENT_GATEWAY_KEY);
const app = express();
const port = process.env.PORT || 3000;

// middleware
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use(cors(allowedOrigins.length ? { origin: allowedOrigins } : undefined));
app.use(express.json());

// firebase token initializing
function getFirebaseCredential() {
  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } =
    process.env;
  if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
    return admin.cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    });
  }
  try {
    return admin.cert(require("./firebase-adminsdk.json"));
  } catch (err) {
    throw new Error(
      "Firebase credentials failed: " +
        err.message +
        ". Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY (Render), or add server/firebase-adminsdk.json (local)."
    );
  }
}

admin.initializeApp({
  credential: getFirebaseCredential(),
});

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ==================== AUTHENTICATION & AUTHORIZATION ====================

// the roles that exist in this system, "admin" is the only one that unlocks
// the admin dashboard
const ROLES = {
  USER: "user",
  RIDER: "rider",
  ADMIN: "admin",
};

// roles an admin is allowed to hand out
const ALLOWED_ROLES = Object.values(ROLES);

/* role of the caller, as stored on the server. never trust the role that the
   client or the id token claims, always read it from the database */
const isAdmin = (user) => user?.role === ROLES.ADMIN;

/* role of the caller for the rider panel, the same rule, read from the database */
const isRider = (user) => user?.role === ROLES.RIDER;

/* case insensitive exact email match, so an account cannot be impersonated by
   changing the case of its address */
const emailMatcher = (email) =>
  new RegExp(`^${String(email).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");

/* narrow a filter down to the caller's own rows. admins keep full visibility,
   everybody else is pinned to their own account no matter what they ask for */
const scopeToOwner = (req, filter = {}, field = "userEmail") =>
  isAdmin(req.user) ? filter : { ...filter, [field]: emailMatcher(req.auth.email) };

/*
 * Authentication. Verifies the Firebase id token, then loads the caller's own
 * database record so that authorization is always decided by the role stored
 * server side. A token on its own only proves *who* someone is.
 */
const requireAuth = async (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || "").split(" ");

  if (!/^Bearer$/i.test(scheme) || !token) {
    return res.status(401).json({ message: "Unauthorized Access" });
  }

  let decoded;

  try {
    // the second argument also rejects tokens of deleted or disabled accounts
    decoded = await getAuth().verifyIdToken(token, true);
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  if (!decoded.email) {
    return res.status(403).json({ message: "This account has no email address" });
  }

  if (!userCollection) {
    return res.status(503).json({ message: "Database unavailable" });
  }

  const email = decoded.email.toLowerCase();
  const uid = decoded.uid;

  const record = await userCollection.findOne(
    { $or: [{ uid }, { email }] },
    { projection: { password: 0 } }
  );

  /* a blocked account holds a valid token but is not allowed to act on it. this
     is checked here rather than per route, so no endpoint can be forgotten.
     blocked: true tells the client this is a block and not a role problem, so
     it can end the session instead of just refusing one request */
  if (record?.blocked === true) {
    return res.status(403).json({
      blocked: true,
      message: "Your account has been blocked. Contact an admin.",
    });
  }

  req.decoded = decoded;
  req.auth = { uid, email, emailVerified: decoded.email_verified === true };
  // an account with no record yet is always a plain user, never an admin
  req.user = record
    ? { ...record, email, role: record.role || ROLES.USER }
    : { uid, email, role: ROLES.USER, pendingRegistration: true };
  req.isAdmin = isAdmin(req.user);

  next();
};

/*
 * Authorization. Runs after requireAuth and rejects anyone whose stored role is
 * not on the allow list. Mount it as requireRole("admin") on admin only routes.
 */
const requireRole = (...allowed) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized Access" });
  }

  if (!allowed.includes(req.user.role)) {
    return res.status(403).json({
      message: "You do not have permission to perform this action",
    });
  }

  next();
};

// the guard for every admin dashboard endpoint
const adminOnly = [requireAuth, requireRole(ROLES.ADMIN)];

// the guard for every rider dashboard endpoint
const riderOnly = [requireAuth, requireRole(ROLES.RIDER)];

/* the parcel status values a rider is allowed to move a parcel through. an
   admin sets any of them, a rider only drives its delivery forward */
const RIDER_STATUSES = ["picked_up", "in_transit", "delivered", "cancelled"];

/* the delivery status a parcel sits at between the sender handing it in and the
   rider collecting it. it is a step of its own so an admin can see at a glance
   which parcels are booked and matched to a rider but have not moved yet */
const RIDER_ASSIGNED_STATUS = "rider_assigned";

/* the smallest amount a rider may take out in one go. a cashout below this is
   refused on the server, so the rule holds however the request was made */
const MIN_CASHOUT = 110;

app.post("/api/upload-image", requireAuth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const key = process.env.IMGBB_API_KEY;
    if (!key) {
      return res.status(500).json({ message: "IMGBB_API_KEY is not set" });
    }

    const formData = new FormData();
    formData.append(
      "image",
      new Blob([req.file.buffer], { type: req.file.mimetype }),
      req.file.originalname || "upload.png",
    );

    const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, {
      method: "POST",
      body: formData,
    });
    const data = await imgbbRes.json();

    if (!data.success) {
      return res
        .status(400)
        .json({
          message: data.error?.message || "Image upload to imgbb failed",
        });
    }

    console.log("imgbb link:", data.data.url);
    res.json({ url: data.data.url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const dbName = process.env.DB_NAME || "zapShift";
let parcelsCollection;
let riderApplicationsCollection;
let paymentsCollection;
let cashoutsCollection;
let userCollection;

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({
      ping: 1,
    });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );

    const db = client.db(dbName);
    parcelsCollection = db.collection("parcels");
    riderApplicationsCollection = db.collection("riderApplications");
    paymentsCollection = db.collection("payments");
    cashoutsCollection = db.collection("cashouts");
    userCollection = db.collection("users");

    /* every cashout lookup is by rider, newest first. the index only makes those
       reads fast, so a database that refuses to build it is logged and left
       alone rather than taking the whole server down with it */
    try {
      await cashoutsCollection.createIndex({ riderID: 1, createdAt: -1 });
    } catch (error) {
      console.warn("cashouts index not created:", error.message);
    }
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

run().then(() => {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
});


// generate a unique rider id like RDR-1A2B3C4D
// ids are reserved on the application, so that collection is the one to check
const generateRiderId = async () => {
  for (let attempt = 0; attempt < 5; attempt++) {
    const riderID = `RDR-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    const [onApplication, onUser] = await Promise.all([
      riderApplicationsCollection.findOne({ riderID }),
      userCollection.findOne({ riderID }),
    ]);

    if (!onApplication && !onUser) return riderID;
  }

  throw new Error("Could not generate a unique rider id");
};

/* The hub a rider works out of. The application form used to call this field
   `warehouse`, so applications written before the rename still carry the old
   name. Both are read here and the answer is always stored as `serviceCenter`,
   so one name is used from here on. */
const getApplicationServiceCenter = (application) =>
  application?.serviceCenter || application?.warehouse || null;

// promote an approved applicant to role "rider" and give them a rider id
const promoteToRider = async (application) => {
  const user = await userCollection.findOne(
    application.uid
      ? {
          $or: [{ uid: application.uid }, { email: application.email }],
        }
      : { email: application.email }
  );

  if (!user) {
    return { promoted: false, reason: "no user record" };
  }

  const serviceCenter = getApplicationServiceCenter(application);

  // already a rider, never hand out a second id
  if (user.role === "rider" && user.riderID) {
    /* the snapshot is still topped up when it is missing the service center, so
       a rider approved before the field existed picks it up the moment an admin
       approves their application again */
    if (serviceCenter && !user.riderInfo?.serviceCenter) {
      await userCollection.updateOne(
        { _id: user._id },
        { $set: { "riderInfo.serviceCenter": serviceCenter } }
      );
    }

    return { promoted: false, reason: "already a rider", riderID: user.riderID };
  }

  // reuse the id reserved on the application so the rider keeps one id
  const riderID = user.riderID || application.riderID || (await generateRiderId());

  await userCollection.updateOne(
    { _id: user._id },
    {
      $set: {
        role: "rider",
        riderID,
        riderSince: new Date(),
        riderInfo: {
          name: application.name,
          email: application.email,
          age: application.age,
          region: application.region,
          nid: application.nid,
          contact: application.contact,
          /* where the rider works out of. every earning is measured against this
             service center, so it is snapshotted here rather than looked up each
             time a parcel is read */
          serviceCenter,
        },
      },
    }
  );

  return { promoted: true, riderID };
};

// server running api

app.get("/", (req, res) => {
  res.send("Server is running ");
});

//=============User CRUD===============
app.post("/user", requireAuth, async (req, res) => {
  try {
    const email = req.auth.email;
    const userExist = await userCollection.findOne({ email });
    if (userExist) {
      return res.status(200).send({ message: "user already exists" });
    }

    /* the record is written field by field on purpose. role, rider id and the
       rider block come from the server, so a crafted request body can never
       hand itself the admin role */
    const user = {
      uid: req.auth.uid,
      email,
      name: req.body.name || "",
      phone: req.body.phone || "",
      photoURL: req.body.photoURL || "",
      role: ROLES.USER,
      riderID: null,
      blocked: false,
      created_at: req.body.created_at || new Date().toISOString(),
      last_log_in: new Date().toISOString(),
    };

    const result = await userCollection.insertOne(user);
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

/* the signed in user's own record, used by the client to read their role */
app.get("/api/users/me", requireAuth, async (req, res) => {
  try {
    const user = await userCollection.findOne(
      { $or: [{ uid: req.auth.uid }, { email: req.auth.email }] },
      { projection: { password: 0 } }
    );

    if (!user) {
      return res.status(404).json({ message: "No user record for this account" });
    }

    /* The status an admin decided on lives on the application, not on the user,
       because a held rider is still a rider. It is joined on here so a rider
       reading their own profile sees whether they are on the road or on hold,
       instead of the page having to guess from the role alone. A rider is matched
       on the id they were promoted with, so an old application they may have filed
       years ago can never speak for the one that is live. */
    const application = await riderApplicationsCollection.findOne(
      user.riderID
        ? { riderID: user.riderID }
        : { $or: [{ uid: req.auth.uid }, { email: req.auth.email }] },
      { sort: { createdAt: -1 }, projection: { status: 1 } }
    );

    res.json({ ...user, riderStatus: application?.status || null });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// GET all users, for the admin administration page
app.get("/api/users", ...adminOnly, async (req, res) => {
  try {
    const users = await userCollection
      .find({}, { projection: { password: 0 } })
      .sort({ created_at: -1 })
      .toArray();

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH change a role, admin only
app.patch("/api/users/:id/role", ...adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({
        message: `Role must be one of: ${ALLOWED_ROLES.join(", ")}`,
      });
    }

    const targetId = new ObjectId(id);
    const target = await userCollection.findOne({ _id: targetId });

    if (!target) {
      return res.status(404).json({ message: "User not found" });
    }

    /* no self promotion, and no way to lock yourself out of the panel */
    if (targetId.equals(req.user._id)) {
      return res.status(403).json({
        message: "You cannot change your own role",
      });
    }

    /* the rider role is a one way door. the administration page never offers a
       rider anything else, and a crafted request is refused here as well, so a
       rider can neither be made an admin nor be pushed back to a normal user */
    if (target.role === ROLES.RIDER && role !== ROLES.RIDER) {
      return res.status(403).json({
        message: "A rider cannot be set as admin or as a normal user",
      });
    }

    // never remove the last admin, that would lock everyone out of the panel
    if (target.role === ROLES.ADMIN && role !== ROLES.ADMIN) {
      const { count } = await userCollection.countDocuments({
        role: ROLES.ADMIN,
      });

      if (count <= 1) {
        return res.status(403).json({
          message: "The last admin cannot be demoted",
        });
      }
    }

    await userCollection.updateOne(
      { _id: targetId },
      {
        $set: {
          role,
          updated_at: new Date(),
        },
      }
    );

    const updated = await userCollection.findOne(
      { _id: targetId },
      { projection: { password: 0 } }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* PATCH block or unblock an account, admin only. the flag is read by requireAuth
   on every request, so a blocked account is turned away everywhere at once */
app.patch("/api/users/:id/block", ...adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { blocked } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    if (typeof blocked !== "boolean") {
      return res.status(400).json({ message: "blocked must be true or false" });
    }

    const targetId = new ObjectId(id);
    const target = await userCollection.findOne({ _id: targetId });

    if (!target) {
      return res.status(404).json({ message: "User not found" });
    }

    /* you cannot lock yourself out, and an admin account is never blocked, or
       the panel could end up with nobody able to undo it */
    if (targetId.equals(req.user._id)) {
      return res.status(403).json({ message: "You cannot block your own account" });
    }

    if (target.role === ROLES.ADMIN) {
      return res.status(403).json({ message: "An admin account cannot be blocked" });
    }

    await userCollection.updateOne(
      { _id: targetId },
      { $set: { blocked, updated_at: new Date() } }
    );

    const updated = await userCollection.findOne(
      { _id: targetId },
      { projection: { password: 0 } }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============ PARCEL CRUD ============

/* GET parcels. an admin sees the whole platform, everybody else is pinned to
   their own parcels and any ?email they pass is ignored */
app.get("/api/parcels", requireAuth, async (req, res) => {
  try {
    const { email } = req.query;

    const filter = isAdmin(req.user) && email
      ? { userEmail: emailMatcher(email) }
      : scopeToOwner(req);

    const parcels = await parcelsCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();
    res.json(parcels);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// GET single parcel, own parcels only unless you are an admin
app.get("/api/parcels/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid parcel id" });
    }

    const parcel = await parcelsCollection.findOne(
      scopeToOwner(req, { _id: new ObjectId(id) })
    );

    /* 404 rather than 403, so the response does not confirm that someone
       else's parcel exists */
    if (!parcel) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    res.json(parcel);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// POST create parcel, always recorded against the signed in account
app.post("/api/parcels", requireAuth, async (req, res) => {
  try {
    const data = req.body;

    const { _id, createdAt, updatedAt, userEmail, ...rest } = data;

    const parcel = {
      ...rest,
      userEmail: req.auth.email,
      status: isAdmin(req.user) ? data.status || "pending" : "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await parcelsCollection.insertOne(parcel);

    res.status(201).json({ _id: result.insertedId, ...parcel });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// PUT update parcel, own parcels only unless you are an admin
app.put("/api/parcels/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid parcel id" });
    }

    // ownership, id and timestamps stay under server control
    const { _id, createdAt, userEmail, ...updateData } = req.body;

    if (!isAdmin(req.user)) {
      delete updateData.status;

      /* rider assignment is an admin decision, never a customer one */
      delete updateData.riderID;
      delete updateData.riderName;
      delete updateData.riderEmail;
      delete updateData.assignedAt;
    }

    const result = await parcelsCollection.updateOne(
      scopeToOwner(req, { _id: new ObjectId(id) }),
      { $set: { ...updateData, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    const updated = await parcelsCollection.findOne({
      _id: new ObjectId(id),
    });

    res.json(updated);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// DELETE parcel, admin only
app.delete("/api/parcels/:id", ...adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid parcel id" });
    }

    const result = await parcelsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    res.json({ message: "Parcel deleted successfully" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

/* PATCH assign or unassign the rider on a parcel, admin only.
   the assignment is stored with the rider's name and the time it happened, so a
   parcel always says who was given it and when, not just their rider id.
   body: { riderID: "RDR-XXXXXXXX" | null } */
app.patch("/api/parcels/:id/rider", ...adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid parcel id" });
    }

    const { riderID = null } = req.body || {};

    const existing = await parcelsCollection.findOne({ _id: new ObjectId(id) });

    if (!existing) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    /* null or an empty string clears the assignment */
    if (!riderID) {
      /* a parcel that was only waiting on a rider goes back to waiting for one.
         a parcel that is already moving keeps the status it has, so unassigning
         never throws away how far it has got */
      const requeued = existing.status === RIDER_ASSIGNED_STATUS;

      await parcelsCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            ...(requeued ? { status: "pending" } : {}),
            updatedAt: new Date(),
          },
          $unset: { riderID: "", riderName: "", riderEmail: "", assignedAt: "" },
        }
      );

      const updated = await parcelsCollection.findOne({ _id: new ObjectId(id) });
      return res.json(updated);
    }

    /* the money has to be in before anyone carries the parcel. a parcel that has
       not been paid for stays unassigned, so it can never reach a rider and be
       delivered for free */
    if (existing.paymentStatus !== "paid") {
      return res.status(400).json({
        message:
          "Payment is not confirmed for this parcel. Ask the customer to pay before assigning a rider.",
      });
    }

    const rider = await riderApplicationsCollection.findOne({ riderID });

    if (!rider) {
      return res.status(404).json({ message: "Rider not found" });
    }

    /* only riders the admin has approved can be put on the road */
    if (rider.status !== "approved") {
      return res
        .status(400)
        .json({ message: `Rider ${riderID} is not approved` });
    }

    await parcelsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          riderID: rider.riderID,
          riderName: rider.name || null,
          riderEmail: rider.email || null,
          assignedAt: new Date(),
          updatedAt: new Date(),
          /* a parcel still in the booking queue moves on to waiting for its
             rider. one already on the road keeps the status it has, so putting a
             different rider on a moving parcel does not restart the job */
          ...(existing.status === "pending"
            ? { status: RIDER_ASSIGNED_STATUS }
            : {}),
        },
      }
    );

    const updated = await parcelsCollection.findOne({ _id: new ObjectId(id) });
    res.json(updated);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// ============ RIDER DASHBOARD ============

/* the service center a rider works out of, read from their own server side
   record. this is what every earning is measured against, so it is never taken
   from the request. a record that never had a service center yields null and the
   earning rules fall back to the lowest tier */
const getRiderLocation = (user) => {
  const riderInfo = user?.riderInfo;

  if (!riderInfo) return null;

  return {
    region: riderInfo.region || null,
    serviceCenter: riderInfo.serviceCenter || riderInfo.warehouse || null,
  };
};

/*
 * Stamps the earning onto one of a rider's own parcels.
 *
 * The amount, the percentage and the tier are all decided here, so the client is
 * only ever handed a figure it did not work out itself. The service center and
 * region the parcel is being delivered to come back too, because the rider
 * needs to see why a delivery paid what it paid.
 */
const withEarning = (parcel, rider) => {
  if (!parcel) return parcel;

  return {
    ...parcel,
    riderServiceCenter: rider?.serviceCenter || null,
    riderRegion: rider?.region || null,
    earning: getEarning(parcel, rider),
  };
};

/* GET the parcels an admin has handed to this rider, newest first.
   the rider id comes from the caller's own server side record, so a rider can
   never ask for somebody else's deliveries by sending a different id */
app.get("/api/rider/parcels", ...riderOnly, async (req, res) => {
  try {
    const riderID = req.user.riderID;

    /* approved riders always carry a riderID, but a record that lost it must
       see an empty list rather than everybody's parcels */
    if (!riderID) {
      return res.json([]);
    }

    const parcels = await parcelsCollection
      .find({ riderID })
      .sort({ createdAt: -1 })
      .toArray();

    const rider = getRiderLocation(req.user);

    res.json(parcels.map((parcel) => withEarning(parcel, rider)));
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

/* PATCH move one of this rider's own assigned parcels along its delivery.
   body: { status: "picked_up" | "in_transit" | "delivered" | "cancelled" } */
app.patch("/api/rider/parcels/:id/status", ...riderOnly, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid parcel id" });
    }

    const { status } = req.body;

    if (!RIDER_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Status must be one of: ${RIDER_STATUSES.join(", ")}`,
      });
    }

    const riderID = req.user.riderID;

    if (!riderID) {
      return res.status(404).json({ message: "No deliveries assigned to you" });
    }

    /* the rider id is part of the filter, so a parcel that is not theirs is
       simply not found and nothing outside their own work can be touched */
    const result = await parcelsCollection.updateOne(
      { _id: new ObjectId(id), riderID },
      {
        $set: {
          status,
          updatedAt: new Date(),
          /* the moment the parcel was actually handed over is stamped once and
             kept. the earnings page groups money by day, week, month and year,
             and a delivery that moves again later must not change which day it
             was earned on */
          ...(status === "delivered" ? { deliveredAt: new Date() } : {}),
          /* the same for the collection. a parcel can be collected more than once
             on a cross region route, so this is the latest pickup rather than the
             first */
          ...(status === "picked_up" ? { pickedUpAt: new Date() } : {}),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    const updated = await parcelsCollection.findOne({ _id: new ObjectId(id) });

    /* the earning is recomputed here rather than copied from the document,
       because a rider only earns once the parcel is actually delivered. the
       client swaps this response into its list, so the amount has to be right
       at the moment the status changes */
    res.json(withEarning(updated, getRiderLocation(req.user)));
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});


// ============ RIDER CASHOUT ============

/*
 * A rider's money, worked out on the server.
 *
 * Earned is the sum of the earnings on every parcel this rider actually
 * delivered, cashed out is the sum of the cashouts already on their record, and
 * the wallet is what is left of one after the other. Nothing here comes from the
 * request, so a rider cannot ask for money they have not earned or take the same
 * money twice.
 */
const getRiderMoney = async (user) => {
  const riderID = user?.riderID;

  if (!riderID) {
    return { earned: 0, cashedOut: 0, wallet: 0, minCashout: MIN_CASHOUT };
  }

  const rider = getRiderLocation(user);

  const parcels = await parcelsCollection.find({ riderID }).toArray();

  const earned = parcels.reduce((total, parcel) => {
    const earning = getEarning(parcel, rider);

    return total + (earning.settled ? Number(earning.amount) || 0 : 0);
  }, 0);

  const cashouts = await cashoutsCollection.find({ riderID }).toArray();

  const cashedOut = cashouts.reduce(
    (total, cashout) => total + (Number(cashout.amount) || 0),
    0
  );

  return {
    earned,
    cashedOut,
    /* the wallet can never read below zero. if a delivery is ever cancelled after
       it was counted, the floor stops the balance going backwards */
    wallet: Math.max(0, earned - cashedOut),
    minCashout: MIN_CASHOUT,
  };
};

/* GET this rider's own cashout history and the figures behind it */
app.get("/api/rider/cashouts", ...riderOnly, async (req, res) => {
  try {
    const riderID = req.user.riderID;

    if (!riderID) {
      return res.json({
        records: [],
        earned: 0,
        cashedOut: 0,
        wallet: 0,
        minCashout: MIN_CASHOUT,
      });
    }

    const [records, money] = await Promise.all([
      cashoutsCollection
        .find({ riderID })
        .sort({ createdAt: -1 })
        .toArray(),
      getRiderMoney(req.user),
    ]);

    res.json({ records, ...money });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

/* POST take money out of the wallet, rider only.
   body: { amount: 110 }
   the amount leaves the wallet because the balance is earned minus every cashout
   on the record, so a cashout needs no separate balance to keep in step */
app.post("/api/rider/cashouts", ...riderOnly, async (req, res) => {
  try {
    const riderID = req.user.riderID;

    if (!riderID) {
      return res.status(404).json({ message: "No rider record for this account" });
    }

    const amount = Number(req.body?.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: "Enter an amount greater than zero" });
    }

    /* money is stored in whole taka, so a fraction is refused rather than quietly
       rounded into an amount nobody asked for */
    const whole = Math.round(amount);

    if (whole !== amount) {
      return res.status(400).json({ message: "Cashout must be a whole number" });
    }

    if (whole < MIN_CASHOUT) {
      return res.status(400).json({
        message: `The smallest cashout is ${MIN_CASHOUT} taka`,
      });
    }

    const money = await getRiderMoney(req.user);

    if (whole > money.wallet) {
      return res.status(400).json({
        message: `That is more than you have in your wallet. You can cash out ${money.wallet} taka`,
      });
    }

    const record = {
      riderID,
      riderEmail: req.auth.email,
      amount: whole,
      /* there is no payout provider wired up, so a cashout is recorded as money
         taken out rather than money requested. wiring a provider in later means
         moving this to "requested" and settling it on the provider's webhook */
      status: "paid",
      createdAt: new Date(),
    };

    const result = await cashoutsCollection.insertOne(record);

    res.status(201).json({
      record: { _id: result.insertedId, ...record },
      ...(await getRiderMoney(req.user)),
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});


// ============ RIDER APPLICATION ============

// GET all rider applications, admin only
app.get("/api/rider-applications", ...adminOnly, async (req, res) => {
  try {
    const applications = await riderApplicationsCollection
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    /* older applications kept the hub under `warehouse`, so it is restated as
       `serviceCenter` on the way out. the admin pages only ever read one name */
    res.json(
      applications.map((application) => ({
        ...application,
        serviceCenter: getApplicationServiceCenter(application),
      }))
    );
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// POST apply to become a rider, always filed under the signed in account
app.post("/api/rider-applications", requireAuth, async (req, res) => {
  try {
    const data = req.body;

    /* The name field on the form only mirrors the account, so the browser sends
       whatever the account happens to hold, and a firebase account can hold
       nothing at all for an email signup. Falling back to the record
       requireAuth already loaded, then to the address, means an application is
       never nameless. */
    const name =
      String(data.name || "").trim() ||
      String(req.user.name || "").trim() ||
      req.auth.email.split("@")[0];

    const application = {
      uid: req.auth.uid,
      riderID: data.riderID || (await generateRiderId()),
      name,
      age: data.age,
      email: req.auth.email,
      region: data.region,
      nid: data.nid,
      contact: data.contact,
      /* the service center the applicant wants to work from. it decides what
         they are paid on every parcel */
      serviceCenter: data.serviceCenter,
      subscribeEmail: data.subscribeEmail || "",
      // only an admin can decide the outcome, an applicant always starts pending
      status: "pending",
      createdAt: new Date(),
    };

    const result = await riderApplicationsCollection.insertOne(application);

    res.status(201).json({ _id: result.insertedId, ...application });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// PATCH update rider application status, admin only. approving promotes the user
app.patch("/api/rider-applications/:id", ...adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid application id" });
    }

    const { status } = req.body;

    if (!["pending", "approved", "held", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const result = await riderApplicationsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Application not found" });
    }

    const updated = await riderApplicationsCollection.findOne({
      _id: new ObjectId(id),
    });

    // approving promotes the user to role "rider" using the id on the application
    if (status === "approved") {
      const { promoted, riderID, reason } = await promoteToRider(updated);

      if (promoted) {
        await riderApplicationsCollection.updateOne(
          { _id: updated._id },
          { $set: { riderID } },
        );
        updated.riderID = riderID;
      } else {
        updated.roleUpdate = reason;
      }
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE all rider applications, admin only
app.delete("/api/rider-applications", ...adminOnly, async (req, res) => {
  try {
    const result = await riderApplicationsCollection.deleteMany({});
    res.json({
      message: "All rider applications deleted",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============ PAYMENT HISTORY ============

/* GET payments. an admin sees every payment, everybody else only their own */
app.get("/api/payments", requireAuth, async (req, res) => {
  try {
    const { email } = req.query;

    const filter = isAdmin(req.user) && email
      ? { userEmail: emailMatcher(email) }
      : scopeToOwner(req);

    const payments = await paymentsCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create payment record, always recorded against the signed in account
app.post("/api/payments", requireAuth, async (req, res) => {
  try {
    const data = req.body;

    const { _id, createdAt, userEmail, ...rest } = data;

    const payment = {
      ...rest,
      userEmail: req.auth.email,
      status: "paid",
      createdAt: new Date(),
    };

    const result = await paymentsCollection.insertOne(payment);

    res.status(201).json({ _id: result.insertedId, ...payment });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// ============ Payment Intend ============


/* the amount always comes from the stored parcel, never from the request body,
   otherwise anyone could charge a customer one cent */
app.post("/create-payment-intent", requireAuth, async (req, res) => {
  const parcelId = req.body?.parcelInfo?._id;

  if (!ObjectId.isValid(parcelId)) {
    return res.status(400).send({ message: "Invalid parcel id" });
  }

  const parcel = await parcelsCollection.findOne(
    scopeToOwner(req, { _id: new ObjectId(parcelId) })
  );

  if (!parcel) {
    return res.status(404).send({ message: "Parcel not found" });
  }

  const amountInCents = Math.round(Number(parcel.totalCost) * 100);

  if (!Number.isFinite(amountInCents) || amountInCents <= 0) {
    return res.status(400).send({ message: "Parcel has no valid amount" });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      payment_method_types: ["card"],
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});
