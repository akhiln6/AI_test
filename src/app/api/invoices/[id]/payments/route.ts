import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Invoice from "@/models/Invoice";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    const amount = Number(body.amount);
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "A valid positive payment amount is required." },
        { status: 400 }
      );
    }

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });
    }

    const paymentRecord = {
      amount,
      date: body.date ? new Date(body.date) : new Date(),
      method: body.method || "bank_transfer",
      reference: body.reference || "",
      note: body.note || "",
    };

    invoice.payments.push(paymentRecord);
    invoice.amountPaid = (invoice.amountPaid || 0) + amount;

    if (invoice.amountPaid >= invoice.total) {
      invoice.status = "paid";
    }

    await invoice.save();

    return NextResponse.json({ success: true, data: invoice });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to record payment";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

