const express = require('express');
const { createBlog, getBlogs, getBlogbyId, updateBlog, deleteBlog } = require('../controllers/blogController');
const { protect } = require('../Middlewares/authMiddleware');
const router = express.Router();

router.post("/create", protect, createBlog);
router.get("/", protect, getBlogs);
router.get("/:id", protect, getBlogbyId);
router.put("/:id/update", protect, updateBlog);
router.delete("/delete", protect, deleteBlog);

module.exports = router;