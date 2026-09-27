const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const multer = require("multer");
const crypto = require("crypto");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const admin = require("firebase-admin");
const { getAuth } = require("firebase-admin/auth");

dotenv.config();

const stripe = require("stripe")(process.env.PAYMENT_GATEWAY_KEY);
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

// firebase token initializing
const serviceAccount = require("./firebase-adminsdk.json");

admin.initializeApp({
  credential: admin.cert(serviceAccount),
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
    userCollection = db.collection("users");
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

  // already a rider, never hand out a second id
  if (user.role === "rider" && user.riderID) {
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
          warehouse: application.warehouse,
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

    res.json(user);
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

    // a rider is not allowed to hold the admin role
    if (target.role === ROLES.RIDER && role === ROLES.ADMIN) {
      return res.status(403).json({
        message: "A rider cannot be set as admin",
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
    res.status(500).json({ message: error.message });
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
    res.json(applications);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// POST apply to become a rider, always filed under the signed in account
app.post("/api/rider-applications", requireAuth, async (req, res) => {
  try {
    const data = req.body;

    const application = {
      uid: req.auth.uid,
      riderID: data.riderID || (await generateRiderId()),
      name: data.name,
      age: data.age,
      email: req.auth.email,
      region: data.region,
      nid: data.nid,
      contact: data.contact,
      warehouse: data.warehouse,
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
