const express = require("express");
const app = express();
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

const productRoutes = require("./api/routes/products");
const orderRoutes = require("./api/routes/orders");
const userRoutes = require("./api/routes/users");

mongoose.connect("mongodb://localhost/express-shopping-example");
const connectDB = mongoose.connection;
connectDB.on("error", () => {
  console.log("MongoDB connection error");
});
connectDB.once("open", () => {
  console.log("MongoDB is successfully connected");
});

app.use(
  morgan("dev", {
    skip: function(req, res) {
      return res.statusCode < 400;
    }
  })
);

const successLogStream = fs.createWriteStream(
  path.join(__dirname, "success.log"),
  { flags: "a" }
);
app.use(
  morgan("common", {
    stream: successLogStream
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use("/uploads", express.static("uploads"));

app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/users", userRoutes);

// app.use((req, res, next) => {
//   const error = new Error("Not Found!");
//   next(error);
// });

app.use((err, req, res, next) => {
  res.status(err.statusCode || 404).json({
    error: {
      message: !!err.message ? err.message : "Something went wrong."
    }
  });
});

module.exports = app;
