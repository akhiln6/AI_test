# BillFlow - Next.js Invoicing & Billing Application

A modern, full-featured invoicing and billing application built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **shadcn/ui** components, and **MongoDB Atlas** with Mongoose. Designed from the ground up for seamless deployment to **Vercel**.

---

## 🚀 Features

- **📊 Comprehensive Dashboard**:
  - Live revenue analytics: Total Collected Revenue, Outstanding/Pending Receivables, Overdue Invoices.
  - Monthly trend breakdown (Invoiced vs. Collected).
  - Invoice status distribution (Paid, Pending, Overdue, Draft).
  - Quick action buttons (Create Invoice, Add Customer, Seed Demo Data).

- **🔒 Authentication & Access Protection**:
  - Protected home page gated by secure login.
  - Pre-configured administrator credentials:
    - **Email/Username**: `akhiln6@gmail.com`
    - **Password**: `123456`
  - Persistent 30-day session with HTTP-only cookies and one-click Sign Out.

- **🧾 Complete Invoice Management**:
  - Dynamic line items with real-time subtotal, discount %, tax %, and grand total calculations.
  - Customer selection dropdown or on-the-fly customer creation.
  - Integration with saved Products & Services catalog for fast autofill.
  - Customizable Invoice Numbers, Issue Date, Due Date, Notes, and Terms.
  - Filter invoices by status (`All`, `Pending`, `Paid`, `Overdue`, `Draft`).
  - Search by invoice #, customer name, company, or email.

- **🖨️ Printable & PDF-Ready Invoices**:
  - Professional, clean invoice layout for screen and browser printing (`window.print()`).
  - Supports "Save as PDF" directly from print dialog.
  - Includes business profile, tax ID, line item breakdown, bank instructions, and payment history.

- **💳 Payments & Receipts**:
  - Record full or partial payments for any invoice.
  - Multiple payment methods: Bank Wire / ACH, Credit Card, UPI, PayPal, Cash, Cheque.
  - Automatic status transitions (e.g. from Pending to Paid when balance reaches 0).

- **👥 Customers Directory**:
  - Complete client profiles: Name, Email, Phone, Company, Tax/VAT ID, and multi-line Billing Address.
  - Quick "Bill this Customer" action.

- **📦 Products & Services Catalog**:
  - Frequently billed services / goods with SKU, Unit Price, default Tax Rate, and Unit (hours, units, month, etc.).

- **⚙️ Company Settings & Diagnostics**:
  - Business profile settings (Company name, logo, address, tax number, default currency, payment instructions).
  - Real-time MongoDB Atlas connection diagnostic tool.
  - One-click "Load Demo Billing Data" button.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui design system with Radix UI primitives (`@radix-ui/react-dialog`, `@radix-ui/react-select`, `@radix-ui/react-tabs`, `@radix-ui/react-label`, etc.)
- **Icons**: Lucide React
- **Database**: MongoDB Atlas with Mongoose (cached singleton connection optimized for Vercel Serverless)

---

## ⚡ Quick Start (Local Development)

### 1. Configure MongoDB Atlas Password

Open `.env.local` in the project root:

```env
MONGODB_URI=mongodb+srv://akhiln6_db_user:<db_password>@cluster0.2op9u0f.mongodb.net/billing_app?retryWrites=true&w=majority
```

Replace `<db_password>` with your actual MongoDB Atlas database password for user `akhiln6_db_user`.

### 2. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Tip:** Click the **"Demo Data"** button in the top navigation bar to instantly populate realistic sample clients, products, and invoices to test the app!

---

## 🌐 Deploying to Vercel

### Step 1: Ensure MongoDB Atlas Allows Vercel Connections
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. Navigate to **Network Access** under Security.
3. Click **Add IP Address** and select **Allow Access from Anywhere** (`0.0.0.0/0`). This ensures Vercel's dynamic serverless IP pool can connect to your cluster.

### Step 2: Push to Git (GitHub / GitLab / Bitbucket)
```bash
git add .
git commit -m "feat: complete next.js billing application with mongodb atlas and shadcn/ui"
git branch -M main
git remote add origin <your-git-repo-url>
git push -u origin main
```

### Step 3: Import into Vercel
1. Log in to [Vercel](https://vercel.com/) and click **Add New... → Project**.
2. Select your repository and import it.
3. Under **Environment Variables**, add:
   - **Name**: `MONGODB_URI`
   - **Value**: `mongodb+srv://akhiln6_db_user:YOUR_ACTUAL_PASSWORD@cluster0.2op9u0f.mongodb.net/billing_app?retryWrites=true&w=majority`
4. Click **Deploy**.

Your application will build and be live at `https://your-project.vercel.app`!

---

## 📁 Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── customers/        # Customer REST API endpoints
│   │   │   ├── dashboard/        # Metrics & monthly analytics
│   │   │   ├── health/           # MongoDB Atlas connectivity test
│   │   │   ├── invoices/         # Invoices CRUD & payments
│   │   │   ├── products/         # Products/services catalog API
│   │   │   ├── seed/             # Demo data populator
│   │   │   └── settings/         # Company profile & default terms
│   │   ├── globals.css           # Tailwind CSS v4 & print media styles
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Main billing application entry
│   ├── components/
│   │   ├── billing/              # Billing application views & modals
│   │   │   ├── BillingApp.tsx
│   │   │   ├── CreateInvoiceModal.tsx
│   │   │   ├── CustomerModal.tsx
│   │   │   ├── CustomersTab.tsx
│   │   │   ├── DashboardTab.tsx
│   │   │   ├── DbStatusBanner.tsx
│   │   │   ├── InvoiceDetailModal.tsx
│   │   │   ├── InvoicesTab.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── ProductModal.tsx
│   │   │   ├── ProductsTab.tsx
│   │   │   ├── RecordPaymentModal.tsx
│   │   │   └── SettingsTab.tsx
│   │   └── ui/                   # shadcn/ui components (Button, Card, Input, Dialog, etc.)
│   ├── lib/
│   │   ├── mongodb.ts            # Mongoose singleton connection with Vercel pooling
│   │   └── utils.ts              # Currency & date formatters, cn helper
│   └── models/
│       ├── Customer.ts           # Customer Mongoose Schema
│       ├── Invoice.ts            # Invoice & Payments Mongoose Schema
│       ├── Product.ts            # Products & Services Mongoose Schema
│       └── Settings.ts           # Business Profile & Settings Schema
├── .env.example                  # Environment variable reference
├── .env.local                    # Local environment config
├── vercel.json                   # Vercel configuration
└── package.json
```
