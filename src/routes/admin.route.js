import { Router } from "express";
import { ROLES } from "../utils/constants.js";
import { requireRole } from "../validator/requiredRoles.js";
import {registerAdmin, adminLogin, refresAccessToken, adminLogout, getAdminDetails, getUsersStats, getUserDetailsById, getAllUsers, deleteUserById} from "../controllers/admin.controller.js"
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncementById,
  getAnnouncements,
  updateAnnouncement,
} from "../controllers/announcement.controller.js";
import {
  createGalleryItem,
  deleteGalleryItem,
  getGalleryItemById,
  getGalleryItems,
  updateGalleryItem,
} from "../controllers/gallery.controller.js";
import { validate } from "../middlewares/validator.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {userRegisterValidator, userLoginValidator} from "../validator/index.js"


const router = Router();

router.route("/register-admin").post(userRegisterValidator(), validate, registerAdmin);
router.route("/admin-login").post(userLoginValidator(), validate, adminLogin);
router.route("/admin-refresh").post(verifyJWT, requireRole(ROLES.ADMIN),refresAccessToken )
router.route("/admin-logout").post(verifyJWT, requireRole(ROLES.ADMIN),adminLogout)
router.route("/me").get(verifyJWT, requireRole(ROLES.ADMIN),getAdminDetails)
router.route("/get-user-stats").get(verifyJWT, requireRole(ROLES.ADMIN),getUsersStats);
router.route("/get-all-users").get(verifyJWT, getAllUsers);
router.route("/get-user/:id").get(verifyJWT, requireRole(ROLES.ADMIN), getUserDetailsById);
router.route("/delete-user/:id").post(verifyJWT, requireRole(ROLES.ADMIN), deleteUserById);
router
  .route("/announcements")
  .post(verifyJWT, requireRole(ROLES.ADMIN), createAnnouncement)
  .get(verifyJWT, requireRole(ROLES.ADMIN), getAnnouncements);
router
  .route("/announcements/:id")
  .get(verifyJWT, requireRole(ROLES.ADMIN), getAnnouncementById)
  .patch(verifyJWT, requireRole(ROLES.ADMIN), updateAnnouncement)
  .delete(verifyJWT, requireRole(ROLES.ADMIN), deleteAnnouncement);
router
  .route("/gallery")
  .post(
    verifyJWT,
    requireRole(ROLES.ADMIN),
    upload.single("image"),
    createGalleryItem,
  )
  .get(verifyJWT, requireRole(ROLES.ADMIN), getGalleryItems);
router
  .route("/gallery/:id")
  .get(verifyJWT, requireRole(ROLES.ADMIN), getGalleryItemById)
  .patch(
    verifyJWT,
    requireRole(ROLES.ADMIN),
    upload.single("image"),
    updateGalleryItem,
  )
  .delete(verifyJWT, requireRole(ROLES.ADMIN), deleteGalleryItem);


export default router;
