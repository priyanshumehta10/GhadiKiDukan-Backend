// controllers/bannerController.ts
import Banner from "../models/Banner.js";
import cloudinary from "../config/cloudinary.js";

// ✅ Cloudinary upload helper
const uploadToCloudinary = (file, folder = "banners") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, timeout: 60000 },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, public_id: result.public_id });
      }
    );
    stream.end(file.buffer);
  });
};

// ✅ Create Banner
export const createBanner = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Banner image is required" });

    const image = await uploadToCloudinary(req.file);

    const banner = new Banner({ image });
    await banner.save();
    res.status(201).json(banner);
  } catch (err) {
    console.error("Create Banner error:", err);
    res.status(500).json({ message: "Server error while creating banner" });
  }
};

// ✅ Get all active Banners
export const getBanners = async (_req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json(banners);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch banners", error: err.message });
  }
};

// ✅ Update Banner
export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    let image = null;

    if (req.file) {
      image = await uploadToCloudinary(req.file);
    }

    const updateData = { ...(image && { image }), ...(req.body.isActive !== undefined && { isActive: req.body.isActive }) };

    const banner = await Banner.findByIdAndUpdate(id, updateData, { new: true });

    if (!banner) return res.status(404).json({ message: "Banner not found" });

    res.status(200).json({ message: "Banner updated successfully", banner });
  } catch (err) {
    console.error("Update Banner error:", err);
    res.status(500).json({ message: "Server error while updating banner" });
  }
};

// ✅ Delete Banner
export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByIdAndDelete(id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });
    res.status(200).json({ message: "Banner deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error while deleting banner" });
  }
};
