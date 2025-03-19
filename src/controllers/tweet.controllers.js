import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body
    const user = req.user
    if(!content){
        throw new ApiError(404,"Content of the tweet is required")
    }
    const newTweet = await Tweet.create({
        content,
        owner : user._id
    })
    res.status(201)
    .json(new ApiResponse(201,newTweet,"Tweeted Successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {newContent,tweetId} = req.body
    const user = req.user
    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
      throw new ApiError(404, "Tweet doesn't exist");
    }
    if (tweet.owner.toString() !== user._id.toString()) {
      throw new ApiError(403, "You are not authorized to update this video");
    }
    tweet.content = newContent
    await tweet.save()
    res.status(201)
    .json(new ApiResponse(201,tweet,"Tweet Updated Successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.body
    const user = req.user
    const tweet = await Tweet.findByIdAndDelete(tweetId)
    if (!tweet) {
      throw new ApiError(404, "Tweet doesn't exist");
    }
    if (tweet.owner.toString() !== user._id.toString()) {
      throw new ApiError(403, "You are not authorized to update this video");
    }
    res.status(201)
    .json(201,{},"tweet deleted successfully")
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}