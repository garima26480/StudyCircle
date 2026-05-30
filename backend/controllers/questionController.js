const Group = require("../models/Group");
const Question = require("../models/Question");

const postQuestion = async (req, res, next) => {
  try {
    const { groupId, questionText, imageUrl } = req.body;

    if (!groupId || !questionText) {
      return res.status(400).json({ message: "Group ID and question text are required." });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    const isMember = group.members.some(
      (memberId) => memberId.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: "Only group members can post questions." });
    }

    const question = await Question.create({
      userId: req.user._id,
      groupId,
      questionText,
      imageUrl,
    });

    const populatedQuestion = await Question.findById(question._id).populate(
      "userId",
      "name email role"
    );

    res.status(201).json({
      message: "Question posted successfully.",
      data: populatedQuestion,
    });
  } catch (error) {
    next(error);
  }
};

const getQuestionsByGroup = async (req, res, next) => {
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
      return res.status(403).json({ message: "Only group members can view questions." });
    }

    const questions = await Question.find({ groupId })
      .populate("userId", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json(questions);
  } catch (error) {
    next(error);
  }
};

const updateQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { questionText, imageUrl } = req.body;

    if (!questionText) {
      return res.status(400).json({ message: "Question text is required." });
    }

    const existingQuestion = await Question.findById(id);
    if (!existingQuestion) {
      return res.status(404).json({ message: "Question not found." });
    }

    // Verify ownership
    if (existingQuestion.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to edit this question." });
    }

    // Verify time limit (30 minutes)
    const timeDifference = Date.now() - new Date(existingQuestion.createdAt).getTime();
    if (timeDifference > 30 * 60 * 1000) {
      return res.status(400).json({ message: "Questions can only be edited within 30 minutes of posting." });
    }

    existingQuestion.questionText = questionText;
    if (imageUrl !== undefined) {
      existingQuestion.imageUrl = imageUrl.trim();
    }
    await existingQuestion.save();

    const populatedQuestion = await Question.findById(existingQuestion._id).populate(
      "userId",
      "name email role"
    );

    res.status(200).json(populatedQuestion);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  postQuestion,
  getQuestionsByGroup,
  updateQuestion,
};
