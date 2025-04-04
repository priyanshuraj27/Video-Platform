import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async(userId) =>{
    try {
//         console.log("ACCESS_TOKEN_SECRET:", process.env.ACCESS_TOKEN_SECRET);
// console.log("ACCESS_TOKEN_EXPIRY:", process.env.ACCESS_TOKEN_EXPIRY);

        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        // console.log("accessToken:",accessToken);
        // console.log("refreshToken:",refreshToken);
        user.refreshToken = refreshToken
        user.accessToken = accessToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}
const registerUser = asyncHandler(async (req,res) => {
    // get user details from frontend
    // validation
    // check if user exists : username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object
    // save user to database
    // remove password and refresh token field from response
    // chech for user creation
    // send response
    const{fullName,email,username,password} = req.body;
    // console.log("email:",email);
    // Validation 
    if(!fullName || !email || !username || !password){
        throw new ApiError(400,"Please provide all fields")
    }

    // Checking if user already exists
    const existedUser = await User.findOne({
        $or: [{email},{username}]
    })
    if(existedUser){
        throw new ApiError(409,"User already exists")
    }

    // Check for images in local
    const avatarLocalPath = req.files?.avatar[0]?.path // It stores the path of the avatar image in local 
    const coverImageLocalPath = req.files?.coverImage[0]?.path // It stores the path of the cover image in local
    
    if(!avatarLocalPath){
        throw new ApiError(400,"Please provide avatar image");
    }
    // console.log("avatarLocalPath:",avatarLocalPath);
    // Upload images to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage= await uploadOnCloudinary(coverImageLocalPath)
    // check if avatar is there otherwise database may fall
    if(!avatar){
        throw new ApiError(400,"Please provide avatar1 image");
    }

    // Create user object and enter in database
    const user = await User.create({
        fullName,
        avatar : avatar.url,
        coverImage : coverImage?.url || "", // if coverimage is there then upload that or put it empty
        email,
        password,
        username : username.toLowerCase(),
    })
    // check for User
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500,"User not created") // Server Error
    }
    return res.status(201).json(new ApiResponse(200,"User created",createdUser))
})
const loginUser = asyncHandler(async(req,res)=>{
  // For Login take the username/email and password from the user
  // validate the fields
  // check if user exists from the database
  // match the password
  // access token and refresh token
  // send cookie
  // Login the user
  // send response

  // fetch the data from the user
//   console.log("req.body:",req.body);
  const {username,email,password} = req.body;
    // console.log("username:",username);
    // console.log("email:",email);

  // validate the fields
  if(!username && !email){
      throw new ApiError(400,"Please provide username or email")
  }
  // search for user in db
  const user = await User.findOne({
    $or : [{username},{email}]
  })
  if(!user){
      throw new ApiError(404,"User not found")
  }

  // check for password
  const isPasswordValid = await user.isPasswordCorrect(password)
  if(!isPasswordValid){
      throw new ApiError(401,"Invalid password")
  }
  // generate access token and refresh token
//   console.log("user._id:",user._id);
    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)
   const loggedInUser =  await User.findById(user._id).select("-password -refreshToken")
    
   // send cookie
   const options = {
        httpOnly : true,
        secure : true
   }
   return res.status(200).cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(200,{
        user : loggedInUser,
        accessToken : accessToken,
        refreshToken : refreshToken
    },
    "User logged in"))
})
const logoutUser = asyncHandler(async(req,res)=>{
    // remove the refresh token from the database
    // remove the cookie
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset : {
                refreshToken : 1
            }
        },
        {
            new : true
        }
    )
    const options = {
        httpOnly : true,
        secure : true
   }
   return res
   .status(200)
   .clearCookie("accessToken",options)
   .clearCookie("refreshToken",options)
   .json(new ApiResponse(200,undefined,"User logged out"))
})
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})
const changeCurrentPassword = asyncHandler(async(req,res)=>{
    // get current password and username and new password
    // validate the fields
    // check if user exists
    // match the password
    // change the password
    // send response
    const {currentPassword,newPassword} = req.body;
    console.log("current password ",currentPassword);
    console.log("new password",newPassword);
    if(!currentPassword || !newPassword){
        throw new ApiError(400,"Please provide all fields")
    }
    const user = await User.findById(req.user?._id)
    if(!user){
        throw new ApiError(404,"User not found")
    }
    const isPasswordValid = await user.isPasswordCorrect(currentPassword)
    if(!isPasswordValid){
        throw new ApiError(401,"Invalid password")
    }
    user.password = newPassword
    await user.save({validateBeforeSave : false})

    return res.status(200)
    .json(new ApiResponse(200,{},"Password Changed Succesfully"))

})
const getCurrentUser = asyncHandler(async(req,res)=>{
    return res.status(200)
    .json(new ApiResponse(200,req.user,"Current User Fetched Successfully"))
})
const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullName,email} = req.body
    // console.log("fullName:",fullName);
    // console.log("email:",email);
    if(!fullName && !email){
        throw new ApiError(400,"All fields are required")
    }
    const user =await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName,
                email
            }
        },
        {new : true}
    ).select("-password")
    return res.status(200)
    .json(new ApiResponse(200,user,"Account details updated successfully"))

})
const updateUserAvatar = asyncHandler(async(req,res)=>{
    // take the new picture from req.file
    //validation
    // change in user
    // update it 
    const avatarLocalPath = await req.file?.path
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is missing")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if(!avatar.url){
        throw new ApiError(400,"Error while uploading avatar on cloudinary")
    }
    const user = await User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new : true}
    ).select("-password")
    return res.status(200)
    .json(
        new ApiResponse(200,user,"Avatar updated successfully")
    )
})
const updateUserCoverImage = asyncHandler(async(req,res)=>{
    // take the new picture from req.file
    //validation
    // change in user
    // update it 
    const coverImageLocalPath = await req.file?.path
    if(!coverImageLocalPath){
        throw new ApiError(400,"Cover Image is missing")
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!coverImage.url){
        throw new ApiError(400,"Error while uploading coverImage on cloudinary")
    }
    const user = await User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new : true}
    ).select("-password")

    return res.status(200)
    .json(
        new ApiResponse(200,user,"CoverImage updated successfully")
    )
})
const getUserChannelProfile = asyncHandler(async(req,res)=>{
    const {username} = req.params
    if(!username?.trim()){
        throw new ApiError(400,"Please provide username")
    }
    const channel = await User.aggregate([
        {
            $match:{
                username : username?.toLowerCase()
            }
        },
        {
            $lookup : {
                from : "subscriptions",
                localField : "_id",
                foreignField : "channel",
                as : "subscribers"
            }
        },
        {
            $lookup : {
                from : "subscriptions",
                localField : "_id",
                foreignField : "subscriber",
                as : "subscribedTo"
            }
        },
        {
            $addFields : {
                subscribersCount : {
                    $size : "$subscribers" // count the subscribers
                },
                subscribedToCount : {
                    $size : "$subscribedTo" // count the subscribedTo
                },
                isSubscribed : {
                    $cond : {
                        if : {$in : [req.user?._id,"$subscribers.subscriber"]},
                        then : true,
                        else : false
                    }
                }
            }
        },
        {
            $project : {    // 1 to send 0 to not send
                fullName : 1, 
                avatar : 1,
                coverImage : 1,
                username : 1,
                subscribersCount : 1,
                subscribedToCount : 1,
                isSubscribed : 1,
                email : 1
            }
        }
    ])
    if(!channel?.length){
        throw new ApiError(404,"Channel not found")
    }
    return res.status(200)
    .json(
        new ApiResponse(200,channel[0],"Channel profile fetched successfully")
    )
})
const getWatchHistory = asyncHandler(async(req,res)=>{
    const user = await User.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup : {
                from : "videos",
                localField : "watchHistory",
                foreignField : "_id",
                as : "watchHistory",
                pipeline: [
                    {
                        $lookup : {
                            from : "users",
                            localField : "owner",
                            foreignField : "_id",
                            as: "owner",
                            pipeline : [
                                {
                                    $project : {
                                        fullName : 1,
                                        username : 1,
                                        avatar : 1,
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields : {
                            owner : {
                                $first : "$owner"
                            }
                        }
                    }
                ]
            },
            
        }
    ])

    return res.status(200)
    .json(new ApiResponse(200,user[0].getWatchHistory,"Watch history fetched successfully"))
})
export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory
};