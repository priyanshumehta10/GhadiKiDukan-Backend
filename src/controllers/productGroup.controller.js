import ProductGroup, { PRODUCT_TAGS } from "../models/ProductGroup.js";
import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";

// ✅ Upload helper
const uploadToCloudinary = (file, folder = "productGroups") => {
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

// ✅ Create Product Group
export const createProductGroup = async (req, res) => {
  try {
    const { name, productIds, tags } = req.body;

    if (!name) return res.status(400).json({ message: "Group name is required" });

    // Upload photo
    if (!req.file) return res.status(400).json({ message: "Group photo is required" });
    const photo = await uploadToCloudinary(req.file);

    // Validate product IDs
    let validProducts = [];
    if (productIds && productIds.length > 0) {
      validProducts = await Product.find({ _id: { $in: productIds } }).select("_id");
    }

    const group = new ProductGroup({
      name,
      photo,
      products: validProducts.map((p) => p._id),
      createdBy: req.user?.id,
      tags: Array.isArray(tags)
        ? tags
        : typeof tags === "string"
        ? JSON.parse(tags)
        : [],
    });

    await group.save();
    res.status(201).json(group);
  } catch (err) {
    console.error("Create ProductGroup error:", err);
    res.status(500).json({ message: "Server error while creating product group" });
  }
};

// ✅ Get all Product Groups
export const getProductGroups = async (req, res) => {
  try {
    const groups = await ProductGroup.find()
      .populate("products")
      .select("-__v");
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get single Product Group
export const getProductGroup = async (req, res) => {
  try {
    const group = await ProductGroup.findById(req.params.id).populate("products");
    if (!group) return res.status(404).json({ message: "Product group not found" });
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Update Product Group
export const updateProductGroup = async (req, res) => {
  try {
    const { name, existingPhoto, tags, productIds } = req.body;
    const updateData = {};

    if (name) updateData.name = name;

    // Tags
    if (tags) {
      updateData.tags =
        typeof tags === "string" ? JSON.parse(tags) : tags;
    }

// Products
if (productIds) {
  let productsArray = productIds;
  if (typeof productIds === "string") {
    try {
      productsArray = JSON.parse(productIds); // <-- convert string to array
    } catch {
      return res.status(400).json({ message: "Invalid productIds format" });
    }
  }

  const validProducts = await Product.find({ _id: { $in: productsArray } }).select("_id");
  updateData.products = validProducts.map((p) => p._id);
}


    // Photo (keep old or upload new)
    let photo = null;
    if (existingPhoto) {
      try {
        const parsed =
          typeof existingPhoto === "string" ? JSON.parse(existingPhoto) : existingPhoto;
        if (parsed?.url && parsed?.public_id) {
          photo = parsed;
        }
      } catch {
        return res.status(400).json({ message: "Invalid existingPhoto format" });
      }
    }
    if (req.file) {
      photo = await uploadToCloudinary(req.file);
    }
    if (photo) updateData.photo = photo;

    const group = await ProductGroup.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!group) return res.status(404).json({ message: "Product group not found" });

    res.json({ message: "Product group updated successfully", group });
  } catch (err) {
    console.error("Update ProductGroup error:", err);
    res.status(500).json({ message: "Server error while updating product group" });
  }
};

// ✅ Delete Product Group
export const deleteProductGroup = async (req, res) => {
  try {
    const group = await ProductGroup.findByIdAndDelete(req.params.id);
    if (!group) return res.status(404).json({ message: "Product group not found" });
    res.json({ message: "Product group deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get Product Groups by Tag
export const getProductGroupsByTag = async (req, res) => {
  try {
    const { tag } = req.body;

    if (!tag) return res.status(400).json({ message: "Tag is required" });

    const groups = await ProductGroup.find({ tags: tag })
      .populate("products")
      .select("-__v");

    if (!groups || groups.length === 0) {
      return res
        .status(404)
        .json({ message: `No product groups found for tag: ${tag}` });
    }

    res.json(groups);
  } catch (err) {
    console.error("Get groups by tag error:", err);
    res.status(500).json({ message: "Server error while fetching product groups by tag" });
  }
};

export const getAllTags = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      tags: PRODUCT_TAGS,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch tags",
      error: error.message,
    });
  }
};

export const getAllProductGroupImages = async (req, res) => {
  try {
    // Fetch only the 'photo' field from all product groups
    const images = await ProductGroup.find({}, { photo: 1, _id: 0 });

    if (!images || images.length === 0) {
      return res.status(404).json({ message: "No product group images found" });
    }

    // Extract URLs and public_ids if needed
    const imageData = images.map((item) => ({
      url: item.photo.url,
      public_id: item.photo.public_id,
    }));

    res.status(200).json({ images: imageData });
  } catch (error) {
    console.error("Error fetching product group images:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
