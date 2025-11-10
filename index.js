const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const cors = require("cors");

const port = 5000;

// vTavoOIHVG9gPnwF;
// local-food-lovers-project;

const uri =
  "mongodb+srv://local-food-lovers-project:vTavoOIHVG9gPnwF@cluster0.ix21m2z.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

//middlewares
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("server connected!");
});

async function run() {
  try {
    await client.connect();
    const db = client.db("local-food-lovers-db");
    const reviewCollection = db.collection("food_reviews");

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    app.post("/insert-new-review", async (req, res) => {
      const query = req.body;

      try {
        const result = await reviewCollection.insertOne(query);
        res.send(result);
        console.log("review added successfully", result);
      } catch (error) {
        console.log("request error!", error);
      }
    });

    app.get("/reviews", async (req, res) => {
      try {
        const { email } = req.query;
        console.log(email);

        const filter = {};
        if (email) filter.user_email = email;

        const projectFields = { user_email: 0 };
        const cursor = reviewCollection.find(filter).project(projectFields);
        const data = await cursor.toArray();
        res.send(data);
      } catch (error) {
        res.status(500).send(`Error: ${error.message}`);
      }
    });
  } catch (error) {
    console.log("DB error", error);
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("server is running at port", port);
});
