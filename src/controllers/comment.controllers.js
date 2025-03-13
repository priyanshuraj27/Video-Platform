import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    let { page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const comments = await Comment.find({ videoId })
        .populate("user", "username email") 
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit) 
        .limit(limit);

    const totalComments = await Comment.countDocuments({ videoId });

    res.status(200).json(new ApiResponse(200, {
        comments,
        totalPages: Math.ceil(totalComments / limit),
        currentPage: page,
        totalComments
    }, "Comments fetched successfully"));
});

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { comment } = req.body;
    const user = req.user;

    if (!comment || comment.trim() === "") {
        throw new ApiError(400, "Comment content cannot be empty");
    }

    const newComment = new Comment({
        videoId,
        comment,
        user: user._id
    });

    const savedComment = await newComment.save();
    res.status(201).json(new ApiResponse(201, { savedComment }, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { comment } = req.body; 
    const user = req.user;

    if (!comment || comment.trim() === "") {
        throw new ApiError(400, "Comment content cannot be empty");
    }

    const commentToUpdate = await Comment.findOneAndUpdate(
        { _id: commentId, user: user._id },
        { comment },
        { new: true } 
    );

    if (!commentToUpdate) {
        throw new ApiError(404, "Comment not found or unauthorized");
    }

    res.status(200).json(new ApiResponse(200, { commentToUpdate }, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const user = req.user;

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment.user.toString() !== user._id.toString()) { 
        throw new ApiError(403, "You are not authorized to delete this comment");
    }

    await Comment.findByIdAndDelete(commentId);

    res.status(200).json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
};
