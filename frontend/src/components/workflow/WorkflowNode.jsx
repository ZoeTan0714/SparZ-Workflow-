import React, { useCallback } from 'react';
import { Card, CardContent, TextField, Checkbox, FormControlLabel, Button } from '@mui/material';
import { Handle, Position, NodeResizer } from 'reactflow';

export default function WorkflowNode({ id, data }) {
  const width = data.width || 280;
  const isAdmin = data.isAdmin;

  const updateData = useCallback((changes) => {
    if (!isAdmin || !data.onUpdateData) return;
    data.onUpdateData(id, { ...data, ...changes });
  }, [data, id, isAdmin]);

  const shouldResize = useCallback((event, params) => params.direction[1] === 0, []);

  const copyTemplate = () => {
    navigator.clipboard.writeText(data.template || '');
    alert('Copied!');
  };

  const openUrl = () => {
    if (data.url) window.open(data.url, '_blank');
  };

  return (
    <div style={{ width, position: 'relative' }}>
      <Card sx={{ width: '100%', p: 1, boxSizing: 'border-box' }}>
        {isAdmin && (
          <NodeResizer
            nodeId={id}
            minWidth={200}
            maxWidth={600}
            shouldResize={shouldResize}
            lineStyle={{ opacity: 0 }}
            handleStyle={{ opacity: 0 }}
            onResize={(event, params) => updateData({ width: params.width })}
          />
        )}
        <Handle type="target" position={Position.Top} />

        <CardContent
          onMouseDown={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          onDoubleClick={(event) => event.stopPropagation()}
        >
        <TextField
          label="Title"
          value={data.title || ''}
          onChange={isAdmin ? (e) => updateData({ title: e.target.value }) : undefined}
          fullWidth
          className="nodrag"
          inputProps={{ className: 'nodrag', readOnly: !isAdmin }}
          disabled={!isAdmin}
        />

        <TextField
          label="Description"
          value={data.description || ''}
          onChange={isAdmin ? (e) => updateData({ description: e.target.value }) : undefined}
          fullWidth
          multiline
          sx={{ mt: 1 }}
          className="nodrag"
          inputProps={{ className: 'nodrag', readOnly: !isAdmin }}
          disabled={!isAdmin}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={data.hasTemplate || false}
              onChange={isAdmin ? (e) => updateData({ hasTemplate: e.target.checked }) : undefined}
              className="nodrag"
              disabled={!isAdmin}
            />
          }
          label="Have Template"
          className="nodrag"
        />

        {data.hasTemplate && (
          <TextField
            label="Template"
            value={data.template || ''}
            onChange={isAdmin ? (e) => updateData({ template: e.target.value }) : undefined}
            fullWidth
            multiline
            sx={{ mt: 1 }}
            className="nodrag"
            inputProps={{ className: 'nodrag', readOnly: !isAdmin }}
            disabled={!isAdmin}
          />
        )}

        <FormControlLabel
          control={
            <Checkbox
              checked={data.hasURL || false}
              onChange={isAdmin ? (e) => updateData({ hasURL: e.target.checked }) : undefined}
              className="nodrag"
              disabled={!isAdmin}
            />
          }
          label="Have URL"
          className="nodrag"
        />

        {data.hasURL && (
          <TextField
            label="URL"
            value={data.url || ''}
            onChange={isAdmin ? (e) => updateData({ url: e.target.value }) : undefined}
            fullWidth
            sx={{ mt: 1 }}
            className="nodrag"
            inputProps={{ className: 'nodrag', readOnly: !isAdmin }}
            disabled={!isAdmin}
          />
        )}

        <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
          {data.hasTemplate && (
            <Button size="small" onClick={copyTemplate} className="nodrag">
              Copy
            </Button>
          )}

          {data.hasURL && (
            <Button size="small" onClick={openUrl} className="nodrag">
              View Doc
            </Button>
          )}

          {isAdmin && (
            <Button size="small" color="error" onClick={() => data.onDelete?.(id)} className="nodrag">
              Delete
            </Button>
          )}
        </div>
      </CardContent>

      <Handle type="source" position={Position.Bottom} />
    </Card>
  </div>
  );
}