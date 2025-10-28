import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";

// 📌 Create product
export const createProduct = async (req, res) => {
  try {
    const {
      modelName,
      description,
      price,
      discount,
      specialDiscount,
      stockCount,
      availableSizes,
      tags,
      Hot,
    } = req.body;

    if (!modelName || !price) {
      return res.status(400).json({ message: "Model name and price are required" });
    }

    let photos = [];

    // ✅ Allow up to 5 photos (not exactly 5)
    if (req.files && req.files.length > 0) {
      if (req.files.length > 5) {
        return res.status(400).json({ message: "You can upload up to 5 photos only" });
      }

      const uploadToCloudinary = (file) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "products", timeout: 60000 },
            (error, result) => {
              if (error) return reject(error);
              resolve({
                url: result.secure_url,
                public_id: result.public_id,
              });
            }
          );
          stream.end(file.buffer);
        });
      };

      photos = await Promise.all(req.files.map((file) => uploadToCloudinary(file)));
    } else {
      return res.status(400).json({ message: "At least one product photo is required" });
    }

    const product = new Product({
      modelName,
      description,
      price,
      discount,
      specialDiscount,
      stockCount,
      photos,
      availableSizes,
      tags: Array.isArray(tags)
        ? tags
        : typeof tags === "string"
        ? JSON.parse(tags)
        : [],
      createdBy: req.user?.id || null,
      Hot,
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error("Create product error:", err);
    res.status(500).json({ message: err.message });
  }
};


// 📌 Get all products
export const getProducts = async (req, res) => {
  try {
    const { limit, size } = req.query;

    const query = {};
    if (size) query.availableSizes = size;

    const products = await Product.find(query)
      .select("modelName price finalPrice finalSpecialPrice discount specialDiscount stockCount photos createdAt Hot availableSizes")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) || 20)
      .lean();

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📌 Get single product
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select("-__v");
    if (!product)
      return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📌 Update product
export const updateProduct = async (req, res) => {
  try {
    const {
      modelName,
      description,
      price,
      discount,
      specialDiscount,
      stockCount,
      availableSizes,
      existingPhotos,
      tags,
      Hot,
    } = req.body;

    const updateData = {};

    if (modelName) updateData.modelName = modelName;
    if (description) updateData.description = description;
    if (price) updateData.price = Number(price);
    if (discount) updateData.discount = Number(discount);
    if (specialDiscount) updateData.specialDiscount = Number(specialDiscount);
    if (stockCount !== undefined) updateData.stockCount = Number(stockCount);
    if (tags) {
      updateData.tags = typeof tags === "string" ? JSON.parse(tags) : tags;
    }
    if (availableSizes) updateData.availableSizes = availableSizes;
    if (Hot !== undefined) updateData.Hot = Hot;

    // ✅ Handle photos (allow up to 5 total)
    let photos = [];

    if (existingPhotos) {
      try {
        photos =
          typeof existingPhotos === "string"
            ? JSON.parse(existingPhotos)
            : existingPhotos;

        if (!Array.isArray(photos)) {
          return res
            .status(400)
            .json({ message: "existingPhotos must be an array" });
        }

        photos = photos.filter((img) => img.url && img.public_id);
      } catch {
        return res
          .status(400)
          .json({ message: "Invalid existingPhotos format" });
      }
    }

    if (req.files && req.files.length > 0) {
      if (photos.length + req.files.length > 5) {
        return res
          .status(400)
          .json({ message: "You can have up to 5 photos in total" });
      }

      const uploadToCloudinary = (file) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "products", timeout: 60000 },
            (error, result) => {
              if (error) reject(error);
              else
                resolve({
                  url: result.secure_url,
                  public_id: result.public_id,
                });
            }
          );
          stream.end(file.buffer);
        });
      };

      const uploaded = await Promise.all(
        req.files.map((file) => uploadToCloudinary(file))
      );
      photos = [...photos, ...uploaded];
    }

    if (photos.length > 0) {
      updateData.photos = photos;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    res
      .status(200)
      .json({ message: "Product updated successfully", product });
  } catch (err) {
    console.error("Update product error:", err);
    res
      .status(500)
      .json({ message: "Server error while updating product" });
  }
};


// 📌 Delete product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProductsByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    if (!groupId) {
      return res.status(400).json({ message: "Group ID is required" });
    }

    // Find group & populate products
    const group = await ProductGroup.findById(groupId).populate("products");

    if (!group) {
      return res.status(404).json({ message: "Product group not found" });
    }

    res.json({
      groupId: group._id,
      groupName: group.name,
      tags: group.tags,
      photo: group.photo,
      products: group.products, // populated product list
    });
  } catch (err) {
    console.error("Error fetching products by group:", err);
    res.status(500).json({ message: "Server error while fetching products by group" });
  }
};

export const getProductsByTag = async (req, res) => {
  try {
    const { q } = req.query;
console.log(q);

    if (!q) {
      return res.status(400).json({ success: false, message: "Tag is required" });
    }

    const validTags = [
      "Watches",
      "Perfume",
      "Belt & Wallet",
      "Sunglasses",
      "Electronic Items",
      "Shoes",
      "Formal Shoes",
      "Flip Flop",
    ];

    if (!validTags.includes(q)) {
      return res.status(400).json({
        success: false,
        message: `Invalid tag. Allowed tags: ${validTags.join(", ")}`,
      });
    }

    const products = await Product.find({ tags: q });

    if (products.length === 0) {
      return res.status(404).json({ success: false, message: "No products found for this tag" });
    }

    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    console.error("Error fetching products by tag:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const searchProducts = async (req, res) => {
  try {
    const { q } = req.query; // e.g. /api/products/search?q=watch

    if (!q || q.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Search query (q) is required",
      });
    }

    // Build a case-insensitive regex
    const regex = new RegExp(q, "i");

    // Search across multiple fields
    const products = await Product.find({
      $or: [
        { modelName: regex },
        { description: regex },
        { tags: regex },
      ],
    });

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No matching products found",
      });
    }

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Error in universal search:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
