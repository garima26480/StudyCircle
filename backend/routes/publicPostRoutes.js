const express = require("express");
const {
  createPost,
  getAllPosts,
  likePost,
} = require("../controllers/publicPostController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createPost);
router.get("/", authMiddleware, getAllPosts);
router.post("/like/:id", authMiddleware, likePost);

module.exports = router;
