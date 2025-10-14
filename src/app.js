import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import inquiryRoutes from "./routes/inquiry.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import productGroup from "./routes/productGroup.routes.js";
import bannerRoutes from "./routes/banner.routes.js";

dotenv.config();

const app = express();

// Convert env list into array
const allowedOrigins = process.env.CORS_ORIGIN.split(",");

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/product", productRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/review",reviewRoutes);
app.use("/api/productGroup",productGroup);
app.use("/api/banners", bannerRoutes );

app.get("/", (req, res) => {
  res.send("API is running...");
});

export default app;
