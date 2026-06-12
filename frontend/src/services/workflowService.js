import api from './api';

export const fetchWorkflows = () => api.get('/workflows');

export const fetchWorkflowById = (id) => api.get(`/workflows/${id}`);

export const createWorkflow = (payload) => api.post('/workflows', payload);

export const saveWorkflow = (id, payload) => api.patch(`/workflows/${id}`, payload);

export const deleteWorkflow = (id) => api.delete(`/workflows/${id}`);

export const reorderWorkflows = (workflows) => api.patch('/workflows/reorder', { workflows });

export default {
  fetchWorkflows,
  fetchWorkflowById,
  createWorkflow,
  saveWorkflow,
  deleteWorkflow,
  reorderWorkflows,
};
