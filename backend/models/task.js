const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required."],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required."],
    },
    type: {
      type: String,
      required: true,
      enum: ["Bug", "Feature", "Improvement"],
    },
    status: {
      type: String,
      required: true,
      enum: ["In Progress", "Pending Client", "Pending Report", "Closed"],
      default: "In Progress",
    },
    priority: {
      type: String,
      required: true,
      enum: ["None", "Low", "Medium", "High", "Urgent"], // 增加了 None 和 Urgent
      default: "None",
    },
    dueDate: {
      type: Date,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    assignees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    comment: [{
      text: String,
      createdAt: {
      type: Date,
      default: Date.now,
    }}],
  },
  {
    timestamps: true,
  },
);

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
