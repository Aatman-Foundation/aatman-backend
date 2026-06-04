import mongoose, { Schema } from "mongoose";

const announcementSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    audience: {
      type: String,
      trim: true,
      default: "All",
    },
    link: {
      type: String,
      trim: true,
      default: "",
    },
    eventDate: {
      type: Date,
      default: null,
    },
    venue: {
      type: String,
      trim: true,
      default: '',
    },
    imageUrl: {
      type: String,
      default: "",
    },
    imagePublicId: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

export const Announcement = mongoose.model(
  "Announcement",
  announcementSchema,
);
