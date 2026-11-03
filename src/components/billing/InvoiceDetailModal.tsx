"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, CreditCard, CheckCircle2, ArrowLeft, Download } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { IInvoiceItem, IPaymentRecord } from "@/models/Invoice";

export interface FullInvoice {
  _id: string;
  invoiceNumber: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
    taxNumber?: string;
  };
  issueDate: string;
  dueDate: string;
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
  createdAt: string;
}

interface SettingsType {
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
  taxId?: string;
  paymentDetails?: string;
}

interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: FullInvoice | null;
  settings?: SettingsType | null;
  onRecordPayment: (inv: FullInvoice) => void;
  onStatusUpdated: () => void;
}

export function InvoiceDetailModal({
  isOpen,
  onClose,
  invoice,
  settings,
  onRecordPayment,
  onStatusUpdated,
}: InvoiceDetailModalProps) {
  const [updating, setUpdating] = useState(false);

  if (!invoice) return null;

  const balanceDue = Math.max(0, invoice.total - (invoice.amountPaid || 0));

  const handlePrint = () => {
    window.print();
  };

  const handleQuickMarkPaid = async () => {
    if (!confirm(`Mark invoice #${invoice.invoiceNumber} as fully paid?`)) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/invoices/${invoice._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "paid",
          amountPaid: invoice.total,
        }),
      });
      if (res.ok) {
        onStatusUpdated();
        onClose();
      }
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge variant="success">Paid</Badge>;
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "cancelled":
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[95vh] p-0 overflow-y-auto">
        {/* Action Header (No print) */}
        <div className="flex flex-wrap items-center justify-between p-4 bg-slate-50 border-b border-slate-200 no-print sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <span className="font-semibold text-slate-900 text-sm">
              Invoice #{invoice.invoiceNumber}
            </span>
            {getStatusBadge(invoice.status)}
          </div>

          <div className="flex items-center gap-2">
            {invoice.status !== "paid" && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleQuickMarkPaid}
                  disabled={updating}
                  className="h-8 text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                  Mark Paid
                </Button>
                <Button
                  size="sm"
                  onClick={() => onRecordPayment(invoice)}
                  className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <CreditCard className="h-3.5 w-3.5 mr-1" />
                  Record Payment
                </Button>
              </>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrint}
              className="h-8 text-xs border-slate-300 hover:bg-slate-100"
            >
              <Printer className="h-3.5 w-3.5 mr-1" />
              Print / Save PDF
            </Button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-8 sm:p-12 bg-white text-slate-900" id="printable-invoice">
          {/* Header */}
          <div className="flex justify-between items-start pb-8 border-b border-slate-200">
            <div>
              <div className="text-2xl font-black tracking-tight text-blue-600">
                {settings?.companyName || "NovaTech Solutions Inc."}
              </div>
              <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                <p>{settings?.email || "billing@novatech.io"}</p>
                <p>{settings?.phone || "+1 (415) 890-3421"}</p>
                <p>
                  {settings?.address?.street || "500 Howard Street, Suite 300"}
                  {settings?.address?.city ? `, ${settings?.address?.city}` : ""}
                  {settings?.address?.state ? ` ${settings?.address?.state}` : ""}
                  {settings?.address?.postalCode ? ` ${settings?.address?.postalCode}` : ""}
                </p>
                {settings?.taxId && <p>Tax ID: {settings.taxId}</p>}
              </div>
            </div>

            <div className="text-right">
              <h1 className="text-3xl font-extrabold uppercase tracking-wide text-slate-900">
                INVOICE
              </h1>
              <p className="font-mono text-sm font-semibold text-slate-600 mt-1">
                #{invoice.invoiceNumber}
              </p>
              <div className="mt-2 inline-block">
                {getStatusBadge(invoice.status)}
              </div>
            </div>
          </div>

          {/* Billed To and Meta */}
          <div className="grid grid-cols-2 gap-8 py-8 border-b border-slate-200 text-xs">
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Billed To
              </span>
              <p className="font-bold text-slate-900 text-sm">
                {invoice.customer?.name}
              </p>
              {invoice.customer?.company && (
                <p className="font-medium text-slate-700">
                  {invoice.customer.company}
                </p>
              )}
              <p className="text-slate-600">{invoice.customer?.email}</p>
              {invoice.customer?.phone && (
                <p className="text-slate-600">{invoice.customer.phone}</p>
              )}
              {invoice.customer?.address?.street && (
                <p className="text-slate-600 mt-1">
                  {invoice.customer.address.street}
                  <br />
                  {invoice.customer.address.city && `${invoice.customer.address.city}, `}
                  {invoice.customer.address.state && `${invoice.customer.address.state} `}
                  {invoice.customer.address.postalCode}
                  {invoice.customer.address.country && `, ${invoice.customer.address.country}`}
                </p>
              )}
              {invoice.customer?.taxNumber && (
                <p className="text-slate-500 mt-1">
                  Tax / VAT ID: {invoice.customer.taxNumber}
                </p>
              )}
            </div>

            <div className="text-right space-y-1.5">
              <div>
                <span className="text-slate-500">Invoice Date:</span>{" "}
                <span className="font-semibold text-slate-800">
                  {formatDate(invoice.issueDate)}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Due Date:</span>{" "}
                <span className="font-semibold text-slate-800">
                  {formatDate(invoice.dueDate)}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Currency:</span>{" "}
                <span className="font-semibold text-slate-800">
                  {invoice.currency}
                </span>
              </div>
              <div className="pt-2">
                <span className="text-slate-500 block">Balance Due:</span>
                <span className="text-xl font-bold text-blue-600">
                  {formatCurrency(balanceDue, invoice.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="py-6">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-slate-900 text-slate-800 uppercase font-bold tracking-wider">
                  <th className="py-2.5">Description</th>
                  <th className="py-2.5 text-center w-16">Qty</th>
                  <th className="py-2.5 text-right w-24">Unit Price</th>
                  <th className="py-2.5 text-right w-16">Tax</th>
                  <th className="py-2.5 text-right w-16">Disc</th>
                  <th className="py-2.5 text-right w-28">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((it, idx) => (
                  <tr key={idx} className="py-2">
                    <td className="py-3 pr-4 font-medium text-slate-800">
                      {it.description}
                    </td>
                    <td className="py-3 text-center text-slate-600">
                      {it.quantity}
                    </td>
                    <td className="py-3 text-right text-slate-600">
                      {formatCurrency(it.unitPrice, invoice.currency)}
                    </td>
                    <td className="py-3 text-right text-slate-500">
                      {it.taxRate > 0 ? `${it.taxRate}%` : "-"}
                    </td>
                    <td className="py-3 text-right text-slate-500">
                      {it.discount > 0 ? `${it.discount}%` : "-"}
                    </td>
                    <td className="py-3 text-right font-semibold text-slate-900">
                      {formatCurrency(it.total, invoice.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown */}
          <div className="flex justify-end pt-4 border-t border-slate-200">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-800">
                  {formatCurrency(invoice.subtotal, invoice.currency)}
                </span>
              </div>

              {invoice.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(invoice.discountAmount, invoice.currency)}</span>
                </div>
              )}

              {invoice.taxAmount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Tax:</span>
                  <span className="font-semibold text-slate-800">
                    +{formatCurrency(invoice.taxAmount, invoice.currency)}
                  </span>
                </div>
              )}

              <div className="border-t border-slate-300 pt-2 flex justify-between font-bold text-sm text-slate-900">
                <span>Total:</span>
                <span className="text-base text-blue-600">
                  {formatCurrency(invoice.total, invoice.currency)}
                </span>
              </div>

              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Amount Paid:</span>
                <span>{formatCurrency(invoice.amountPaid || 0, invoice.currency)}</span>
              </div>

              <div className="border-t border-slate-200 pt-2 flex justify-between font-extrabold text-sm text-slate-900">
                <span>Balance Due:</span>
                <span className={balanceDue > 0 ? "text-red-600" : "text-emerald-600"}>
                  {formatCurrency(balanceDue, invoice.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Instructions & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 pt-6 border-t border-slate-200 text-xs">
            <div>
              <span className="font-bold text-slate-700 block mb-1">
                Payment Instructions
              </span>
              <p className="whitespace-pre-line text-slate-600 leading-relaxed">
                {settings?.paymentDetails ||
                  "Please wire payments to the bank account listed above. Thank you."}
              </p>
            </div>

            <div>
              <span className="font-bold text-slate-700 block mb-1">
                Terms & Conditions
              </span>
              <p className="text-slate-600 leading-relaxed">
                {invoice.terms || "Payment is due according to the agreed terms."}
              </p>
              {invoice.notes && (
                <div className="mt-3">
                  <span className="font-bold text-slate-700 block mb-0.5">Notes:</span>
                  <p className="text-slate-600 italic">{invoice.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Recorded Payments History */}
          {invoice.payments && invoice.payments.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-200 text-xs">
              <span className="font-bold text-slate-700 block mb-2">
                Payment Records ({invoice.payments.length})
              </span>
              <div className="border border-slate-200 rounded-md overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-2">Date</th>
                      <th className="p-2">Method</th>
                      <th className="p-2">Reference</th>
                      <th className="p-2">Note</th>
                      <th className="p-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoice.payments.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2">{formatDate(p.date)}</td>
                        <td className="p-2 capitalize">
                          {p.method.replace("_", " ")}
                        </td>
                        <td className="p-2 font-mono text-[11px] text-slate-500">
                          {p.reference || "-"}
                        </td>
                        <td className="p-2 text-slate-500">{p.note || "-"}</td>
                        <td className="p-2 text-right font-semibold text-emerald-600">
                          +{formatCurrency(p.amount, invoice.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

