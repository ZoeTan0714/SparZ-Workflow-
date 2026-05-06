import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@mui/material';

import WorkflowNode from './WorkflowNode';

const nodeTypes = {
  workflowNode: WorkflowNode,
};

// empty initial per workflow
const initialData = {
  nodes: [],
  edges: [],
};

export default function WorkflowCanvas({ workflowId, workflowData, setWorkflowData }) {
  const currentData = workflowData[workflowId] || { nodes: [], edges: [] };

  const [nodes, setNodes, onNodesChange] = useNodesState(currentData.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(currentData.edges);

  useEffect(() => {
    const data = workflowData[workflowId] || { nodes: [], edges: [] };
    setNodes(data.nodes);
    setEdges(data.edges);
  }, [workflowId]);

  const updateWorkflowData = useCallback((newNodes, newEdges) => {
    setWorkflowData(prev => ({
      ...prev,
      [workflowId]: { nodes: newNodes, edges: newEdges }
    }));
  }, [workflowId, setWorkflowData]);

  useEffect(() => {
    updateWorkflowData(nodes, edges);
  }, [nodes, edges, updateWorkflowData]);

  const deleteNode = useCallback((nodeId) => {
    setNodes((nds) => nds.filter(node => node.id !== nodeId));
    setEdges((eds) => eds.filter(edge => edge.source !== nodeId && edge.target !== nodeId));
  }, [setNodes, setEdges]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const addNode = useCallback(() => {
    setNodes((nds) => {
      const newNode = {
        id: Date.now().toString(),
        type: 'workflowNode',
        position: { x: 100, y: 100 + nds.length * 120 },
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
            setNodes((nodes) => nodes.map(n => n.id === nodeId ? { ...n, data: newData } : n));
          },
        },
      };
      return [...nds, newNode];
    });
  }, [deleteNode, setNodes]);

  return (
    <div style={{ height: '80vh', marginTop: 20 }}>
      <Button
        variant="outlined"
        color="inherit"
        onClick={addNode}
        sx={{ mb: 1, backgroundColor: '#f5f5f5', '&:hover': { backgroundColor: '#e0e0e0' } }}
      >
        + Add Step
      </Button>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}