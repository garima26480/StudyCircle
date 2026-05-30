const express = require("express");

const { registerUser, loginUser, deleteProfile } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.delete("/profile", authMiddleware, deleteProfile);

module.exports = router;
