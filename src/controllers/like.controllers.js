import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    const {user} = req.user
    const like = await Like.findOne({video : videoId, likedBy : user._id})
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id")
    }
    if(like){
        await like.remove();
        res.status(200).json(new ApiResponse(200, "Like removed successfully", like))
    }
    else{
        const newLike = new Like({
            video : videoId,
            likedBy : user._id
        })
        await newLike.save()
        res.status(201).json(new ApiResponse(201, "Liked successfully", newLike))
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    const {user} = req.user
    const like = await Like.findOne({video : commentId, likedBy : user._id})
    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment id")
    }
    if(like){
        await like.remove();
        res.status(200).json(new ApiResponse(200, "Like removed successfully", like))
    }
    else{
        const newLike = new Like({
            video : commentId,
            likedBy : user._id
        })
        await newLike.save()
        res.status(201).json(new ApiResponse(201, "Liked successfully", newLike))
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    const {user} = req.user
    const like = await Like.findOne({video : tweetId, likedBy : user._id})
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid Tweet id")
    }
    if(like){
        await like.remove();
        res.status(200).json(new ApiResponse(200, "Like removed successfully", like))
    }
    else{
        const newLike = new Like({
            video : tweetId,
            likedBy : user._id
        })
        await newLike.save()
        res.status(201).json(new ApiResponse(201, "Liked successfully", newLike))
    }

}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const {user} = req.user
    const likedVideos = await Like.find({likedBy : user._id}).populate("video")
    res.status(200).json(new ApiResponse(200, "Liked videos fetched successfully", likedVideos))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}