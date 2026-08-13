import { BlobServiceClient } from "@azure/storage-blob";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.resolve(
  __dirname,
  "../aatman-frontend/public/gallary_img"
);

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);
const containerClient = blobServiceClient.getContainerClient(
  process.env.AZURE_STORAGE_CONTAINER
);

const DB_NAME = "aatmanfoundation";

async function uploadToAzureBlob(filePath) {
  const ext = path.extname(filePath);
  const blobName = `gallery/${randomUUID()}${ext}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadFile(filePath, {
    blobHTTPHeaders: { blobContentType: "image/jpeg" },
  });

  return {
    url: blockBlobClient.url,
    public_id: blobName,
  };
}

async function run() {
  const files = fs
    .readdirSync(IMAGES_DIR)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f));

  if (files.length === 0) {
    console.log("No images found in", IMAGES_DIR);
    process.exit(0);
  }

  console.log(`Found ${files.length} images. Connecting to MongoDB...`);

  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
  console.log("MongoDB connected.\n");

  const Admin = mongoose.model(
    "Admin",
    new mongoose.Schema({ email: String }, { strict: false })
  );
  const GalleryItem = mongoose.model(
    "GalleryItem",
    new mongoose.Schema(
      {
        title: { type: String, required: true },
        description: String,
        imageUrl: { type: String, required: true },
        imagePublicId: { type: String, required: true },
        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Admin",
          required: true,
        },
      },
      { timestamps: true }
    )
  );

  const admin = await Admin.findOne({});
  if (!admin) {
    console.error("No admin found in DB. Register an admin first.");
    process.exit(1);
  }
  console.log(`Using admin: ${admin.email || admin._id}\n`);

  let uploaded = 0;
  let failed = 0;

  for (const file of files) {
    const filePath = path.join(IMAGES_DIR, file);
    const title = `Gallery Image ${uploaded + 1}`;
    process.stdout.write(`Uploading [${uploaded + 1}/${files.length}] ${file} ... `);

    try {
      const { url, public_id } = await uploadToAzureBlob(filePath);
      await GalleryItem.create({
        title,
        imageUrl: url,
        imagePublicId: public_id,
        createdBy: admin._id,
      });
      console.log("done");
      uploaded++;
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone. ${uploaded} uploaded, ${failed} failed.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
