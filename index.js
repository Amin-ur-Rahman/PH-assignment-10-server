const express = require("express");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const cors = require("cors");

const port = process.env.PORT || 5000;

// vTavoOIHVG9gPnwF;
// local-food-lovers-project;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ix21m2z.mongodb.net/?appName=Cluster0`;
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
    const favoriteCollection = db.collection("favorite_reviews");

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    app.post("/insert-new-review", async (req, res) => {
      const query = req.body;

      try {
        const result = await reviewCollection.insertOne(query);
        if (result.acknowledged)
          res.send({ success: true, message: "review added successfully" });
        console.log("review added successfully", result);
      } catch (error) {
        console.log("request error!", error);
      }
    });

    app.post("/add-to-favorite", async (req, res) => {
      const data = req.body;
      const result = await favoriteCollection.insertOne(data);
      if (!result.acknowledged) {
        res.send({
          success: false,
          message: "Request error: could not added to favorites",
        });
      }
      res.send({ success: true, message: `added to favorite ` });
      console.log(result);
    });

    app.get("/user-review/:userId", async (req, res) => {
      const id = req.params.userId;
      const query = { _id: new ObjectId(id) };
      try {
        const result = await reviewCollection.findOne(query);
        if (!result) {
          return res
            .status(404)
            .send({ success: false, message: "Review not found!" });
        }
        res.send({ review: result, success: true });
      } catch (error) {
        // res.send({success:false, message: "Server error"})
        console.log(error.message);
      }
    });

    app.get("/reviews", async (req, res) => {
      try {
        const { email } = req.query;
        // console.log(email);

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

    app.patch("/edit-user-review/:reviewId", async (req, res) => {
      const id = req.params.reviewId;
      const query = { _id: new ObjectId(id) };
      const updates = {
        $set: req.body,
      };

      try {
        const result = await reviewCollection.updateOne(query, updates);
        console.log(result);

        if (result.modifiedCount === 0) {
          res
            .status(404)
            .send({ success: false, message: "Failed to update review!" });
        }
        res.send({ success: true, message: "review updated successfully" });
      } catch (error) {
        console.log("database error", error);
        res.status(500).send({ success: false, message: "databse error" });
      }
    });

    app.delete("/delete-user-review/:reviewId", async (req, res) => {
      const id = req.params.reviewId;
      const query = { _id: new ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);

      if (result.deletedCount > 0) {
        res.send({ success: true, message: "deletion successful" });
        console.log(result);
      } else {
        res.send({ success: false, message: "delete request failed" });
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
