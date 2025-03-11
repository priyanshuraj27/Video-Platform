import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models";

export const verifyJWT = asyncHandler(async(req,_,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("authorization")?.replace("Bearer ","")
        if(!token){
            throw new ApiError(401,"unauthorized request")
        }
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        if(!user){
            throw new ApiError(404,"User not found")
        }
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401,error?.message ||"unauthorized request")
        
    }

})