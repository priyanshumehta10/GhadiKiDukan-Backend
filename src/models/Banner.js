// models/Banner.ts
import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
  image: {                 // Only the image
    url: { type: String, required: true },
    public_id: { type: String, required: true },
  },
  isActive: { type: Boolean, default: true },  // Show or hide banner
  createdAt: { type: Date, default: Date.now },
});

const Banner = mongoose.models.Banner || mongoose.model("Banner", bannerSchema);
export default Banner;
