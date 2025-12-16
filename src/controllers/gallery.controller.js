import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { GalleryItem } from "../models/gallery.model.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";

const createGalleryItem = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const imagePath = req.file?.path;

  if (!title || !imagePath) {
    throw new ApiError(400, "Title and image are required");
  }

  const uploadedImage = await uploadOnCloudinary(imagePath);

  if (!uploadedImage?.url || !uploadedImage?.public_id) {
    throw new ApiError(500, "Failed to upload image");
  }

  const galleryItem = await GalleryItem.create({
    title: title.trim(),
    description: description?.trim(),
    imageUrl: uploadedImage.url,
    imagePublicId: uploadedImage.public_id,
    createdBy: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, galleryItem, "Gallery item created"));
});

const getGalleryItems = asyncHandler(async (_req, res) => {
  const items = await GalleryItem.find().sort({ createdAt: -1 });
  return res
    .status(200)
    .json(new ApiResponse(200, items, "Gallery items fetched"));
});

const getGalleryItemById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid gallery id");
  }

  const item = await GalleryItem.findById(id);

  if (!item) {
    throw new ApiError(404, "Gallery item not found");
  }

  return res.status(200).json(new ApiResponse(200, item, "Gallery item fetched"));
});

const updateGalleryItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  const imagePath = req.file?.path;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid gallery id");
  }

  const item = await GalleryItem.findById(id);

  if (!item) {
    throw new ApiError(404, "Gallery item not found");
  }

  if (typeof title === "string" && title.trim()) {
    item.title = title.trim();
  }

  if (typeof description === "string") {
    item.description = description.trim();
  }

  if (imagePath) {
    const uploadedImage = await uploadOnCloudinary(imagePath);

    if (!uploadedImage?.url || !uploadedImage?.public_id) {
      throw new ApiError(500, "Failed to upload image");
    }

    if (item.imagePublicId) {
      await deleteFromCloudinary(item.imagePublicId);
    }

    item.imageUrl = uploadedImage.url;
    item.imagePublicId = uploadedImage.public_id;
  }

  await item.save();

  return res.status(200).json(new ApiResponse(200, item, "Gallery item updated"));
});

const deleteGalleryItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid gallery id");
  }

  const item = await GalleryItem.findById(id);

  if (!item) {
    throw new ApiError(404, "Gallery item not found");
  }

  if (item.imagePublicId) {
    await deleteFromCloudinary(item.imagePublicId);
  }

  await item.deleteOne();

  return res.status(200).json(new ApiResponse(200, item, "Gallery item deleted"));
});

export {
  createGalleryItem,
  getGalleryItems,
  getGalleryItemById,
  updateGalleryItem,
  deleteGalleryItem,
};
