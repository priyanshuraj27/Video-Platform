import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.models.js"
import { Subscription } from "../models/subscription.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    const {subscriberId} = req.user
    const subscription = await Subscription.findOne({channelId, subscriberId})
    if(subscription){
        await Subscription.findByIdAndDelete(subscription._id)
        res.status(200).json(new ApiResponse(200,{},"Unsubscribed successfully"))
    }
    else{
        const subscription = new Subscription({
            channelId,
            subscriberId
        })
        .save();
        res.status(200).json(new ApiResponse(200,{subscription},"Subscribed successfully"))
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const subscribers = await Subscription.find({channelId}).populate("subscriberId")
    res.status(200).json(new ApiResponse(200,{subscribers},"Subscribers fetched successfully"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    const channels = await Subscription.find({subscriberId}).populate("channelId")
    res.status(200).json(new ApiResponse(200,{channels},"Subscribed channels fetched successfully"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}