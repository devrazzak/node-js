//Dependencies
const express = require("express");
const mongoose = require("mongoose");
const todoSchema = require("../schemas/todoSchema");
const userSchema = require("../schemas/userSchema");
const checkLogin = require("../middleware/checkLogin");
const router = express.Router();

// Create model
const Todo = new mongoose.model("Todo", todoSchema);
const User = new mongoose.model("User", userSchema);

// Get all the todos
router.get("/", checkLogin, async (req, res) => {
  try {
    const todoList = await Todo.find().populate("user", "name userName");
    res.status(200).json({
      data: todoList,
    });
  } catch {
    res.status(500).json({
      error: "Internal Server Error!",
    });
  }
});

// Get a todo by ID
router.get("/:id", async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    res.status(200).json({
      data: todo,
    });
  } catch {
    res.status(500).json({
      error: "Internal Server Error!",
    });
  }
});

// Post a todo
router.post("/", checkLogin, async (req, res) => {
  try {
    const newTodo = new Todo({
      ...req.body,
      user: req.userid,
    });
    const todo = await newTodo.save();
    await User.updateOne(
      {
        _id: req.userid,
      },
      {
        $push: {
          todos: todo._id,
        },
      },
    );
    res.status(200).json({
      message: "Task created successfully!",
      data: newTodo,
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal server error!",
    });
  }
});

// Post multiple todos
router.post("/all", async (req, res) => {
  try {
    await Todo.insertMany(req.body);

    res.status(200).json({
      message: "Tasks created successfully!",
    });
  } catch {
    res.status(500).json({ error: "Internal Sever Error!" });
  }
});

// Put todo
router.put("/:id", async (req, res) => {
  try {
    const updated = await Todo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json({
      message: "Task updated successfully!",
      data: updated,
    });
  } catch {
    res.status(500).json({
      error: " Internal server error!",
    });
  }
});

// Delete all todo
router.delete("/all", async (req, res) => {
  try {
    await Todo.deleteMany({});
    res.status(200).json({
      message: "Tasks Deleted Successfully!",
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal Server Error!",
    });
  }
});

// Delete todo
router.delete("/:id", async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.status(200).json({
      message: "Task Deleted Successfully!",
    });
  } catch {
    res.status(500).json({
      error: " Internal server error!",
    });
  }
});

module.exports = router;
