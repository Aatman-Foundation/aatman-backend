import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { userRegisterValidator, userLoginValidator, medicalProfessionalRegistration, nonMedicalProfessionalRegistration } from "../validator/index.js"
import {normalizeMultipartBody} from "../middlewares/normalizeMultipartBody.js"
import { validate } from "../middlewares/validator.middleware.js"


import {
  registerUser,
  loginUser,
  logoutUser,
  refresAccessToken,
  getUserProfileDetails,
  updateProfilePicture,
  updateAccountDetails
} from "../controllers/user.controller.js";
import { registerMedicalProfessional,registerNonMedicalProfessional } from "../controllers/ayushregistration.controller.js"


const router = Router();

router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, loginUser);
router.route("/refresh").post(refresAccessToken);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/me").get(verifyJWT, getUserProfileDetails);
router.route("/update-profile-picture").post(
  verifyJWT,
  upload.fields([
    {
      name: "personalPhoto",
      maxCount: 1,
    },
  ]),
  updateProfilePicture,
);
router.route("/update-details").post(verifyJWT, updateAccountDetails)
router.route("/medical-professional-registration").post(verifyJWT, 
  upload.single("personalPhoto"), normalizeMultipartBody,
  medicalProfessionalRegistration(), validate, registerMedicalProfessional);
router.route("/non-medical-professional-registration").post(verifyJWT, 
  upload.single("personalPhoto"), normalizeMultipartBody,
  nonMedicalProfessionalRegistration(), validate, registerNonMedicalProfessional);

export default router;
