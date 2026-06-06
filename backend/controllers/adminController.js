const User = require("../models/user");

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}, "username firstName lastName email role").sort({ username: 1 });
    return res.json({ users });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unable to fetch users." });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, fields: "username firstName lastName email role" },
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.json({ user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unable to update user role." });
  }
};
