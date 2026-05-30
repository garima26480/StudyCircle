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

const updateMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message content is required." });
    }

    const existingMessage = await Message.findById(id);
    if (!existingMessage) {
      return res.status(404).json({ message: "Message not found." });
    }

    // Verify ownership
    if (existingMessage.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to edit this message." });
    }

    // Verify time limit (30 minutes)
    const timeDifference = Date.now() - new Date(existingMessage.createdAt).getTime();
    if (timeDifference > 30 * 60 * 1000) {
      return res.status(400).json({ message: "Messages can only be edited within 30 minutes of posting." });
    }

    existingMessage.message = message;
    await existingMessage.save();

    const populatedMessage = await Message.findById(existingMessage._id).populate(
      "sender",
      "name email role"
    );

    res.status(200).json(populatedMessage);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  postMessage,
  getMessagesByGroup,
  updateMessage,
};
