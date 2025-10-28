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
const productSchema = new mongoose.Schema({
  modelName: { type: String, required: true }, // Model name
  description: { type: String, default: "" },  // Product description
  // Pricing
  price: { type: Number, required: true }, // Original price
  discount: { type: Number, default: 0 },  // % discount
  specialDiscount: { type: Number, default: 0 }, // Extra special % discount
  finalPrice: { type: Number },            // Auto-calculated (normal discount)
  finalSpecialPrice: { type: Number },     // Auto-calculated (special discount)
  Hot: { type: Boolean, default: false },
  // Stock
  stockCount: { type: Number, default: 0 }, // Available stock
  tags: {
    type: [String],
    enum: TAGS_ENUM,
    validate: [arrayLimit, "{PATH} exceeds the limit of 5"], // Max 5 tags
    default: [],
  },
  // Photos (maximum 5)
  photos: {
    type: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    validate: [
      function (val) {
        return val.length <= 5; // allow up to 5 photos
      },
      "Photos cannot exceed 5 images",
    ],
  },


  // Sizes
  availableSizes: { type: String, default: "free size" }, // e.g., ["S", "M", "L", "XL"]

  createdAt: { type: Date, default: Date.now },
});

// Auto-calculate final price & special price
productSchema.pre("save", function (next) {
  if (this.discount > 0) {
    this.finalPrice = this.price - (this.price * this.discount) / 100;
  } else {
    this.finalPrice = this.price;
  }

  if (this.specialDiscount > 0) {
    this.finalSpecialPrice =
      this.price - (this.price * this.specialDiscount) / 100;
  } else {
    this.finalSpecialPrice = this.price;
  }

  next();
});
function arrayLimit(val) {
  return val.length <= 5;
}


const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;