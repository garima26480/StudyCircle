const PublicPost = require("../models/PublicPost");

// Create a new public post
const createPost = async (req, res, next) => {
  const { content, subject, language } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ message: "Post content is required." });
  }

  if (!subject || !subject.trim()) {
    return res.status(400).json({ message: "Subject tag is required." });
  }

  if (content.length > 280) {
    return res.status(400).json({ message: "Content must be under 280 characters." });
  }

  try {
    const newPost = new PublicPost({
      userId: req.user.id,
      content: content.trim(),
      subject: subject.trim(),
      language: language ? language.trim() : "",
      likes: [],
    });

    const savedPost = await newPost.save();
    
    // Populate user info for immediate display in frontend
    const populatedPost = await PublicPost.findById(savedPost._id).populate(
      "userId",
      "name role"
    );

    res.status(201).json(populatedPost);
  } catch (error) {
    next(error);
  }
};

// Retrieve all public posts, newest first
const getAllPosts = async (req, res, next) => {
  try {
    const posts = await PublicPost.find()
      .populate("userId", "name role")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    next(error);
  }
};

// Toggle like on a public post
const likePost = async (req, res, next) => {
  const postId = req.params.id;
  const userId = req.user.id;

  try {
    const post = await PublicPost.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex > -1) {
      // User already liked it, so unlike (remove from likes array)
      post.likes.splice(likeIndex, 1);
    } else {
      // User hasn't liked it, so like (add to likes array)
      post.likes.push(userId);
    }

    await post.save();
    
    const updatedPost = await PublicPost.findById(postId).populate(
      "userId",
      "name role"
    );

    res.json(updatedPost);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPost,
  getAllPosts,
  likePost,
};
