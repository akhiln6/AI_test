import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Invoice, { IInvoiceItem } from "@/models/Invoice";
import Customer from "@/models/Customer";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const query: Record<string, unknown> = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: "i" } },
        { "customer.name": { $regex: search, $options: "i" } },
        { "customer.email": { $regex: search, $options: "i" } },
        { "customer.company": { $regex: search, $options: "i" } },
      ];
    }

    const invoices = await Invoice.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ success: true, data: invoices });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch invoices";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    if (!body.customerId && !body.customer?.name) {
      return NextResponse.json(
        { success: false, error: "Customer details are required." },
        { status: 400 }
      );
    }

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one line item is required." },
        { status: 400 }
      );
    }

    // Resolve customer snapshot
    let customerSnapshot = body.customer;
    if (body.customerId) {
      const dbCust = await Customer.findById(body.customerId).lean();
      if (dbCust) {
        customerSnapshot = {
          name: dbCust.name,
          email: dbCust.email,
          phone: dbCust.phone || "",
          whatsappNumber: dbCust.whatsappNumber || "",
          company: dbCust.company || "",
          address: dbCust.address || {},
          taxNumber: dbCust.taxNumber || "",
        };
      }
    }

    // Generate Invoice Number if not provided
    let invoiceNumber = body.invoiceNumber;
    if (!invoiceNumber || invoiceNumber.trim() === "") {
      const count = await Invoice.countDocuments();
      const year = new Date().getFullYear();
      invoiceNumber = `INV-${year}-${String(count + 1).padStart(4, "0")}`;
    }

    // Calculate line items and totals
    let subtotal = 0;
    let discountAmount = 0;
    let taxAmount = 0;

    const computedItems: IInvoiceItem[] = body.items.map((item: IInvoiceItem) => {
      const qty = Number(item.quantity) || 1;
      const price = Number(item.unitPrice) || 0;
      const discPercent = Number(item.discount) || 0;
      const taxPercent = Number(item.taxRate) || 0;

      const lineGross = qty * price;
      const lineDisc = lineGross * (discPercent / 100);
      const lineTaxable = lineGross - lineDisc;
      const lineTax = lineTaxable * (taxPercent / 100);
      const lineTotal = lineTaxable + lineTax;

      subtotal += lineGross;
      discountAmount += lineDisc;
      taxAmount += lineTax;

      return {
        productId: item.productId || "",
        description: item.description,
        quantity: qty,
        unitPrice: price,
        taxRate: taxPercent,
        discount: discPercent,
        total: Math.round(lineTotal * 100) / 100,
      };
    });

    const total = Math.round((subtotal - discountAmount + taxAmount) * 100) / 100;
    const amountPaid = Number(body.amountPaid) || 0;

    let initialStatus = body.status || "pending";
    if (amountPaid >= total && total > 0) {
      initialStatus = "paid";
    }

    const newInvoice = await Invoice.create({
      invoiceNumber,
      customerId: body.customerId || undefined,
      customer: customerSnapshot,
      issueDate: body.issueDate ? new Date(body.issueDate) : new Date(),
      dueDate: body.dueDate
        ? new Date(body.dueDate)
        : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      items: computedItems,
      subtotal: Math.round(subtotal * 100) / 100,
      discountAmount: Math.round(discountAmount * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      total,
      amountPaid,
      status: initialStatus,
      currency: body.currency || "INR",
      notes: body.notes || "",
      terms: body.terms || "",
      payments: body.payments || [],
    });

    return NextResponse.json({ success: true, data: newInvoice }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create invoice";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

