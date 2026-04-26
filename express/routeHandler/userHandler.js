// Dependencies
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = require("../schemas/userSchema");
const checkLogin = require("../middleware/checkLogin");
const router = express.Router();

// Create Model
const User = new mongoose.model("User", userSchema);

// Get all the user
router.get("/all", checkLogin, async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      data: users,
    });
  } catch {
    res.status(500).json({
      error: "Internal server error!",
    });
  }
});

// Get a user by ID

// Create a user
router.post("/signup", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({
      name: req.body.name,
      userName: req.body.userName,
      password: hashedPassword,
    });
    await newUser.save();
    res.status(200).json({
      message: "User created successfully!",
      data: newUser,
    });
  } catch {
    res.status(500).json({
      error: "Internal server error!",
    });
  }
});

// Create multiple user

// Update user

// Delete all user

// Delete User by ID

// Login Route
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ userName: req.body.userName });
    if (user) {
      const isValidPassword = await bcrypt.compare(req.body.password, user.password);
      if (isValidPassword) {
        // Generate token
        const token = jwt.sign(
          {
            username: user.userName,
            userid: user._id,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "1h",
          },
        );
        res.status(200).json({
          message: "Login Successfully!",
          access_token: token,
        });
      } else {
        res.status(401).json({
          error: "Authentication Failed3!",
        });
      }
    } else {
      res.status(401).json({
        error: "Authentication Failed2!",
      });
    }
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({
      error: "Internal server error!",
    });
  }
});

// export module
module.exports = router;
