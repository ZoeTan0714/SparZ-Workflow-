import React, { useState } from 'react';
import { Box, Button, Typography, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import WorkflowCanvas from '../components/workflow/WorkflowCanvas';

function Workflow() {
  const [workflows, setWorkflows] = useState([
    { id: '1', name: 'Client Onboarding' },
    { id: '2', name: 'KOL Communication' },
  ]);

  const [workflowData, setWorkflowData] = useState({
    '1': { nodes: [], edges: [] },
    '2': { nodes: [], edges: [] },
  });

  const [selectedWorkflowId, setSelectedWorkflowId] = useState('1');
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const createWorkflow = () => {
    const newWorkflow = {
      id: Date.now().toString(),
      name: newWorkflowName || 'Untitled Workflow',
    };

    setWorkflows([...workflows, newWorkflow]);
    setWorkflowData({
      ...workflowData,
      [newWorkflow.id]: { nodes: [], edges: [] },
    });
    setSelectedWorkflowId(newWorkflow.id);
    setNewWorkflowName('');
    setIsCreateDialogOpen(false);
  };

  const handleCreateClick = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCancelCreate = () => {
    setNewWorkflowName('');
    setIsCreateDialogOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* workflow selector and create button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2, position: 'relative' }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {workflows.map((wf) => (
            <Button
              key={wf.id}
              variant={wf.id === selectedWorkflowId ? 'contained' : 'outlined'}
              onClick={() => setSelectedWorkflowId(wf.id)}
            >
              {wf.name}
            </Button>
          ))}
        </Box>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleCreateClick}
          sx={{ position: 'absolute', right: 0 }}
        >
          + Create Workflow
        </Button>
      </Box>

      {/* canvas */}
      <WorkflowCanvas
        workflowId={selectedWorkflowId}
        workflowData={workflowData}
        setWorkflowData={setWorkflowData}
      />

      {/* Create Workflow Dialog */}
      <Dialog open={isCreateDialogOpen} onClose={handleCancelCreate}>
        <DialogTitle>Create New Workflow</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Workflow Name"
            fullWidth
            variant="standard"
            value={newWorkflowName}
            onChange={(e) => setNewWorkflowName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelCreate}>Cancel</Button>
          <Button onClick={createWorkflow}>Confirm</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Workflow;