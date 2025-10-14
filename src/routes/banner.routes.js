import express from "express";
import multer from "multer";
import { createBanner, getBanners, updateBanner, deleteBanner } from "../controllers/banner.controller.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // Memory storage like review

// Public
router.get("/", getBanners);

// Admin
router.post("/", upload.single("image"), createBanner);
router.put("/:id", upload.single("image"), updateBanner);
router.delete("/:id", deleteBanner);

export default router;
