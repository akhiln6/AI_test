import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISettings extends Document {
  companyName: string;
  email: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  taxId?: string; // Tax ID / EIN / VAT / GST
  currency: string;
  defaultTaxRate: number;
  paymentDetails?: string; // e.g. Bank Account / Wire instructions / UPI ID
  defaultTerms?: string;
  logoUrl?: string;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    companyName: { type: String, default: "Acme Corporation" },
    email: { type: String, default: "billing@acme.com" },
    phone: { type: String, default: "+1 (555) 019-2834" },
    address: {
      street: { type: String, default: "123 Business Avenue, Suite 400" },
      city: { type: String, default: "San Francisco" },
      state: { type: String, default: "CA" },
      postalCode: { type: String, default: "94107" },
      country: { type: String, default: "USA" },
    },
    taxId: { type: String, default: "US-84920412" },
    currency: { type: String, default: "USD" },
    defaultTaxRate: { type: Number, default: 10 },
    paymentDetails: {
      type: String,
      default:
        "Bank: Silicon Valley Bank\nAccount Name: Acme Corp\nAccount Number: 9876543210\nRouting Number: 121000358\nSWIFT: SVBUS6S",
    },
    defaultTerms: {
      type: String,
      default:
        "Payment is due within 14 days of invoice date. Thank you for your business!",
    },
    logoUrl: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

const Settings: Model<ISettings> =
  mongoose.models.Settings || mongoose.model<ISettings>("Settings", SettingsSchema);

export default Settings;

