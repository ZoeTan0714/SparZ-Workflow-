const mongoose = require('mongoose');

const WorkflowSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nodes: { type: Array, default: [] },
  edges: { type: Array, default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Workflow', WorkflowSchema);
