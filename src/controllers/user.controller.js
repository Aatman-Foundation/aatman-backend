import { asyncHandlers } from "../utils/asyncHandlers.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const genrateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User does not exist");
    }
    const accessToken = user.genrateAccessToken();
    const refreshToken = user.genrateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
     
    throw new ApiError(500,"Something went wrong while genrating access tokens and refresh tokens",error 
    );
   
   
  }
};

const registerUser = asyncHandlers( async (req, res) => {
  const { fullname, email, password, phoneNumber } = req.body;
  // validation

  if (!fullname, !email, !password, !phoneNumber) {
    throw new ApiError(400, "All fields are required");
  }

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
      .json(new ApiResponse(200, createdUser, "User registered successfully!"));
  } catch (error) {
    console.log("User creation failed", error);

  }
});

const loginUser = asyncHandlers(async (req, res) => {
  // get data from body
  const { phoneNumber, email, password } = req.body;

  // console.log(password);

  // validation
  if (!(email || phoneNumber)) {
    throw new ApiError(400, "Email or phone number is required");
  }

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

  const { accessToken, refreshToken } = await genrateAccessAndRefreshToken(
    user._id,
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  if (!loggedInUser) {
    throw new ApiError(401, "Unable to login user");
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
    .json(new ApiResponse(200, loggedInUser, "User logged in successfully!"))
});

const logoutUser = asyncHandlers(async (req, res) => {
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

const refresAccessToken = asyncHandlers(async (req, res) => {
  const inComingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!inComingRefreshToken) {
    throw new ApiError(401, "Refresh token required");
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
    };

    const { accessToken, refreshToken: newRefreshToken } =
      await genrateAccessAndRefreshToken(user._id);

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


const getUserProfileDetails = asyncHandlers(async (req, res) => {

  const currentUserId = req.user._id;

  if (!currentUserId) {
    throw new ApiError(401, "Not authenticated!");
  }

  const user = await User.findById(currentUserId).select(
    "-password -refreshToken"
  );

  res.status(200).json(new ApiResponse(200, user, "Current user details"));
});

const updateProfilePicture = asyncHandlers (async (req, res)=>{
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
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar details updated sucessfully!"));
})


const updateAccountDetails = asyncHandlers(async (req, res) => {
  const { fullname, email, oldPassword, newPassword} = req.body;

  const user = await User.findById(req.user._id);
  

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  let detailsUpdated = false;
  let passwordUpdated = false;
  let profilePictureUpdated = false

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

  const safeUser = await User.findById(user._id).select("-password -refreshToken");

  let message = "Account details updated successfully!";
  if (passwordUpdated && detailsUpdated) {
    message = "Account details and password updated successfully!";
  } else if (passwordUpdated) {
    message = "Password updated successfully!";
  }
  


  return res
    .status(200)
    .json(new ApiResponse(200, safeUser, message));
});


export {
  registerUser,
  loginUser,
  refresAccessToken,
  logoutUser,
  getUserProfileDetails,
  updateAccountDetails,
  updateProfilePicture
};
