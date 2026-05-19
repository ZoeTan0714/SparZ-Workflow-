import React, { useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import '@reactflow/node-resizer/dist/style.css';
import { Button } from '@mui/material';

import WorkflowNode from './WorkflowNode';

const nodeTypes = {
  workflowNode: WorkflowNode,
};

export default function WorkflowCanvas({ workflowId, workflowData, onSave, isSaving }) {
  const currentData = workflowData[workflowId] || { nodes: [], edges: [] };

  const [nodes, setNodes, onNodesChange] = useNodesState(currentData.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(currentData.edges);

  const previousWorkflowId = useRef();

  const updateNodeData = useCallback((nodeId, newData) => {
    setNodes((nodes) => nodes.map((n) => n.id === nodeId ? { ...n, data: newData, width: newData.width ?? n.width } : n));
  }, [setNodes]);

  const deleteNode = useCallback((nodeId) => {
    setNodes((nds) => nds.filter(node => node.id !== nodeId));
    setEdges((eds) => eds.filter(edge => edge.source !== nodeId && edge.target !== nodeId));
  }, [setNodes, setEdges]);

  useEffect(() => {
    if (!workflowId) return;
    if (previousWorkflowId.current === workflowId) {
      return;
    }

    const data = workflowData[workflowId] || { nodes: [], edges: [] };
    // ensure each node has a top-level width property (React Flow expects node.width)
    const normalizedNodes = (data.nodes || []).map((n) => ({
      ...n,
      width: n.width ?? n.data?.width ?? undefined,
      data: {
        ...n.data,
        onDelete: deleteNode,
        onUpdateData: updateNodeData,
      },
    }));
    setNodes(normalizedNodes);
    setEdges(data.edges || []);
    previousWorkflowId.current = workflowId;
  }, [workflowId, workflowData, setEdges, setNodes, deleteNode, updateNodeData]);

  // Local node/edge changes are kept in canvas state until the user clicks Save.
  // This prevents rerender loops and input flicker caused by syncing every edit back to workflowData.

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = useCallback(() => {
    setNodes((nds) => {
      const newNode = {
        id: Date.now().toString(),
        type: 'workflowNode',
        position: { x: 100, y: 100 + nds.length * 120 },
        width: 280,
        data: {
          title: '',
          description: '',
          hasTemplate: false,
          template: '',
          hasURL: false,
          url: '',
            width: 280,
          onDelete: deleteNode,
            onUpdateData: (nodeId, newData) => {
              setNodes((nodes) => nodes.map(n => n.id === nodeId ? { ...n, data: newData, width: newData.width ?? n.width } : n));
            },
        },
      };
      return [...nds, newNode];
    });
  }, [deleteNode, setNodes]);

  return (
    <div style={{ height: '80vh', marginTop: 20 }}>
      <style>{`
        .react-flow__resize-control.top,
        .react-flow__resize-control.bottom,
        .react-flow__resize-control.left,
        .react-flow__resize-control.top-left,
        .react-flow__resize-control.top-right,
        .react-flow__resize-control.bottom-left,
        .react-flow__resize-control.bottom-right,
        .react-flow__resize-control.line.top,
        .react-flow__resize-control.line.bottom,
        .react-flow__resize-control.line.left,
        .react-flow__resize-control.handle {
          display: none !important;
        }

        .react-flow__resize-control.line.right {
          display: block !important;
          opacity: 1 !important;
          width: 14px !important;
          height: 14px !important;
          left: 100% !important;
          top: 50% !important;
          transform: translate(50%, -50%) !important;
          border-radius: 50% !important;
          background: transparent !important;
          border: 2px solid #3367d9 !important;
          box-shadow: 0 0 0 4px rgba(51,103,217,0.12) !important;
          cursor: ew-resize !important;
          z-index: 50 !important;
        }
      `}</style>
      <Button
        variant="outlined"
        color="inherit"
        onClick={addNode}
        sx={{ mb: 1, backgroundColor: '#f5f5f5', '&:hover': { backgroundColor: '#e0e0e0' } }}
      >
        + Add Step
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={() => onSave?.(workflowId, nodes, edges)}
        disabled={!workflowId || isSaving}
        sx={{ mb: 1, ml: 1 }}
      >
        {isSaving ? 'Saving...' : 'Save'}
      </Button>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}