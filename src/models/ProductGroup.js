import mongoose from "mongoose";

const TAGS_ENUM = [
  "Watches",
  "Perfume",
  "Belt & Wallet",
  "Sunglasses",
  "Electronic Items", // earbuds, smart watch etc.
  "Shoes",
  "Formal Shoes",
  "Flip Flop",
];

const ProductGroupSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Men’s Collection"
  photo: {
    url: { type: String, required: true },
    public_id: { type: String, required: true },
  },
  tags: {
    type: [String],
    enum: TAGS_ENUM,
    validate: [arrayLimit, "{PATH} exceeds the limit of 5"], // Max 5 tags
    default: [],
  },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }], // linked to Product schema
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

function arrayLimit(val) {
  return val.length <= 5;
}

export const PRODUCT_TAGS = TAGS_ENUM;

export default mongoose.model("ProductGroup", ProductGroupSchema);
