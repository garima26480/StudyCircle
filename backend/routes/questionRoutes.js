const express = require("express");

const {
  postQuestion,
  getQuestionsByGroup,
  updateQuestion,
} = require("../controllers/questionController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, postQuestion);
router.get("/:groupId", authMiddleware, getQuestionsByGroup);
router.put("/:id", authMiddleware, updateQuestion);

module.exports = router;
