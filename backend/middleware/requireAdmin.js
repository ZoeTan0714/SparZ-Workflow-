const User = require("../models/user");

const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized." });
    }
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: admin only." });
    }
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = requireAdmin;
