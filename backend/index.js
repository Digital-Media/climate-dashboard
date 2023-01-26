require("dotenv").config();
const express = require("express");
const cors = require("cors");

const routes = require("./routes/routes");

const port = 3000;
const app = express();

app.use(express.json());
app.use(cors());

app.use("/api", routes);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
