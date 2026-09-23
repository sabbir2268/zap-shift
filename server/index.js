const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const multer = require("multer");
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

app.post("/api/upload-image", upload.single("image"), async (req, res) => {
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

// custom middleware to verify token
const verifyFBToken = async (req, res, next) => {
  const authHeaders = req.headers.authorization;
  if (!authHeaders) {
    return res.status(401).send({ message: "Unauthorized Access" });
  }
  const token = authHeaders.split(" ")[1];
  if (!token) {
    return res.status(401).send({ message: "Unauthorized Access" });
  }
  // verify token
  try {
    const decoded = await getAuth().verifyIdToken(token);
    req.decoded = decoded;
    next();
  } 
  catch (error) {
    return res.status(403).send({ message: "forbidden Access" });
  }
};

// server running api

app.get("/", (req, res) => {
  res.send("Server is running ");
});

//=============User CRUD===============
app.post("/user", async (req, res) => {
  try {
    const email = req.body.email;
    const userExist = await userCollection.findOne({ email });
    if (userExist) {
      return res.status(200).send({ message: "user already exists" });
    }
    const user = req.body;
    const result = await userCollection.insertOne(user);
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// ============ PARCEL CRUD ============

// GET all parcels
app.get("/api/parcels", verifyFBToken, async (req, res) => {
  // console.log("headers in parcels",req.headers);
  try {
    const { email } = req.query;
    const filter = email ? { userEmail: email } : {};
    const parcels = await parcelsCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();
    res.json(parcels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single parcel
app.get("/api/parcels/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.query;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid parcel id" });
    }

    const filter = { _id: new ObjectId(id) };
    if (email) filter.userEmail = email;

    const parcel = await parcelsCollection.findOne(filter);

    if (!parcel) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    res.json(parcel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create parcel
app.post("/api/parcels", async (req, res) => {
  try {
    const data = req.body;

    const parcel = {
      ...data,
      status: data.status || "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await parcelsCollection.insertOne(parcel);

    res.status(201).json({ _id: result.insertedId, ...parcel });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT update parcel
app.put("/api/parcels/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid parcel id" });
    }

    const { _id, createdAt, ...updateData } = req.body;

    const result = await parcelsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    const updated = await parcelsCollection.findOne({
      _id: new ObjectId(id),
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE parcel
app.delete("/api/parcels/:id", async (req, res) => {
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

// GET all rider applications
app.get("/api/rider-applications", async (req, res) => {
  try {
    const applications = await riderApplicationsCollection
      .find()
      .sort({ createdAt: -1 })
      .toArray();
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create rider application
app.post("/api/rider-applications", async (req, res) => {
  try {
    const data = req.body;

    const application = {
      name: data.name,
      age: data.age,
      email: data.email,
      region: data.region,
      nid: data.nid,
      contact: data.contact,
      warehouse: data.warehouse,
      subscribeEmail: data.subscribeEmail || "",
      status: data.status || "pending",
      createdAt: new Date(),
    };

    const result = await riderApplicationsCollection.insertOne(application);

    res.status(201).json({ _id: result.insertedId, ...application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE all rider applications
app.delete("/api/rider-applications", async (req, res) => {
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

// GET payment history
app.get("/api/payments", verifyFBToken, async (req, res) => {
  try {
    const { email } = req.query;
    const filter = email ? { userEmail: email } : {};

    const payments = await paymentsCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create payment record
app.post("/api/payments", async (req, res) => {
  try {
    const data = req.body;

    const payment = {
      ...data,
      status: data.status || "paid",
      createdAt: new Date(),
    };

    const result = await paymentsCollection.insertOne(payment);
    console.log(result);

    res.status(201).json({ _id: result.insertedId, ...payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============ Payment Intend ============

app.post("/create-payment-intent", async (req, res) => {
  const amountInCents = req.body.amountInCents;
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
