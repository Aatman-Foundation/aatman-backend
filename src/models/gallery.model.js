import mongoose, { Schema } from "mongoose";

const galleryItemSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    imagePublicId: {
      type: String,
      required: true,
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
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true },
);

export const GalleryItem = mongoose.model("GalleryItem", galleryItemSchema);
