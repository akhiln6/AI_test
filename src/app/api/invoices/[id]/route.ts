import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Invoice, { IInvoiceItem } from "@/models/Invoice";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const invoice = await Invoice.findById(id).lean();

    if (!invoice) {
      return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: invoice });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch invoice";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    // Recompute totals if items are updated
    if (body.items && Array.isArray(body.items)) {
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

      body.items = computedItems;
      body.subtotal = Math.round(subtotal * 100) / 100;
      body.discountAmount = Math.round(discountAmount * 100) / 100;
      body.taxAmount = Math.round(taxAmount * 100) / 100;
      body.total = Math.round((subtotal - discountAmount + taxAmount) * 100) / 100;
    }

    const updated = await Invoice.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) {
      return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update invoice";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const deleted = await Invoice.findByIdAndDelete(id).lean();

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Invoice deleted successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete invoice";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

