const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const requireAdmin = require("../middleware/requireAdmin");
const adminController = require("../controllers/adminController");

router.get("/users", verifyToken, requireAdmin, adminController.getUsers);
router.patch("/users/:id/role", verifyToken, requireAdmin, adminController.updateUserRole);

module.exports = router;
