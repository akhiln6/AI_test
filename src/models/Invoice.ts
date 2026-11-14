import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInvoiceItem {
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number; // percentage
  discount: number; // percentage
  total: number;
}

export interface IPaymentRecord {
  _id?: string;
  amount: number;
  date: Date;
  method: "bank_transfer" | "credit_card" | "cash" | "upi" | "paypal" | "cheque" | "other";
  reference?: string;
  note?: string;
}

export interface IInvoiceCustomerSnapshot {
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
}

export interface IInvoice extends Document {
  invoiceNumber: string;
  customerId?: mongoose.Types.ObjectId;
  customer: IInvoiceCustomerSnapshot;
  issueDate: Date;
  dueDate: Date;
  items: IInvoiceItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  amountPaid: number;
  status: "draft" | "pending" | "paid" | "overdue" | "cancelled";
  currency: string;
  notes?: string;
  terms?: string;
  payments: IPaymentRecord[];
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceItemSchema = new Schema<IInvoiceItem>(
  {
    productId: { type: String, default: "" },
    description: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1, min: 0.01 },
    unitPrice: { type: Number, required: true, default: 0, min: 0 },
    taxRate: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    total: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const PaymentRecordSchema = new Schema<IPaymentRecord>({
  amount: { type: Number, required: true, min: 0.01 },
  date: { type: Date, default: Date.now },
  method: {
    type: String,
    enum: ["bank_transfer", "credit_card", "cash", "upi", "paypal", "cheque", "other"],
    default: "bank_transfer",
  },
  reference: { type: String, default: "" },
  note: { type: String, default: "" },
});

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: {
      type: String,
      required: [true, "Invoice number is required"],
      unique: true,
      trim: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
    },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, default: "" },
      whatsappNumber: { type: String, default: "" },
      company: { type: String, default: "" },
      address: {
        street: { type: String, default: "" },
        city: { type: String, default: "" },
        state: { type: String, default: "" },
        postalCode: { type: String, default: "" },
        country: { type: String, default: "" },
      },
      taxNumber: { type: String, default: "" },
    },
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    items: {
      type: [InvoiceItemSchema],
      validate: [(val: IInvoiceItem[]) => val.length > 0, "At least one item is required"],
    },
    subtotal: { type: Number, required: true, default: 0 },
    discountAmount: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    total: { type: Number, required: true, default: 0 },
    amountPaid: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["draft", "pending", "paid", "overdue", "cancelled"],
      default: "pending",
    },
    currency: { type: String, default: "USD" },
    notes: { type: String, default: "" },
    terms: { type: String, default: "" },
    payments: [PaymentRecordSchema],
  },
  {
    timestamps: true,
  }
);

// Helper to auto-update status when amount paid >= total
InvoiceSchema.pre("save", function () {
  if (this.amountPaid >= this.total && this.total > 0 && this.status !== "cancelled") {
    this.status = "paid";
  } else if (
    this.status !== "draft" &&
    this.status !== "cancelled" &&
    this.status !== "paid" &&
    new Date(this.dueDate) < new Date()
  ) {
    this.status = "overdue";
  }
});

const Invoice: Model<IInvoice> =
  mongoose.models.Invoice || mongoose.model<IInvoice>("Invoice", InvoiceSchema);

export default Invoice;
