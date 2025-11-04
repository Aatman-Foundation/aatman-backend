import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Admin } from "../models/admin.model.js";
import { User } from "../models/user.model.js";

const verifyAnyToken = (token) => {
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (err1) {
    try {
      return jwt.verify(token, process.env.ADMIN_TOKEN_SECRET);
    } catch (err2) {
      throw new ApiError(401, "Invalid or expired token");
    }
  }
};

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    (authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : null);

  if (!token) {
    throw new ApiError(401, "Unauthorized, No token provided!");
  }


  if (!token) {
    throw new ApiError(401, "Unauthorized: No token provided");
  }

  try {
    const decodedToken = verifyAnyToken(token);

    let currentUser;
    switch (decodedToken.role) {
      case "user":
        currentUser = await User.findById(decodedToken._id).select(
          "-password -refreshToken"
        );
        break;
      case "admin":
        currentUser = await Admin.findById(decodedToken._id).select(
          "-password -refreshToken"
        );
        break;
      default:

        throw new ApiError(401, "Unauthorized: Invalid role in token");
    }

    if (!currentUser) {
      throw new ApiError(401, "Unauthorized: Account not found");
    }

    req.user = currentUser;
    req.user.role = decodedToken.role; 
    next();
  } catch (error) {

    throw new ApiError(401, error?.message || "Invalid access token");
  }
});