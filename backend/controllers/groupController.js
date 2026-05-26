const Group = require("../models/Group");

const createGroup = async (req, res, next) => {
  try {
    const { groupName } = req.body;

    if (!groupName) {
      return res.status(400).json({ message: "Group name is required." });
    }

    const isTeacher = req.user.role === "teacher";

    const group = await Group.create({
      groupName,
      createdBy: req.user._id,
      role: req.user.role,
      members: [req.user._id],
      maxMembers: isTeacher ? null : 10,
      isOpen: isTeacher,
    });

    const populatedGroup = await Group.findById(group._id)
      .populate("createdBy", "name email role")
      .populate("members", "name email role collegeId course year");

    res.status(201).json({
      message: "Group created successfully.",
      group: populatedGroup,
    });
  } catch (error) {
    next(error);
  }
};

const joinGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    const isAlreadyMember = group.members.some(
      (memberId) => memberId.toString() === req.user._id.toString()
    );

    if (isAlreadyMember) {
      return res.status(400).json({ message: "You are already a member of this group." });
    }

    if (!group.isOpen && group.members.length >= group.maxMembers) {
      return res.status(400).json({ message: "This group is full." });
    }

    group.members.push(req.user._id);
    await group.save();

    const updatedGroup = await Group.findById(group._id)
      .populate("createdBy", "name email role")
      .populate("members", "name email role collegeId course year");

    res.status(200).json({
      message: "Joined group successfully.",
      group: updatedGroup,
    });
  } catch (error) {
    next(error);
  }
};

const leaveGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    const isMember = group.members.some(
      (memberId) => memberId.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(400).json({ message: "You are not a member of this group." });
    }

    group.members = group.members.filter(
      (memberId) => memberId.toString() !== req.user._id.toString()
    );

    await group.save();

    const updatedGroup = await Group.findById(group._id)
      .populate("createdBy", "name email role")
      .populate("members", "name email role collegeId course year");

    res.status(200).json({
      message: "Left group successfully.",
      group: updatedGroup,
    });
  } catch (error) {
    next(error);
  }
};

const getAllGroups = async (req, res, next) => {
  try {
    const groups = await Group.find()
      .populate("createdBy", "name email role")
      .populate("members", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json(groups);
  } catch (error) {
    next(error);
  }
};

const getGroupDetails = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("createdBy", "name email role collegeId course year")
      .populate("members", "name email role collegeId course year");

    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    res.status(200).json(group);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createGroup,
  joinGroup,
  leaveGroup,
  getAllGroups,
  getGroupDetails,
};
