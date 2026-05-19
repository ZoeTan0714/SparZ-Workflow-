import React, { useState } from 'react';
import { Box, Button, Typography, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import WorkflowCanvas from '../components/workflow/WorkflowCanvas';
import { fetchWorkflows, fetchWorkflowById, createWorkflow as createWorkflowAPI, saveWorkflow } from '../services/workflowService';

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
  const [isSaving, setIsSaving] = useState(false);

  const createWorkflow = () => {
    const newWorkflow = {
      id: `local-${Date.now()}`,
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

  // load saved workflows from backend on mount
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetchWorkflows();
        const saved = (res.data?.workflows || []).map(wf => ({ id: wf._id, name: wf.name }));
        if (!mounted) return;
        if (saved.length) {
          setWorkflows(saved);
          setSelectedWorkflowId((current) => current || saved[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch workflows', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // load workflow nodes/edges when selectedWorkflowId changes (if not already loaded)
  React.useEffect(() => {
    if (!selectedWorkflowId) return;
    if (workflowData[selectedWorkflowId]) return;

    let mounted = true;
    (async () => {
      try {
        const res = await fetchWorkflowById(selectedWorkflowId);
        const wf = res.data?.workflow;
        if (!mounted) return;
        if (wf) {
          setWorkflowData((prev) => ({ ...prev, [selectedWorkflowId]: { nodes: wf.nodes || [], edges: wf.edges || [] } }));
        }
      } catch (err) {
        console.error('Failed to load workflow details', err);
      }
    })();
    return () => { mounted = false; };
  }, [selectedWorkflowId, workflowData]);

  const handleSaveWorkflow = async (workflowId, nodes, edges) => {
    const workflow = workflows.find((wf) => wf.id === workflowId);
    if (!workflow) return;

    setIsSaving(true);
    try {
      const payload = { name: workflow.name, nodes, edges };
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(workflowId);

      if (!isObjectId) {
        const response = await createWorkflowAPI(payload);
        const savedWorkflow = response.data.workflow;

        setWorkflows((prev) => prev.map((wf) =>
          wf.id === workflowId ? { id: savedWorkflow._id, name: savedWorkflow.name } : wf
        ));

        setWorkflowData((prev) => {
          const next = { ...prev };
          delete next[workflowId];
          return {
            ...next,
            [savedWorkflow._id]: { nodes: nodes || [], edges: edges || [] },
          };
        });

        setSelectedWorkflowId(savedWorkflow._id);
      } else {
        await saveWorkflow(workflowId, payload);
      }

      alert('Workflow saved successfully.');
    } catch (err) {
      console.error('Save failed', err);
      alert('Workflow save failed.');
    } finally {
      setIsSaving(false);
    }
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
        onSave={handleSaveWorkflow}
        isSaving={isSaving}
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
