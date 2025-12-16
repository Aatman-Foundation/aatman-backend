import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Research } from "../models/research.model.js";

const uploadResearch = asyncHandler(async (req, res) => {
  const { title, description, category } = req.body;
  const pdfPath = req.file?.path;

  if (!title || !pdfPath) {
    throw new ApiError(400, "Title and PDF are required");
  }

  const isPdf = req.file.mimetype === "application/pdf";
  if (!isPdf) {
    throw new ApiError(400, "Only PDF uploads are allowed");
  }

  const uploadedPdf = await uploadOnCloudinary(pdfPath);

  if (!uploadedPdf?.url || !uploadedPdf?.public_id) {
    throw new ApiError(500, "Failed to upload PDF");
  }

  const research = await Research.create({
    title: title.trim(),
    description: description?.trim(),
    category: category?.trim(),
    pdfUrl: uploadedPdf.url,
    pdfPublicId: uploadedPdf.public_id,
    uploadedBy: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, research, "Research uploaded successfully"));
});

const getMyResearchUploads = asyncHandler(async (req, res) => {
  const uploads = await Research.find({ uploadedBy: req.user._id }).sort({ createdAt: -1 });
  return res
    .status(200)
    .json(new ApiResponse(200, uploads, "Research uploads fetched"));
});

const getResearchById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid research id");
  }

  const research = await Research.findById(id);

  if (!research) {
    throw new ApiError(404, "Research not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, research, "Research fetched successfully"));
});

export { uploadResearch, getMyResearchUploads, getResearchById };
