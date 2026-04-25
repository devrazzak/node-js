// Dependencies
const mongoose = require("mongoose");

// Create User Schema
const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
  },
});

// export module
module.exports = userSchema;
