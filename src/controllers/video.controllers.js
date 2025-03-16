import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
const getAllVideos = asyncHandler(async (req, res) => {
    try {
        const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query;

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const skip = (pageNumber - 1) * limitNumber;

        // Construct the search filter
        let filter = {};
        if (query) {
            filter.title = { $regex: query, $options: "i" };
        }
        if (userId) {
            filter.userId = userId;
        }

        // Sorting logic
        const sortOptions = {};
        sortOptions[sortBy] = sortType === "asc" ? 1 : -1;

        // Fetch videos with pagination and sorting
        const videos = await Video.find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNumber);

        const totalVideos = await Video.countDocuments(filter);

        res.status(200).json(
            new ApiResponse(200, { videos, totalVideos }, "Videos fetched successfully")
        );
    } catch (error) {
        res.status(500).json(new ApiError(500, "An error occurred while fetching videos"));
    }
})
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const user = req.user;

    // Validation: Ensure required fields are provided
    if (!title || !description) {
        throw new ApiError(400, "Title and description are required.");
    }

    // Check if video and thumbnail exist in request
    const videoLocalPath = req.files?.video?.[0]?.path; 
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if (!videoLocalPath) {
        throw new ApiError(400, "Video file is required.");
    }
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail image is required.");
    }

    try {
        // Upload video to Cloudinary
        const videoUpload = await uploadOnCloudinary(videoLocalPath, "videos");
        if (!videoUpload || !videoUpload.secure_url) {
            throw new ApiError(500, "Failed to upload video.");
        }

        // Upload thumbnail to Cloudinary
        const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath, "thumbnails");
        if (!thumbnailUpload || !thumbnailUpload.url) {
            throw new ApiError(500, "Failed to upload thumbnail.");
        }
        console.log("video:-",videoUpload);
        console.log("thumbnail:-",thumbnailUpload);
        // console.log("Uploaded Successfully");
        // Create and save video entry in the database
        const newVideo = await Video.create({
            title,
            description,
            videoFile: videoUpload.url,
            thumbnail: thumbnailUpload.url,
            owner: user._id,
            duration: videoUpload,
            views: 0,
            isPublished: false,
        });
        // console.log("newVideo", newVideo);
        // Delete local files after successful upload
        // fs.unlinkSync(videoLocalPath);
        // fs.unlinkSync(thumbnailLocalPath);

        res.status(201).json(new ApiResponse(201, { newVideo }, "Video published successfully."));
    } catch (error) {
        // Clean up local files if upload fails
        if (fs.existsSync(videoLocalPath)) fs.unlinkSync(videoLocalPath);
        if (fs.existsSync(thumbnailLocalPath)) fs.unlinkSync(thumbnailLocalPath);

        throw new ApiError(500, "An error occurred while uploading the video.");
    }
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID format");
    }

    // Fetch the video with user details
    const video = await Video.findById(videoId)
        .populate("user", "username email")
        .lean();

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    res.status(200).json(new ApiResponse(200, { video }, "Video fetched successfully"));
});


const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const { title, description, thumbnail } = req.body;
    const user = req.user;
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404, "Video not found");
    }
    if(video.owner.toString() !== user._id.toString()){
        throw new ApiError(403, "You are not authorized to update this video");
    }
    video.title = title;
    video.description = description;
    video.thumbnail = thumbnail;

    await video.save();
    res.status(200).json(new ApiResponse(200, { video }, "Video updated successfully"));
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const user = req.user;
    // Find the video and check if the user is the owner
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    if (video.owner.toString() !== user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this video");
    }
    // Delete the video
    await Video.findByIdAndDelete(videoId);
    res.status(200).json(new ApiResponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const user = req.user;
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    if (video.owner.toString() !== user._id.toString()) {
        throw new ApiError(403, "You are not authorized to change the publish status");
    }
    video.isPublished = !video.isPublished;
    await video.save();

    res.status(200).json(new ApiResponse(200, { video }, "Publish status updated successfully"));
});


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}