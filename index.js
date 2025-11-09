const express = require("express");
const app = express();
const cors = require("cors");

const port = 5000;

//middlewares
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("server connected!");
});
app.get("/hommy", (req, res) => {
  res.send("hommies connected!");
});

app.listen(port, () => {
  console.log("server is running at port", port);
});
