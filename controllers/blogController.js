const asyncHandler = require('express-async-handler');
const AppError = require('../utils/AppError.js');
const Blog = require('../models/blog.js');



// 📝 Create a New Post
const createBlog = asyncHandler(async(req, res, next) =>{
    try {
        const {title, content, author} = req.body;
        console.log("title is: ", title, "content is: ", content, "author is: ", author);
        
        if(!title || !content || !author){
            return next(new AppError("All Fields are required", 400));
        }
    
        const newBlog = await Blog.create({title, content, author});
        console.log("See this new user", newBlog);
    
        await newBlog.save();
    
        res.status(201).json({
            success: true,
            blogpost: {
                _id: newBlog._id,
                title: newBlog.title,
                content: newBlog.content,
                author: newBlog.author,
            }
        })
    } catch (error) {
        return next(new AppError(`error issue is persisting from createblogPost controller ${error}`, 500));
    }
});


// 📖 Get All Posts

const getBlogs = asyncHandler(async(req, res, next) =>{
    try {
        const blogs = await Blog.find();
    
        if(!blogs){
            return next(new AppError("No blog till now", 404));
        }
    
        res.status(200).json({
            success: true,
            blogs
        });
    } catch (error) {
        return next(new AppError(`Error coming from get Blogs ${error}`, 500));
    }
})


// 📖 Get a Single Post by ID

const getBlogbyId = asyncHandler(async(req, res, next) =>{
    try {
        const {id} = req.params;
    
        const existingBlog = await Blog.findById(id);
    
        if(!existingBlog){
            return next (new AppError("blog not found", 404));
        }
    
        res.status(200).json({
            success: true,
            message: existingBlog.title
        });
    } catch (error) {
        return next(new AppError(`Error coming from get Blogs by Id ${error}`, 500));
    }

});


// ✏️ Update a Post

const updateBlog = asyncHandler(async(req, res, next) =>{
    try {
        const {id} = req.params;
        const existingBlog = await Blog.findById(id);
    
        
        if(!existingBlog){
            return next (new AppError("blog not found", 404));
        }
    
        existingBlog.title = req.body.title || existingBlog.title;
        existingBlog.content = req.body.content ||  existingBlog.content;
    
        await existingBlog.save();
    
        res.status(200).json({
            success: true,
            message: `Job status updated to ${existingBlog.status}`,
            existingBlog,
        });
    } catch (error) {
        return next(new AppError(`Error coming from updating Blog ${error}`, 500));
    }
});


// ❌ Delete a Post
const deleteBlog = asyncHandler(async(req, res, next) =>{
    try {
        const {id} = req.params;
    
        const blog = await Blog.findById(id);
    
        if(!blog){
            return next(new AppError("Blog not found", 404));
        }
    
        await blog.remove();
    
        res.status(200).json({
            success: true,
            message: "Blog deleted successfully",
        })
    } catch (error) {
        return next(new AppError(`Error coming from deleting Blog ${error}`, 500));
    }
});


module.exports = {createBlog, getBlogs, getBlogbyId, updateBlog, deleteBlog};
