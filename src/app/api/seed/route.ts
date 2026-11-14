import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Customer from "@/models/Customer";
import Product from "@/models/Product";
import Invoice from "@/models/Invoice";
import Settings from "@/models/Settings";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await connectToDatabase();

    // 1. Settings
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        companyName: "NovaTech Solutions Inc.",
        email: "billing@novatech.io",
        phone: "+1 (415) 890-3421",
        address: {
          street: "500 Howard Street, Suite 300",
          city: "San Francisco",
          state: "CA",
          postalCode: "94105",
          country: "United States",
        },
        taxId: "US-892410842",
        currency: "USD",
        defaultTaxRate: 10,
        paymentDetails:
          "Bank: JPMorgan Chase\nAccount Name: NovaTech Solutions Inc.\nAccount No: 4892-0012-9842\nRouting/ABA: 021000021\nSWIFT/BIC: CHASUS33XXX",
        defaultTerms:
          "Payment due within 14 days of receipt. Invoices unpaid after 30 days are subject to a 1.5% monthly late fee.",
      });
    }

    // 2. Customers
    const sampleCustomers = [
      {
        name: "Sarah Jenkins",
        email: "sarah@apexdesign.co",
        phone: "+1 (555) 234-5678",
        whatsappNumber: "+1 (555) 234-5678",
        company: "Apex Design Studio",
        address: {
          street: "742 Evergreen Terrace",
          city: "Austin",
          state: "TX",
          postalCode: "78701",
          country: "USA",
        },
        taxNumber: "TX-4481092",
        notes: "Key enterprise client - Net 15 terms",
      },
      {
        name: "David Chen",
        email: "d.chen@quantumflow.io",
        phone: "+1 (555) 987-6543",
        whatsappNumber: "+1 (555) 987-6543",
        company: "QuantumFlow Systems",
        address: {
          street: "100 Innovation Way",
          city: "Seattle",
          state: "WA",
          postalCode: "98101",
          country: "USA",
        },
        taxNumber: "WA-9923841",
        notes: "Monthly retainer contract",
      },
      {
        name: "Elena Rostova",
        email: "elena@luminahealth.org",
        phone: "+1 (555) 456-7890",
        whatsappNumber: "+1 (555) 456-7890",
        company: "Lumina Health Labs",
        address: {
          street: "450 Medical Center Blvd",
          city: "Boston",
          state: "MA",
          postalCode: "02115",
          country: "USA",
        },
        taxNumber: "MA-1123490",
        notes: "Non-profit partner",
      },
    ];

    const createdCustomers = [];
    for (const c of sampleCustomers) {
      let cust = await Customer.findOne({ email: c.email });
      if (!cust) {
        cust = await Customer.create(c);
      }
      createdCustomers.push(cust);
    }

    // 3. Products
    const sampleProducts = [
      {
        name: "Cloud Architecture Consulting",
        description: "Senior cloud architect advisory and AWS/GCP infrastructure planning.",
        sku: "SRV-CLOUD-01",
        unitPrice: 150,
        taxRate: 10,
        category: "Consulting",
        unit: "hours",
      },
      {
        name: "Full-Stack Web Development",
        description: "Modern Next.js web application engineering and API integration.",
        sku: "DEV-WEB-02",
        unitPrice: 120,
        taxRate: 10,
        category: "Development",
        unit: "hours",
      },
      {
        name: "UI/UX Design & Prototyping",
        description: "High-fidelity Figma wireframes, design system, and user testing.",
        sku: "DES-UIUX-03",
        unitPrice: 95,
        taxRate: 10,
        category: "Design",
        unit: "hours",
      },
      {
        name: "Monthly Maintenance Retainer",
        description: "Ongoing 24/7 uptime monitoring, security updates, and SLA support.",
        sku: "RET-MAINT-04",
        unitPrice: 1200,
        taxRate: 0,
        category: "Support",
        unit: "month",
      },
    ];

    for (const p of sampleProducts) {
      const exists = await Product.findOne({ sku: p.sku });
      if (!exists) {
        await Product.create(p);
      }
    }

    // 4. Invoices
    const existingInvoicesCount = await Invoice.countDocuments();
    if (existingInvoicesCount === 0) {
      const c1 = createdCustomers[0];
      const c2 = createdCustomers[1];
      const c3 = createdCustomers[2];

      const invoicesToCreate = [
        {
          invoiceNumber: "INV-2026-0001",
          customerId: c1._id,
          customer: {
            name: c1.name,
            email: c1.email,
            phone: c1.phone,
            whatsappNumber: c1.whatsappNumber,
            company: c1.company,
            address: c1.address,
            taxNumber: c1.taxNumber,
          },
          issueDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
          dueDate: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
          items: [
            {
              description: "Cloud Architecture Consulting (15 hours)",
              quantity: 15,
              unitPrice: 150,
              taxRate: 10,
              discount: 0,
              total: 2475,
            },
            {
              description: "UI/UX Design Sprint (10 hours)",
              quantity: 10,
              unitPrice: 95,
              taxRate: 10,
              discount: 5,
              total: 992.75,
            },
          ],
          subtotal: 3200,
          discountAmount: 47.5,
          taxAmount: 315.25,
          total: 3467.75,
          amountPaid: 3467.75,
          status: "paid" as const,
          currency: "USD",
          notes: "All deliverables signed off. Thank you!",
          terms: "Net 14",
          payments: [
            {
              amount: 3467.75,
              date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
              method: "bank_transfer" as const,
              reference: "WIRE-992014",
              note: "Full wire transfer payment received",
            },
          ],
        },
        {
          invoiceNumber: "INV-2026-0002",
          customerId: c2._id,
          customer: {
            name: c2.name,
            email: c2.email,
            phone: c2.phone,
            whatsappNumber: c2.whatsappNumber,
            company: c2.company,
            address: c2.address,
            taxNumber: c2.taxNumber,
          },
          issueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
          items: [
            {
              description: "Full-Stack Web Development - Sprint 4",
              quantity: 40,
              unitPrice: 120,
              taxRate: 10,
              discount: 10,
              total: 4752,
            },
            {
              description: "Monthly Maintenance Retainer",
              quantity: 1,
              unitPrice: 1200,
              taxRate: 0,
              discount: 0,
              total: 1200,
            },
          ],
          subtotal: 6000,
          discountAmount: 480,
          taxAmount: 432,
          total: 5952,
          amountPaid: 2000,
          status: "pending" as const,
          currency: "USD",
          notes: "Partial milestone payment of $2,000 received.",
          terms: "Net 14",
          payments: [
            {
              amount: 2000,
              date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
              method: "credit_card" as const,
              reference: "CHRG_49102",
              note: "Milestone deposit",
            },
          ],
        },
        {
          invoiceNumber: "INV-2026-0003",
          customerId: c3._id,
          customer: {
            name: c3.name,
            email: c3.email,
            phone: c3.phone,
            whatsappNumber: c3.whatsappNumber,
            company: c3.company,
            address: c3.address,
            taxNumber: c3.taxNumber,
          },
          issueDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
          dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          items: [
            {
              description: "Lumina Patient Portal Integration",
              quantity: 25,
              unitPrice: 120,
              taxRate: 10,
              discount: 0,
              total: 3300,
            },
          ],
          subtotal: 3000,
          discountAmount: 0,
          taxAmount: 300,
          total: 3300,
          amountPaid: 0,
          status: "overdue" as const,
          currency: "USD",
          notes: "First payment reminder sent 3 days ago.",
          terms: "Net 30",
          payments: [],
        },
      ];

      for (const inv of invoicesToCreate) {
        await Invoice.create(inv);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Demo customers, products, and invoices seeded successfully!",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to seed demo data";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
