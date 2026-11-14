import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICustomer extends Document {
  name: string;
  email: string;
  phone?: string;
  whatsappNumber?: string;
  company?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  taxNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: [true, "Customer name is required"], trim: true },
    email: { type: String, required: [true, "Customer email is required"], trim: true, lowercase: true },
    phone: { type: String, trim: true },
    whatsappNumber: { type: String, trim: true, default: "" },
    company: { type: String, trim: true },
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      postalCode: { type: String, default: "" },
      country: { type: String, default: "" },
    },
    taxNumber: { type: String, trim: true, default: "" },
    notes: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

// Always ensure fresh schema registration during dev
if (mongoose.models && mongoose.models.Customer) {
  delete mongoose.models.Customer;
}
const Customer: Model<ICustomer> =
  mongoose.models.Customer || mongoose.model<ICustomer>("Customer", CustomerSchema);

export default Customer;

