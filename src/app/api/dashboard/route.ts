import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Invoice from "@/models/Invoice";
import Customer from "@/models/Customer";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();

    const [invoices, customerCount, productCount] = await Promise.all([
      Invoice.find().sort({ createdAt: -1 }).lean(),
      Customer.countDocuments(),
      Product.countDocuments(),
    ]);

    let totalRevenue = 0;
    let totalInvoiced = 0;
    let totalPending = 0;
    let totalOverdue = 0;

    let paidCount = 0;
    let pendingCount = 0;
    let overdueCount = 0;
    let draftCount = 0;

    const now = new Date();

    invoices.forEach((inv) => {
      totalInvoiced += inv.total || 0;
      totalRevenue += inv.amountPaid || 0;

      const balance = Math.max(0, (inv.total || 0) - (inv.amountPaid || 0));

      if (inv.status === "paid") {
        paidCount++;
      } else if (inv.status === "draft") {
        draftCount++;
      } else if (inv.status === "cancelled") {
        // cancelled
      } else {
        // Pending or overdue
        if (new Date(inv.dueDate) < now) {
          overdueCount++;
          totalOverdue += balance;
        } else {
          pendingCount++;
          totalPending += balance;
        }
      }
    });

    // Recent 5 invoices
    const recentInvoices = invoices.slice(0, 5);

    // Monthly breakdown (last 6 months)
    const monthsMap: Record<string, { month: string; invoiced: number; paid: number }> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleString("en-US", { month: "short", year: "2-digit" });
      monthsMap[key] = { month: key, invoiced: 0, paid: 0 };
    }

    invoices.forEach((inv) => {
      const d = new Date(inv.issueDate || inv.createdAt);
      const key = d.toLocaleString("en-US", { month: "short", year: "2-digit" });
      if (monthsMap[key]) {
        monthsMap[key].invoiced += inv.total || 0;
        monthsMap[key].paid += inv.amountPaid || 0;
      }
    });

    const monthlyTrends = Object.values(monthsMap);

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalInvoiced: Math.round(totalInvoiced * 100) / 100,
          totalPending: Math.round(totalPending * 100) / 100,
          totalOverdue: Math.round(totalOverdue * 100) / 100,
          totalInvoices: invoices.length,
          paidCount,
          pendingCount,
          overdueCount,
          draftCount,
          customerCount,
          productCount,
        },
        recentInvoices,
        monthlyTrends,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load dashboard metrics";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

