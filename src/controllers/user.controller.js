import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { generateAccessAndRefreshToken } from "../utils/tokenGenrator.js";
import jwt from "jsonwebtoken";



const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, password, phoneNumber } = req.body;

  const exitedUser = await User.findOne({
    $or: [{ email }, { phoneNumber }],
  });

  if (exitedUser) {
    throw new ApiError(409, "User with phone number or eamil already exists");
  }

  try {
    const user = await User.create({
      fullname,
      email,
      phoneNumber,
      password,
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken",
    );

    if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering a user");
    }
    return res
      .status(201)
      .json(new ApiResponse(201, createdUser, "User registered successfully!"));
  } catch (error) {
    console.log("User creation failed", error);
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { fullname, email, password, phoneNumber } = req.body;
  const user = await User.findOne({
    $or: [{ email }, { phoneNumber }],
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  // console.log(user._id);

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id, User
  );

  console.log("Token from function", accessToken, refresAccessToken)

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  if (!loggedInUser) {
    throw new ApiError(500, "Unable to login user");
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
    .json(new ApiResponse(200, loggedInUser, "User logged in successfully!"));
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
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
    .json(new ApiResponse(200, {}, "User logged out successfully"));
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
      process.env.REFRESH_TOKEN_SECRET,
    );
    const user = await User.findById(decodedToken?._id);

    if (!user || !user.refreshToken) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (user.refreshToken !== inComingRefreshToken) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 60 * 60 * 1000
    };

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user._id, User);

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

const getUserProfileDetails = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;

  if (!currentUserId) {
    throw new ApiError(401, "Not authenticated!");
  }

  const user = await User.findById(currentUserId).select(
    "-password -refreshToken",
  );

  res.status(200).json(new ApiResponse(200, user, "Current user details"));
});

const updateProfilePicture = asyncHandler(async (req, res) => {
  const profilePictureLocalPath = req.files?.profilePicture?.[0]?.path;
  // console.log("this is file path", profilePictureLocalPath)
  if (!profilePictureLocalPath) {
    throw new ApiError(400, "File is required");
  }

  const avatar = await uploadOnCloudinary(profilePictureLocalPath);

  if (!avatar?.url) {
    throw new ApiError(500, "Somthing went wrong while uploading avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        profilePictureUrl: avatar.url,
      },
    },
    { new: true },
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar details updated sucessfully!"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email, oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  let detailsUpdated = false;
  let passwordUpdated = false;
  let profilePictureUpdated = false;

  if (typeof fullname === "string" && fullname.trim().length) {
    user.fullname = fullname.trim();
    detailsUpdated = true;
  }

  if (typeof email === "string" && email.trim().length) {
    user.email = email.trim().toLowerCase();
    detailsUpdated = true;
  }

  if (oldPassword || newPassword) {
    if (!oldPassword || !newPassword) {
      throw new ApiError(400, "Both old and new passwords are required");
    }

    const isOldPasswordValid = await user.isPasswordCorrect(oldPassword);

    if (!isOldPasswordValid) {
      throw new ApiError(401, "Old password is incorrect");
    }

    user.password = newPassword;
    passwordUpdated = true;
  }

  if (detailsUpdated || passwordUpdated) {
    await user.save();
  }

  const safeUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  let message = "Account details updated successfully!";
  if (passwordUpdated && detailsUpdated) {
    message = "Account details and password updated successfully!";
  } else if (passwordUpdated) {
    message = "Password updated successfully!";
  }

  return res.status(200).json(new ApiResponse(200, safeUser, message));
});

export {
  registerUser,
  loginUser,
  refresAccessToken,
  logoutUser,
  getUserProfileDetails,
  updateAccountDetails,
  updateProfilePicture,
};
