const Task = require ("../models/task")
const Project = require("../models/project");
const mongoose = require("mongoose")

exports.createTask = async (req,res) => {
    try {
        const newTask = new Task({
            ...req.body,
            createdBy: new mongoose.Types.ObjectId("69d9aebcf689d13dd0d4882a")
        });

        const savedTask = await newTask.save();
        res.status(201).json(savedTask);
    } catch (error){
        res.status(400).json({ message: error.message });
    }
};

exports.getTasksByProject = async (req,res) => {
    try {
        const tasks = await Task.find({ project: req.params.projectId })
            .populate("assignees", "username")
            .sort({ createdAt: -1 })
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.deleteTask = async (req,res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });

        // allow delete if requester is project lead, a project member, or admin
        const project = await Project.findById(task.project);
        if (!project) return res.status(404).json({ message: "Project not found" });

        const userId = req.user.userId;
        const isProjectLead = project.projectLead?.toString() === userId;
        const isMember = Array.isArray(project.members) && project.members.some(m => m.toString() === userId);
        const isAdmin = req.user.role === 'admin';

        if (!isProjectLead && !isMember && !isAdmin) {
            return res.status(403).json({ message: "Only project members or admins can delete this task" });
        }

        await Task.findByIdAndDelete(req.params.id);
        res.json({ message: "Task deleted successfully" })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.updateTask = async (req, res) => {
  try {
    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
