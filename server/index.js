const express = require("express");
const cors = require("cors");
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion } = require("mongodb");

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

console.log("PORT:", process.env.PORT);

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({
      ping: 1,
    });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

run();

app.get("/", (req, res) => {
  res.send("Server is running ");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
