const express = require("express");
const cors = require("cors");
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const dbName = process.env.DB_NAME || "zapShift";
let parcelsCollection;
let riderApplicationsCollection;

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({
      ping: 1,
    });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const db = client.db(dbName);
    parcelsCollection = db.collection("parcels");
    riderApplicationsCollection = db.collection("riderApplications");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

run().then(() => {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
});

app.get("/", (req, res) => {
  res.send("Server is running ");
});

// ============ PARCEL CRUD ============

// GET all parcels
app.get("/api/parcels", async (req, res) => {
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