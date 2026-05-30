const express = require("express");

const {
  postMessage,
  getMessagesByGroup,
  updateMessage,
} = require("../controllers/messageController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, postMessage);
router.get("/:groupId", authMiddleware, getMessagesByGroup);
router.put("/:id", authMiddleware, updateMessage);

module.exports = router;
