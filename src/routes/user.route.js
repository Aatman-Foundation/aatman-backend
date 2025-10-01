import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  registerUser,
  loginUser,
  logoutUser,
  refresAccessToken,
  getUserProfileDetails,
  updateProfilePicture,
  updateAccountDetails
} from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/refresh").post(refresAccessToken);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/me").get(verifyJWT, getUserProfileDetails);
router.route("/update-profile-picture").post(
  verifyJWT,
  upload.fields([
    {
      name: "profilePicture",
      maxCount: 1,
    },
  ]),
  updateProfilePicture,
);
router.route("/update-details").post(verifyJWT, updateAccountDetails)

export default router;
