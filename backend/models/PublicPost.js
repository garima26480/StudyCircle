const mongoose = require("mongoose");

const publicPostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 280,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    language: {
      type: String,
      trim: true,
      default: "",
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PublicPost", publicPostSchema);
