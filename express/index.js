// Dependencies
const e = require("express");
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const todoHandler = require("./routeHandler/todoHandler");
const userHandler = require("./routeHandler/userHandler");

// Express Initialization
const app = express();
dotenv.config({ path: path.resolve(__dirname, "../.env") });
app.use(express.json());

// Database connection with mongoose
mongoose
  .connect("mongodb://localhost/todo-app")
  .then(() => {
    console.log("Connection Successful!");
  })
  .catch((err) => {
    console.log("Error", err);
  });

// Application Routes
app.use("/todo", todoHandler);
app.use("/user", userHandler);

// Default Error Handler
const errorHandler = (err, req, res, next) => {
  if (res.headerSent) {
    return next(err);
  }
  res.status(500).json({ error: err });
};

app.use(errorHandler);

// Server Start
app.listen(3000, () => {
  console.log("listening on port 3000...");
});
