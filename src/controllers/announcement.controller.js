import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Announcement } from "../models/announcement.model.js";
import { uploadToAzureBlob, deleteFromAzureBlob } from "../utils/azureBlob.js";

const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, description, message, audience, link, eventDate, venue } = req.body;

  const content = description || message;
  if (!title || !content) {
    throw new ApiError(400, "Title and description are required");
  }

  let imageUrl = "";
  let imagePublicId = "";
  if (req.file?.path) {
    const uploaded = await uploadToAzureBlob(req.file.path);
    if (uploaded) {
      imageUrl = uploaded.url;
      imagePublicId = uploaded.public_id;
    }
  }

  const announcement = await Announcement.create({
    title: title.trim(),
    description: content.trim(),
    isPublished: true,
    publishedAt: Date.now(),
    audience: audience?.trim() || "All",
    link: link?.trim() || "",
    eventDate: eventDate ? new Date(eventDate) : null,
    venue: venue?.trim() || "",
    createdBy: req.user._id,
    imageUrl,
    imagePublicId,
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

const getPublicAnnouncements = asyncHandler(async (_req, res) => {
  const announcements = await Announcement.find({ isPublished: true })
    .select("-createdBy")
    .sort({ publishedAt: -1 });
  return res
    .status(200)
    .json(new ApiResponse(200, announcements, "Announcements fetched"));
});

const getPublicAnnouncementById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid announcement id");
  }
  const announcement = await Announcement.findOne({ _id: id, isPublished: true }).select("-createdBy");
  if (!announcement) {
    throw new ApiError(404, "Announcement not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, announcement, "Announcement fetched"));
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
  const { title, description, message, audience, link, eventDate, venue } = req.body;
  const content = description || message;

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

  if (typeof content === "string" && content.trim()) {
    announcement.description = content.trim();
  }

  if (typeof audience === "string" && audience.trim()) {
    announcement.audience = audience.trim();
  }

  if (typeof link === "string") {
    announcement.link = link.trim();
  }

  if (eventDate !== undefined) {
    announcement.eventDate = eventDate ? new Date(eventDate) : null;
  }

  if (typeof venue === "string") {
    announcement.venue = venue.trim();
  }

  if (req.file?.path) {
    if (announcement.imagePublicId) {
      await deleteFromAzureBlob(announcement.imagePublicId);
    }
    const uploaded = await uploadToAzureBlob(req.file.path);
    if (uploaded) {
      announcement.imageUrl = uploaded.url;
      announcement.imagePublicId = uploaded.public_id;
    }
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

  if (deletedAnnouncement.imagePublicId) {
    await deleteFromAzureBlob(deletedAnnouncement.imagePublicId);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deletedAnnouncement, "Announcement deleted"));
});

export {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  getPublicAnnouncements,
  getPublicAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
};
