import { Router } from "express";
import { getPublicAnnouncements, getPublicAnnouncementById } from "../controllers/announcement.controller.js";
import { getGalleryItems } from "../controllers/gallery.controller.js";
import { submitContact } from "../controllers/contact.controller.js";

const router = Router();

router.route("/announcements").get(getPublicAnnouncements);
router.route("/announcements/:id").get(getPublicAnnouncementById);
router.route("/gallery").get(getGalleryItems);
router.route("/contact").post(submitContact);

export default router;
