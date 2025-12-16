import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { requireRole } from "../validator/requiredRoles.js";
import { userRegisterValidator, userLoginValidator, medicalProfessionalRegistration, nonMedicalProfessionalRegistration } from "../validator/index.js"
import {normalizeMultipartBody} from "../middlewares/normalizeMultipartBody.js"
import { validate } from "../middlewares/validator.middleware.js"
import { ROLES } from "../utils/constants.js";
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
import { uploadResearch, getMyResearchUploads, getResearchById } from "../controllers/research.controller.js";


const router = Router();

router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, loginUser);
router.route("/refresh").post(refresAccessToken);
router.route("/logout").post(verifyJWT, requireRole(ROLES.USER),logoutUser);
router.route("/me").get(verifyJWT, requireRole(ROLES.USER),getUserProfileDetails);
router.route("/update-profile-picture").post(
  verifyJWT,
  requireRole(ROLES.USER),
  upload.fields([
    {
      name: "personalPhoto",
      maxCount: 1,
    },
  ]),
  updateProfilePicture,
);
router.route("/update-details").post(verifyJWT, requireRole(ROLES.USER),updateAccountDetails)
router.route("/medical-professional-registration").post(verifyJWT, requireRole(ROLES.USER),
  upload.single("personalPhoto"), normalizeMultipartBody,
  medicalProfessionalRegistration(), validate, registerMedicalProfessional);
router.route("/non-medical-professional-registration").post(verifyJWT,requireRole(ROLES.USER),
  upload.single("personalPhoto"), normalizeMultipartBody,
  nonMedicalProfessionalRegistration(), validate, registerNonMedicalProfessional);
router.route("/research").post(
  verifyJWT,
  requireRole(ROLES.USER),
  upload.single("pdf"),
  uploadResearch,
);
router.route("/research").get(verifyJWT, requireRole(ROLES.USER), getMyResearchUploads);
router.route("/research/:id").get(verifyJWT, requireRole(ROLES.USER), getResearchById);

export default router;
