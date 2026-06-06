import React, { useState } from 'react';
import { Box, Button, Typography, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Menu, MenuItem } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import WorkflowCanvas from '../components/workflow/WorkflowCanvas';
import { fetchWorkflows, fetchWorkflowById, createWorkflow as createWorkflowAPI, saveWorkflow, deleteWorkflow } from '../services/workflowService';

function Workflow() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
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
  const [contextMenu, setContextMenu] = useState(null);
  const [contextWorkflowId, setContextWorkflowId] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [renameWorkflowId, setRenameWorkflowId] = useState(null);
  const [renameWorkflowName, setRenameWorkflowName] = useState('');

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

  const handleWorkflowTabContextMenu = (event, workflowId) => {
    if (!isAdmin) return;
    event.preventDefault();
    setContextWorkflowId(workflowId);
    setContextMenu(
      contextMenu === null
        ? { mouseX: event.clientX - 2, mouseY: event.clientY - 4 }
        : null
    );
  };

  const handleCloseContextMenu = () => setContextMenu(null);

  const handleOpenDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
    handleCloseContextMenu();
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setContextWorkflowId(null);
  };

  const confirmDeleteWorkflow = async () => {
    if (!isAdmin || !contextWorkflowId) return;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(contextWorkflowId);

    try {
      if (isObjectId) {
        await deleteWorkflow(contextWorkflowId);
      }

      setWorkflows((prev) => prev.filter((wf) => wf.id !== contextWorkflowId));
      setWorkflowData((prev) => {
        const next = { ...prev };
        delete next[contextWorkflowId];
        return next;
      });

      if (selectedWorkflowId === contextWorkflowId) {
        const remaining = workflows.filter((wf) => wf.id !== contextWorkflowId);
        setSelectedWorkflowId(remaining.length ? remaining[0].id : '');
      }
    } catch (err) {
      console.error('Delete workflow failed', err);
      alert('Failed to delete workflow.');
    } finally {
      handleCloseDeleteDialog();
    }
  };

  const handleWorkflowTabDoubleClick = (workflowId) => {
    if (!isAdmin) return;
    const workflow = workflows.find((wf) => wf.id === workflowId);
    if (!workflow) return;

    setRenameWorkflowId(workflowId);
    setRenameWorkflowName(workflow.name || '');
    setIsRenameDialogOpen(true);
  };

  const handleCloseRenameDialog = () => {
    setIsRenameDialogOpen(false);
    setRenameWorkflowId(null);
    setRenameWorkflowName('');
  };

  const confirmRenameWorkflow = async () => {
    if (!isAdmin || !renameWorkflowId) return;
    const updatedName = renameWorkflowName.trim() || 'Untitled Workflow';
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(renameWorkflowId);

    setWorkflows((prev) => prev.map((wf) => (
      wf.id === renameWorkflowId ? { ...wf, name: updatedName } : wf
    )));

    if (isObjectId) {
      try {
        const payload = {
          name: updatedName,
          nodes: workflowData[renameWorkflowId]?.nodes || [],
          edges: workflowData[renameWorkflowId]?.edges || [],
        };
        await saveWorkflow(renameWorkflowId, payload);
      } catch (err) {
        console.error('Rename workflow failed', err);
        alert('Failed to rename workflow.');
      }
    }

    handleCloseRenameDialog();
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
          setSelectedWorkflowId((current) => {
            const currentExists = saved.some((wf) => wf.id === current);
            return currentExists ? current : saved[0].id;
          });
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
        // ensure frontend cache reflects the saved nodes/edges so switching away and back
        // shows the latest data without requiring a full page refresh
        setWorkflowData((prev) => ({ ...prev, [workflowId]: { nodes: nodes || [], edges: edges || [] } }));
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
              onContextMenu={isAdmin ? (event) => handleWorkflowTabContextMenu(event, wf.id) : undefined}
              onDoubleClick={isAdmin ? () => handleWorkflowTabDoubleClick(wf.id) : undefined}
            >
              {wf.name}
            </Button>
          ))}
        </Box>
        {isAdmin && (
          <Button
            variant="contained"
            color="secondary"
            onClick={handleCreateClick}
            sx={{ position: 'absolute', right: 0 }}
          >
            + Create Workflow
          </Button>
        )}
      </Box>

      {isAdmin && (
        <Menu
          open={contextMenu !== null}
          onClose={handleCloseContextMenu}
          anchorReference="anchorPosition"
          anchorPosition={
            contextMenu !== null
              ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
              : undefined
          }
        >
          <MenuItem onClick={handleOpenDeleteDialog}>Delete workflow</MenuItem>
        </Menu>
      )}

      <Dialog open={isDeleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Workflow</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this workflow?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button color="error" onClick={confirmDeleteWorkflow}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isRenameDialogOpen} onClose={handleCloseRenameDialog}>
        <DialogTitle>Rename Workflow</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Workflow Name"
            fullWidth
            variant="standard"
            value={renameWorkflowName}
            onChange={(e) => setRenameWorkflowName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRenameDialog}>Cancel</Button>
          <Button onClick={confirmRenameWorkflow}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* canvas */}
      <WorkflowCanvas
        workflowId={selectedWorkflowId}
        workflowData={workflowData}
        setWorkflowData={setWorkflowData}
        onSave={handleSaveWorkflow}
        isSaving={isSaving}
        isAdmin={isAdmin}
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
