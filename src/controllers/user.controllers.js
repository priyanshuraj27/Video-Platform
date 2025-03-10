import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
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

export {registerUser}