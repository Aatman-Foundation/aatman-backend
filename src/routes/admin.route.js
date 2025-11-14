import { Router } from "express";
import {registerAdmin, adminLogin, refresAccessToken, adminLogout, getAdminDetails, getUsersStats, getUserDetailsById, getAllUsers, deleteUserById} from "../controllers/admin.controller.js"
import { validate } from "../middlewares/validator.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {userRegisterValidator, userLoginValidator} from "../validator/index.js"


const router = Router();

router.route("/register-admin").post(userRegisterValidator(), validate, registerAdmin);
router.route("/admin-login").post(userLoginValidator(), validate, adminLogin);
router.route("/admin-refresh").post(verifyJWT, refresAccessToken )
router.route("/admin-logout").post(verifyJWT, adminLogout)
router.route("/me").get(verifyJWT, getAdminDetails)
router.route("/get-user-stats").get(verifyJWT, getUsersStats);
router.route("/get-all-users").get(verifyJWT, getAllUsers);
router.route("/get-user/:id").get(verifyJWT, getUserDetailsById);
router.route("/delete-user/:id").post(verifyJWT, deleteUserById);


export default router;
