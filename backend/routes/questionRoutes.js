const express = require("express");

const {
  postQuestion,
  getQuestionsByGroup,
} = require("../controllers/questionController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, postQuestion);
router.get("/:groupId", authMiddleware, getQuestionsByGroup);

module.exports = router;
