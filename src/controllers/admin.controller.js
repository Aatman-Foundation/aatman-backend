import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Admin } from "../models/admin.model.js";
import { generateAccessAndRefreshToken } from "../utils/tokenGenrator.js";
import { User } from "../models/user.model.js";
import { MedicalProfessional } from "../models/medicalProfessional.model.js";
import { NonMedicalProfessional } from "../models/nonMedicalProfessional.model.js";
import jwt from "jsonwebtoken";

const registerAdmin = asyncHandler(async (req, res) => {
  const { fullname, email, password, phoneNumber } = req.body;

  if (!fullname || !email || !password || !phoneNumber) {
    throw new ApiError(400, "All fields are required");
  }

  const existingAdmin = await Admin.findOne({
    $or: [{ email }, { phoneNumber }],
  });

  if (existingAdmin) {
    throw new ApiError(409, "Admin already exists");
  }

  const admin = await Admin.create({
    fullname,
    email,
    password,
    phoneNumber,
  });

  const createdAdmin = await Admin.findById(admin._id).select(
    "-password -refreshToken",
  );

  if (!createdAdmin) {
    throw new ApiError(500, "Something went wrong while registering an admin");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdAdmin, "Admin registered successfully!"));
});

const adminLogin = asyncHandler(async (req, res) => {
  const { phoneNumber, email, password } = req.body;

  // console.log(password);

  // validation
  if (!(email || phoneNumber)) {
    throw new ApiError(400, "Email or phone number is required");
  }

  const admin = await Admin.findOne({
    $or: [{ email }, { phoneNumber }],
  });

  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  const isPasswordValid = await admin.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  // console.log(admin._id);

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    admin._id,
    Admin,
  );

  console.log(accessToken);

  const loggedInAdmin = await Admin.findById(admin._id).select(
    "-password -refreshToken",
  );

  if (!loggedInAdmin) {
    throw new ApiError(500, "Unable to login admin");
  }

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, loggedInAdmin, "Admin logged in successfully!"));
});

const adminLogout = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id) {
    throw new ApiError(401, "User not authenticated");
  }
  await Admin.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined },
    },
    { new: true },
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Admin logged out successfully"));
});

const refresAccessToken = asyncHandler(async (req, res) => {
  const inComingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!inComingRefreshToken) {
    throw new ApiError(400, "Refresh token required");
  }

  try {
    const decodedToken = jwt.verify(
      inComingRefreshToken,
      process.env.ADMIN_TOKEN_SECRET,
    );
    const admin = await Admin.findById(decodedToken?._id);

    if (!admin || !admin.refreshToken) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (admin.refreshToken !== inComingRefreshToken) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    };

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(admin._id, Admin);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed successfully",
        ),
      );
  } catch (error) {
    const message =
      error?.name === "TokenExpiredError"
        ? "Refresh token expired"
        : error?.message || "Invalid refresh token";

    throw new ApiError(401, message);
  }
});

const getAdminDetails = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;
  if (!currentUserId) {
    throw new ApiError(401, "Not authenticated!");
  }

  const user = await Admin.findById(currentUserId).select(
    "-password -refreshToken",
  );

  res.status(200).json(new ApiResponse(200, user, "Current user details"));
});

const getUserProfileDetails = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;

  if (!currentUserId) {
    throw new ApiError(401, "Not authenticated!");
  }

  const user = await Admin.findById(currentUserId).select(
    "-password -refreshToken",
  );

  res.status(200).json(new ApiResponse(200, user, "Current user details"));
});

const getUsersStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    verifiedUsers,
    unverifiedUsers,
    medicalProfiles,
    nonMedicalProfiles,
  ] = await Promise.all([
    User.estimatedDocumentCount(),
    User.countDocuments({ isEmailVerified: true }),
    User.countDocuments({ isEmailVerified: false }),
    MedicalProfessional.estimatedDocumentCount(),
    NonMedicalProfessional.estimatedDocumentCount(),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          total: totalUsers,
          verified: verifiedUsers,
          unverified: unverifiedUsers,
        },
        profile: {
          medical: medicalProfiles,
          nonMedical: nonMedicalProfiles,
        },
      },
      "User stats fetched successfully!",
    ),
  );
});

const getAllUsers = asyncHandler (async (req, res) => {
  const allUsers = await User.find().select(
    "-password -refreshToken"
  );

  res.status(200).json( new ApiResponse (200, allUsers, "All user fetched data!"))
}) 

const getUserDetailsById = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  console.log(userId);
  if (!userId) {
    throw new ApiError(400, "User id not provided");
  }

  const currentUser = await User.findById(userId);

  if (currentUser.registeredAs === "medical_prof") {
    const medicalProf = await MedicalProfessional.findOne({
      userId: currentUser._id,
    });

    res.status(200).json( new ApiResponse(200, { professionalType: "medical_prof", data: medicalProf }, "Data fetched successfully!")
  );
  } else {
    const nonMedicalProf = await NonMedicalProfessional.findOne({
      userId: currentUser._id,
    });

   res.status(200).json( new ApiResponse(200, { professionalType: "non_medical", data: nonMedicalProf }, "Data fetched successfully!")
  );
  }
});

export {
  registerAdmin,
  adminLogin,
  refresAccessToken,
  adminLogout,
  getAdminDetails,
  getUsersStats,
  getAllUsers,
  getUserDetailsById,
};
