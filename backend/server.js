const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const logger = require("morgan");
const cors = require("cors");
const Project = require("./models/project");
const authRouter = require("./routes/auth-routes");
const projectRouter = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const workflowRoutes = require("./routes/workflowRoutes");
const adminRoutes = require("./routes/adminRoutes");

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on("connected", async () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);

  // Hotfix: drop legacy unique index on `projectName` (causes 11000 with {projectName: null})
  try {
    const indexes = await Project.collection.indexes();
    const legacy = indexes.find((idx) => idx?.key?.projectName === 1);
    if (legacy?.name) {
      await Project.collection.dropIndex(legacy.name);
      console.log(`Dropped legacy index: ${legacy.name}`);
    }
  } catch (err) {
    // Non-fatal: app should still start even if index doesn't exist
    console.warn("Index cleanup skipped:", err.message || err);
  }
});

app.use(cors());
app.use(express.json());
app.use(logger("dev"));
app.use("/api", taskRoutes);

app.get("/test", (req, res) => {
  res.json({ message: "server is working" });
});

app.use("/api/auth", authRouter);
app.use("/api/projects", projectRouter);
app.use('/api/workflows', workflowRoutes);
app.use('/api/admin', adminRoutes);

app.listen(3000, () => {
  console.log("The express app is ready!");
});

// ZOE: task routes — commented out until task.js model is fixed
// (task.js references undefined commentSchema and uses wrong variable name taskSchema vs issueSchema)
// const issueController = require("./controllers/issueController");
// app.post("/api/tasks", issueController.createTask);
// app.get("/api/tasks/:projectID", issueController.getTasksByProject);
// app.delete("/api/tasks/:id", issueController.deleteTask);
