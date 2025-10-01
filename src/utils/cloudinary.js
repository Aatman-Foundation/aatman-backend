import { v2 as cloudinary } from 'cloudinary'; 
import fs from 'fs'

import dotenv from "dotenv"

dotenv.config()


cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_CLOUD_KEY, 
        api_secret: process.env.CLOUDINARY_CLOUD_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
   try{
        if(!localFilePath) return null;
        const respone = await cloudinary.uploader.upload(localFilePath, {resource_type: 'auto'}, )
        fs.unlinkSync(localFilePath)
        return respone
   }
   catch(error){
        fs.unlinkSync(localFilePath);
        return null;
    }

}

const deleteFromCloudinary = async(publicId) => {
     try {
          const result = await cloudinary.uploader.destroy(publicId);
          console.log("Deleted from Cloudinary")
     } catch (error) {
          console.log("Error deleting from Cloudinary", error)
     }

}

export {uploadOnCloudinary, deleteFromCloudinary};