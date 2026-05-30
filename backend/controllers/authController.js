const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, collegeId, course, year } = req.body;

    if (!name || !email || !password || !role || !collegeId || !course || !year) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      collegeId,
      course,
      year,
    });

    res.status(201).json({
      message: "User registered successfully.",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        collegeId: user.collegeId,
        course: user.course,
        year: user.year,
      },
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    res.status(200).json({
      message: "Login successful.",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        collegeId: user.collegeId,
        course: user.course,
        year: user.year,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Load Mongoose models inside the controller locally to avoid circular dependencies
    const Group = require("../models/Group");
    const Message = require("../models/Message");
    const Question = require("../models/Question");
    const PublicPost = require("../models/PublicPost");

    // 1. Find all groups created by this user
    const userGroups = await Group.find({ createdBy: userId });
    const groupIds = userGroups.map((g) => g._id);

    // 2. Cascade delete messages and questions inside those groups
    await Message.deleteMany({ groupId: { $in: groupIds } });
    await Question.deleteMany({ groupId: { $in: groupIds } });

    // 3. Delete groups created by this user
    await Group.deleteMany({ createdBy: userId });

    // 4. Remove this user from the members list of other groups they joined
    await Group.updateMany(
      { members: userId },
      { $pull: { members: userId } }
    );

    // 5. Delete individual messages and questions posted by this user in other groups
    await Message.deleteMany({ sender: userId });
    await Question.deleteMany({ userId: userId });

    // 6. Delete all public posts created by this user
    await PublicPost.deleteMany({ userId: userId });

    // 7. Pull this user's likes from other public posts
    await PublicPost.updateMany(
      {},
      { $pull: { likes: userId } }
    );

    // 8. Delete the User document itself
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      message: "Profile and all associated data deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  deleteProfile,
};
