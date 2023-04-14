const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const offerRoutes = require("./routes/offer");

const app = express();
app.use(cors());
app.use(express.json());

// const MONGODB_URI = "mongodb://localhost/vinted";
// console.log(process.env.MONGODB_URI);
mongoose.connect(process.env.MONGODB_URI);

app.get("/", (req, res) => {
  console.log("Hello world");
});

app.use(authRoutes);

app.use(offerRoutes);

app.all("*", (req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.listen(process.env.PORT, () => {
  console.log("Server started");
});
