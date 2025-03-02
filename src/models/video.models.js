import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema({
    videoFile : {
        type : String, // cloudinary url
        required : [true,"videoFile is required"]
    },
    thumbnail : {
        type : String, // cloudinary url
        required : [true,"thumbnail is required"]
    },
    title : {
        type : String,
        required : [true,"title is required"]
    },
    description : {
        type : String,
        required : [true,"description is required"]
    },
    duration : {
        type : Number, // extract from cloudinary
        required : true,
    },
    views : {
        type : Number,
        default : 0
    },
    isPublished : {
        type : Boolean,
        default : true,
    },
    owner : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    }
},{timestamps:true});
videoSchema.plugin(mongooseAggregatePaginate);
export const Video = mongoose.model("Video",videoSchema);




