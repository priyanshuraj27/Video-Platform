import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

const uploadOnCloudinary = async (localPath) =>{
    try {
        const result = await cloudinary.uploader.upload(localPath,{
            resource_type: "auto",
        });
        console.log("File has been uploaded successfully : ",result.url);
        return result;
    } catch (error) {
        fs.unlinkSync(localPath) // remove the locally saved temporary file as uploading failed
        console.error("Error Occured in uploading cloudinary :-",error);
        return null;
    }
}

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_KEY, 
    api_secret: process.env.CLOUDINARY_SECRET
});

export {uploadOnCloudinary};