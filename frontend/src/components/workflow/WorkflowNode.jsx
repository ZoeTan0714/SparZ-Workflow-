import React, { useState, useEffect } from 'react';
import { Card, CardContent, TextField, Checkbox, FormControlLabel, Button } from '@mui/material';
import { Handle, Position, NodeResizer } from 'reactflow';

export default function WorkflowNode({ id, data }) {
  const [title, setTitle] = useState(data.title);
  const [description, setDescription] = useState(data.description);
  const [width, setWidth] = useState(data.width || 280);

  const [hasTemplate, setHasTemplate] = useState(data.hasTemplate);
  const [template, setTemplate] = useState(data.template);

  const [hasURL, setHasURL] = useState(data.hasURL);
  const [url, setUrl] = useState(data.url);

  const copyTemplate = () => {
    navigator.clipboard.writeText(template);
    alert('Copied!');
  };

  const openUrl = () => {
    if (url) window.open(url, '_blank');
  };

  return (
    <Card sx={{ width: width, p: 1 }}>
      <NodeResizer
        minWidth={200}
        maxWidth={600}
        onResize={(event, params) => {
          setWidth(params.width);
          if (data.onUpdateData) {
            data.onUpdateData(id, { ...data, width: params.width });
          }
        }}
      />
      <Handle type="target" position={Position.Top} />

      <CardContent>

        {/* Title */}
        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          className="nodrag"
        />

        {/* Description */}
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          sx={{ mt: 1 }}
          className="nodrag"
        />

        {/* Template toggle */}
        <FormControlLabel
          control={
            <Checkbox
              checked={hasTemplate}
              onChange={(e) => setHasTemplate(e.target.checked)}
              className="nodrag"
            />
          }
          label="Have Template"
          className="nodrag"
        />

        {hasTemplate && (
          <TextField
            label="Template"
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            fullWidth
            multiline
            sx={{ mt: 1 }}
            className="nodrag"
          />
        )}

        {/* URL toggle */}
        <FormControlLabel
          control={
            <Checkbox
              checked={hasURL}
              onChange={(e) => setHasURL(e.target.checked)}
              className="nodrag"
            />
          }
          label="Have URL"
          className="nodrag"
        />

        {hasURL && (
          <TextField
            label="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            fullWidth
            sx={{ mt: 1 }}
            className="nodrag"
          />
        )}

        {/* actions */}
        <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
          {hasTemplate && (
            <Button size="small" onClick={copyTemplate} className="nodrag">
              Copy
            </Button>
          )}

          {hasURL && (
            <Button size="small" onClick={openUrl} className="nodrag">
              View Doc
            </Button>
          )}

          <Button size="small" color="error" onClick={() => data.onDelete(id)} className="nodrag">
            Delete
          </Button>
        </div>

      </CardContent>

      <Handle type="source" position={Position.Bottom} />
    </Card>
  );
}