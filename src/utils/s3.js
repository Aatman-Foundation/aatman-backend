import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import dotenv from "dotenv";

dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const uploadToS3 = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const fileBuffer = fs.readFileSync(localFilePath);
    const ext = path.extname(localFilePath);
    const key = `uploads/${randomUUID()}${ext}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
      })
    );

    fs.unlinkSync(localFilePath);

    return {
      url: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
      public_id: key,
    };
  } catch (error) {
    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
    return null;
  }
};

const deleteFromS3 = async (publicId) => {
  try {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: publicId,
      })
    );
  } catch (error) {
    console.log("Error deleting from S3", error);
  }
};

export { uploadToS3, deleteFromS3 };
