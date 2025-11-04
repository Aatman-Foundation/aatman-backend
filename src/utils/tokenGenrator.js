import { ApiError } from "./ApiError.js";

const generateAccessAndRefreshToken = async (userId,  modelName) => {

   try {
    const user = await modelName.findById(userId);
    if (!user) {
      throw new ApiError(404, "User does not exist");
    }
    const accessToken = user.genrateAccessToken();
    const refreshToken = user.genrateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
    throw new ApiError(
      500,
      "Something went wrong while genrating access tokens and refresh tokens",
      error,
    );
  }
}

export {generateAccessAndRefreshToken}