import express from "express";
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getProductsByGroup,
  getProductsByTag,
  searchProducts
} from "../controllers/product.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";
import multer from "multer";

const router = express.Router();

const storage = multer.memoryStorage(); 
const upload = multer({ storage });
// Routes
router.get("/search", searchProducts);
router.get("/Tag", getProductsByTag);
router.get("/group/:id", getProductsByGroup);

router.get("/", getProducts);
router.get("/:id", authMiddleware, getProduct);

router.post("/admin/", authMiddleware, adminMiddleware, upload.array("images", 5), createProduct);
router.put("/admin/:id", authMiddleware, adminMiddleware, upload.array("images", 5), updateProduct);
router.delete("/admin/:id", authMiddleware, adminMiddleware, deleteProduct);



export default router;
