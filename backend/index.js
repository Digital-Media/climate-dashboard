require("dotenv").config();
const express = require("express");
const { MongoClient } = require("mongodb");
const mongoose = require("mongoose");

const routes = require("./routes/routes");

const DB_URL = process.env.DATABASE_URL;
const port = 3000;
const app = express();

mongoose.connect(DB_URL);
const database = mongoose.connection;

database.on("error", (error) => {
  console.log(error);
});

database.once("connected", () => {
  console.log("Database Connected");
});

app.use(express.json());

app.use("/api", routes);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
