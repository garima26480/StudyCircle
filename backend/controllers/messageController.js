const Group = require("../models/Group");
const Message = require("../models/Message");

const postMessage = async (req, res, next) => {
  try {
    const { groupId, message } = req.body;

    if (!groupId || !message) {
      return res.status(400).json({ message: "Group ID and message are required." });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    const isMember = group.members.some(
      (memberId) => memberId.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: "Only group members can send messages." });
    }

    const newMessage = await Message.create({
      sender: req.user._id,
      groupId,
      message,
    });

    const populatedMessage = await Message.findById(newMessage._id).populate(
      "sender",
      "name email role"
    );

    res.status(201).json({
      message: "Message sent successfully.",
      data: populatedMessage,
    });
  } catch (error) {
    next(error);
  }
};

const getMessagesByGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    const isMember = group.members.some(
      (memberId) => memberId.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: "Only group members can view messages." });
    }

    const messages = await Message.find({ groupId })
      .populate("sender", "name email role")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  postMessage,
  getMessagesByGroup,
};
