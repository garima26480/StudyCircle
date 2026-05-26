const express = require("express");

const {
  createGroup,
  joinGroup,
  leaveGroup,
  getAllGroups,
  getGroupDetails,
} = require("../controllers/groupController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create", authMiddleware, createGroup);
router.post("/join/:id", authMiddleware, joinGroup);
router.post("/leave/:id", authMiddleware, leaveGroup);
router.get("/", authMiddleware, getAllGroups);
router.get("/:id", authMiddleware, getGroupDetails);

module.exports = router;
