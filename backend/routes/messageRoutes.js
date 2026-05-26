const express = require("express");

const {
  postMessage,
  getMessagesByGroup,
} = require("../controllers/messageController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, postMessage);
router.get("/:groupId", authMiddleware, getMessagesByGroup);

module.exports = router;
