import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Announcement } from "../models/announcement.model.js";

const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, description, isPublished = true } = req.body;

  const parsedIsPublished =
    typeof isPublished === "boolean"
      ? isPublished
      : typeof isPublished === "string"
        ? isPublished.toLowerCase() === "true"
        : true;

  if (!title || !description) {
    throw new ApiError(400, "Title and description are required");
  }

  const announcement = await Announcement.create({
    title: title.trim(),
    description: description.trim(),
    isPublished: parsedIsPublished,
    publishedAt: parsedIsPublished ? Date.now() : null,
    createdBy: req.user._id,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, announcement, "Announcement created successfully"),
    );
});

const getAnnouncements = asyncHandler(async (_req, res) => {
  const announcements = await Announcement.find().sort({ createdAt: -1 });
  return res
    .status(200)
    .json(new ApiResponse(200, announcements, "Announcements fetched"));
});

const getAnnouncementById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid announcement id");
  }

  const announcement = await Announcement.findById(id);
  if (!announcement) {
    throw new ApiError(404, "Announcement not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, announcement, "Announcement fetched"));
});

const updateAnnouncement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, isPublished } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid announcement id");
  }

  const announcement = await Announcement.findById(id);
  if (!announcement) {
    throw new ApiError(404, "Announcement not found");
  }

  if (typeof title === "string" && title.trim()) {
    announcement.title = title.trim();
  }

  if (typeof description === "string" && description.trim()) {
    announcement.description = description.trim();
  }

  if (typeof isPublished === "boolean" || typeof isPublished === "string") {
    const parsedIsPublished =
      typeof isPublished === "boolean"
        ? isPublished
        : isPublished.toLowerCase() === "true";

    announcement.isPublished = parsedIsPublished;
    announcement.publishedAt = parsedIsPublished ? Date.now() : null;
  }

  await announcement.save();

  return res
    .status(200)
    .json(new ApiResponse(200, announcement, "Announcement updated"));
});

const deleteAnnouncement = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid announcement id");
  }

  const deletedAnnouncement = await Announcement.findByIdAndDelete(id);

  if (!deletedAnnouncement) {
    throw new ApiError(404, "Announcement not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deletedAnnouncement, "Announcement deleted"));
});

export {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
};
