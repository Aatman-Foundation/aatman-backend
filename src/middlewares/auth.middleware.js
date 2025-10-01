import jwt from "jsonwebtoken";
import { asyncHandlers } from "../utils/asyncHandlers.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandlers(async (req, res, next) => {
  // console.log("here we are")
  // console.log("Cookies are these", req.cookies);
  const authHeader = req.headers?.authorization;
  const bearerToken = typeof authHeader === "string" ? authHeader.trim() : "";
  const token =
    req.cookies?.accessToken ||
    (bearerToken.toLowerCase().startsWith("bearer ")
      ? bearerToken.slice(7).trim()
      : null);

  if (!token) {
    throw new ApiError(401, "Unauthorized, No token provided!");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const currentUser = await User.findById(decodedToken._id);

    if (!currentUser) {
      throw new ApiError(401, "Unauthorized: Account not found");
    }

    req.user = currentUser;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
