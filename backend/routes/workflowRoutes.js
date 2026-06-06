const express = require('express');
const router = express.Router();
const workflowController = require('../controllers/workflowController');
const verifyToken = require('../middleware/verifyToken');
const requireAdmin = require('../middleware/requireAdmin');

router.get('/', verifyToken, workflowController.getAllWorkflows);
router.get('/:id', verifyToken, workflowController.getWorkflowById);
router.post('/', verifyToken, requireAdmin, workflowController.createWorkflow);
router.patch('/:id', verifyToken, requireAdmin, workflowController.updateWorkflow);
router.delete('/:id', verifyToken, requireAdmin, workflowController.deleteWorkflow);

module.exports = router;
