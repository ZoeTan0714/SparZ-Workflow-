import React, { useCallback } from 'react';
import { Card, CardContent, TextField, Checkbox, FormControlLabel, Button } from '@mui/material';
import { Handle, Position, NodeResizer } from 'reactflow';

export default function WorkflowNode({ id, data }) {
  const width = data.width || 280;

  const updateData = useCallback((changes) => {
    if (!data.onUpdateData) return;
    data.onUpdateData(id, { ...data, ...changes });
  }, [data, id]);

  const shouldResize = useCallback((event, params) => params.direction[1] === 0, []);

  const copyTemplate = () => {
    navigator.clipboard.writeText(data.template || '');
    alert('Copied!');
  };

  const openUrl = () => {
    if (data.url) window.open(data.url, '_blank');
  };

  return (
      <Card sx={{ width: width, p: 1, boxSizing: 'border-box' }}>
      <NodeResizer
        nodeId={id}
        minWidth={200}
        maxWidth={600}
        shouldResize={shouldResize}
        lineStyle={{ opacity: 0 }}
        handleStyle={{ opacity: 0 }}
        onResize={(event, params) => updateData({ width: params.width })}
      />
      <Handle type="target" position={Position.Top} />

      <CardContent
        onMouseDown={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
        onDoubleClick={(event) => event.stopPropagation()}
      >
        <TextField
          label="Title"
          value={data.title || ''}
          onChange={(e) => updateData({ title: e.target.value })}
          fullWidth
          className="nodrag"
          inputProps={{ className: 'nodrag' }}
        />

        <TextField
          label="Description"
          value={data.description || ''}
          onChange={(e) => updateData({ description: e.target.value })}
          fullWidth
          multiline
          sx={{ mt: 1 }}
          className="nodrag"
          inputProps={{ className: 'nodrag' }}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={data.hasTemplate || false}
              onChange={(e) => updateData({ hasTemplate: e.target.checked })}
              className="nodrag"
            />
          }
          label="Have Template"
          className="nodrag"
        />

        {data.hasTemplate && (
          <TextField
            label="Template"
            value={data.template || ''}
            onChange={(e) => updateData({ template: e.target.value })}
            fullWidth
            multiline
            sx={{ mt: 1 }}
            className="nodrag"
            inputProps={{ className: 'nodrag' }}
          />
        )}

        <FormControlLabel
          control={
            <Checkbox
              checked={data.hasURL || false}
              onChange={(e) => updateData({ hasURL: e.target.checked })}
              className="nodrag"
            />
          }
          label="Have URL"
          className="nodrag"
        />

        {data.hasURL && (
          <TextField
            label="URL"
            value={data.url || ''}
            onChange={(e) => updateData({ url: e.target.value })}
            fullWidth
            sx={{ mt: 1 }}
            className="nodrag"
            inputProps={{ className: 'nodrag' }}
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

          <Button size="small" color="error" onClick={() => data.onDelete?.(id)} className="nodrag">
            Delete
          </Button>
        </div>
      </CardContent>

      <Handle type="source" position={Position.Bottom} />
    </Card>
  );
}