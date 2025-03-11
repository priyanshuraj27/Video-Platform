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
    console.log("avatarLocalPath:",avatarLocalPath);
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
            $set : {
                refreshToken : undefined
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

export {registerUser,loginUser,logoutUser}