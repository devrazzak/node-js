// Dependencies
const e = require("express");
const express = require("express");
const mongoose = require("mongoose");
const todoHandler = require("./todoHandler/todoHandler");

// Express Initialization
const app = express();
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

// Default Error Handler
function errorHandler(err, req, res, next) {
  if (res.headerSent) {
    return next(err);
  }
  res.status(500).json({ error: err });
}

// Server Start
app.listen(3000, () => {
  console.log("listening on port 3000...");
});
