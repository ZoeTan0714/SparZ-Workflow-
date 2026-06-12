const Workflow = require('../models/workflow');

exports.getAllWorkflows = async (req, res) => {
  try {
    const workflows = await Workflow.find().sort({ order: 1 });
    res.json({ workflows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to fetch workflows' });
  }
};

exports.getWorkflowById = async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) return res.status(404).json({ error: 'Workflow not found' });
    res.json({ workflow });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to fetch workflow' });
  }
};

exports.createWorkflow = async (req, res) => {
  try {
    const { name, nodes, edges } = req.body;
    const lastWorkflow = await Workflow.findOne().sort({ order: -1 });
    const workflow = new Workflow({ name, order: lastWorkflow ? lastWorkflow.order + 1 : 0, nodes: nodes || [], edges: edges || [] });
    await workflow.save();
    res.status(201).json({ workflow });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to create workflow' });
  }
};

exports.updateWorkflow = async (req, res) => {
  try {
    const { name, nodes, edges } = req.body;
    const workflow = await Workflow.findByIdAndUpdate(
      req.params.id,
      { name, nodes: nodes || [], edges: edges || [] },
      { new: true },
    );
    if (!workflow) return res.status(404).json({ error: 'Workflow not found' });
    res.json({ workflow });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to update workflow' });
  }
};

exports.deleteWorkflow = async (req, res) => {
  try {
    const workflow = await Workflow.findByIdAndDelete(req.params.id);
    if (!workflow) return res.status(404).json({ error: 'Workflow not found' });
    res.json({ message: 'Workflow deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to delete workflow' });
  }
};

exports.reorderWorkflows = async (req, res) => {
  try {
    const { workflows } = req.body;

    await Promise.all (
      workflows.map((wf, index) => 
        Workflow.findByIdAndUpdate(
          wf._id, 
          { order: index }
        )
      )
    );

    res.json({ 
      message: 'Workflows reordered' 
    });
  
  } catch (err) {
    console.error(err);
    
    res.status(500).json({ 
      error: 
        'Unable to reorder workflows' 
      });
  }
};
