import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { MedicalProfessional } from "../models/medicalProfessional.model.js";
import { NonMedicalProfessional } from "../models/nonMedicalProfessional.model.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerMedicalProfessional = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const registrationFormData = req.body;

  if (!registrationFormData) {
    throw new ApiError(400, "Data not provided");
  }

  const personalPhotoPath = req.file.path;

  console.log(personalPhotoPath)

  try {
    if (!personalPhotoPath) {
      console.log("path is ", personalPhotoPath);
      throw new ApiError(400, "Personal photo is missing");
    }
  } catch (error) {
    console.log("Photo error", error);
  }

  const uploadedPhoto = await uploadOnCloudinary(personalPhotoPath);


  if (!uploadedPhoto?.url) {
    throw new ApiError(400, "Failed to upload personal photo");
  }

  try {
    const medicalProfessional = new MedicalProfessional({
      userId,
      ...req.body,
      personalPhoto: uploadedPhoto.url,
    });
    await medicalProfessional.save();

     await User.findByIdAndUpdate(
      userId,
      { $set: { registeredAs: "medical_prof" } },
      { new: true }
    );


    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          medicalProfessional,
          "Medical Professional registered successfully",
        ),
      );
  } catch (error) {
    console.log("Error regisrtating user", error);
    throw new ApiError(500, "Registartion failed");
  }
});

const registerNonMedicalProfessional = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const registrationFormData = req.body;

  if (!registrationFormData) {
    throw new ApiError(400, "Data not provided");
  }

  const personalPhotoPath = req.file.path;

  try {
    if (!personalPhotoPath) {
      console.log("path is ", personalPhotoPath);
      throw new ApiError(400, "Personal photo is missing");
    }
  } catch (error) {
    console.log("Photo error", error);
  }

  const uploadedPhoto = await uploadOnCloudinary(personalPhotoPath);

  if (!uploadedPhoto?.url) {
    throw new ApiError(400, "Failed to upload personal photo");
  }

  try {
    const nonMedicalProfessional = new NonMedicalProfessional({
      userId,
      ...req.body,
      personalPhoto: uploadedPhoto.url,
    });
    await nonMedicalProfessional.save();

    await User.findByIdAndUpdate(
      userId,
      { $set: { registeredAs: "non_medical_prof" } },
      { new: true }
    );

    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          nonMedicalProfessional,
          "Medical Professional registered successfully",
        ),
      );
  } catch (error) {
    console.log("Error regisrtating user", error);
    throw new ApiError(500, "Registartion failed");
  }
});

export { registerMedicalProfessional, registerNonMedicalProfessional };
