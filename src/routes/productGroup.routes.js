import express from "express";
import multer from "multer";
import authMiddleware from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";
import {
    createProductGroup,
    getProductGroups,
    getProductGroup,
    updateProductGroup,
    deleteProductGroup,
    getProductGroupsByTag,
    getAllTags,
    getAllProductGroupImages
} from "../controllers/productGroup.controller.js";

const router = express.Router();

// Memory storage for multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes
router.post(
    "/admin/",
    authMiddleware,
    adminMiddleware,
    upload.single("photo"), 
    createProductGroup
);

router.put(
    "/admin/:id",
    authMiddleware,
    adminMiddleware,
    upload.single("photo"),
    updateProductGroup
);

router.get("/", getProductGroups);
router.get("/:id",authMiddleware, getProductGroup);
router.delete("/admin/:id", authMiddleware, adminMiddleware, deleteProductGroup);
router.post("/Tag",authMiddleware, getProductGroupsByTag)
router.get("/tags/all",authMiddleware,getAllTags);
router.get("/tags/images",getAllProductGroupImages);

export default router;
