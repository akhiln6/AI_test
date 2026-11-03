import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description?: string;
  sku?: string;
  unitPrice: number;
  taxRate: number; // percentage, e.g. 10 for 10%
  category?: string;
  unit?: string; // e.g. "hours", "units", "items", "month"
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: [true, "Product name is required"], trim: true },
    description: { type: String, default: "" },
    sku: { type: String, trim: true, default: "" },
    unitPrice: { type: Number, required: [true, "Unit price is required"], min: 0, default: 0 },
    taxRate: { type: Number, default: 0, min: 0, max: 100 },
    category: { type: String, default: "Services" },
    unit: { type: String, default: "units" },
  },
  {
    timestamps: true,
  }
);

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;

