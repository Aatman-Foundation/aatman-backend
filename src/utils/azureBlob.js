import { BlobServiceClient, BlobSASPermissions } from "@azure/storage-blob";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import dotenv from "dotenv";

dotenv.config();

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);
const containerClient = blobServiceClient.getContainerClient(
  process.env.AZURE_STORAGE_CONTAINER
);

// The storage account has anonymous/public blob access disabled, so every
// URL handed to a browser must be signed. This SAS is read-only and expires
// far in the future, standing in for a "permanent" public URL.
const SAS_EXPIRY = new Date("2099-01-01");

const getReadSasUrl = (blockBlobClient) =>
  blockBlobClient.generateSasUrl({
    permissions: BlobSASPermissions.parse("r"),
    expiresOn: SAS_EXPIRY,
  });

const uploadToAzureBlob = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const ext = path.extname(localFilePath);
    const blobName = `uploads/${randomUUID()}${ext}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadFile(localFilePath);

    fs.unlinkSync(localFilePath);

    return {
      url: await getReadSasUrl(blockBlobClient),
      public_id: blobName,
    };
  } catch (error) {
    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
    return null;
  }
};

const deleteFromAzureBlob = async (publicId) => {
  try {
    const blockBlobClient = containerClient.getBlockBlobClient(publicId);
    await blockBlobClient.deleteIfExists();
  } catch (error) {
    console.log("Error deleting from Azure Blob Storage", error);
  }
};

export { uploadToAzureBlob, deleteFromAzureBlob };
