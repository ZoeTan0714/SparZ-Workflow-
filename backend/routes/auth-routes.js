const express = require("express");
const router = express.Router();
const { signup, signin, signout, updateProfile } = require("../controllers/auth-controllers");
const verifyToken = require("../middleware/verifyToken");

router.post("/signup", signup);
router.post("/signin", signin);
router.patch("/profile", verifyToken, updateProfile);
router.post("/signout", verifyToken, signout);

module.exports = router;
