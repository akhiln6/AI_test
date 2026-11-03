"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Printer,
  CreditCard,
  Trash2,
  FileText,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { FullInvoice } from "./InvoiceDetailModal";

interface InvoicesTabProps {
  invoices: FullInvoice[];
  loading: boolean;
  onNewInvoice: () => void;
  onViewInvoice: (inv: FullInvoice) => void;
  onRecordPayment: (inv: FullInvoice) => void;
  onDeleteInvoice: (id: string) => void;
}

export function InvoicesTab({
  invoices,
  loading,
  onNewInvoice,
  onViewInvoice,
  onRecordPayment,
  onDeleteInvoice,
}: InvoicesTabProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = invoices.filter((inv) => {
    const matchesStatus =
      statusFilter === "all" || inv.status === statusFilter;

    const term = search.toLowerCase().trim();
    const matchesSearch =
      !term ||
      inv.invoiceNumber.toLowerCase().includes(term) ||
      inv.customer?.name?.toLowerCase().includes(term) ||
      inv.customer?.company?.toLowerCase().includes(term) ||
      inv.customer?.email?.toLowerCase().includes(term);

    return matchesStatus && matchesSearch;
  });

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

  const statusCounts = {
    all: invoices.length,
    paid: invoices.filter((i) => i.status === "paid").length,
    pending: invoices.filter((i) => i.status === "pending").length,
    overdue: invoices.filter((i) => i.status === "overdue").length,
    draft: invoices.filter((i) => i.status === "draft").length,
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Invoices
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Create, manage, track, and record payments for all customer invoices.
          </p>
        </div>

        <Button
          onClick={onNewInvoice}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Create Invoice
        </Button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="flex overflow-x-auto gap-1 pb-1 md:pb-0">
          {[
            { id: "all", label: "All", count: statusCounts.all },
            { id: "pending", label: "Pending", count: statusCounts.pending },
            { id: "paid", label: "Paid", count: statusCounts.paid },
            { id: "overdue", label: "Overdue", count: statusCounts.overdue },
            { id: "draft", label: "Draft", count: statusCounts.draft },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  statusFilter === tab.id
                    ? "bg-slate-700 text-slate-200"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search invoice #, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 animate-pulse">
            Loading invoices from MongoDB...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <FileText className="h-6 w-6" />
            </div>
            <div className="text-sm font-semibold text-slate-800">
              No invoices match your filter
            </div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {search || statusFilter !== "all"
                ? "Try adjusting your search criteria or filter to see more invoices."
                : "Get started by generating your first invoice or loading demo data."}
            </p>
            {search || statusFilter !== "all" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
                className="text-xs"
              >
                Reset Filters
              </Button>
            ) : (
              <Button size="sm" onClick={onNewInvoice} className="text-xs bg-blue-600 text-white">
                <Plus className="h-3.5 w-3.5 mr-1" />
                Create First Invoice
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Invoice #</th>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Issue Date</th>
                  <th className="py-3 px-4 font-semibold">Due Date</th>
                  <th className="py-3 px-4 font-semibold">Total</th>
                  <th className="py-3 px-4 font-semibold">Paid</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((inv) => {
                  const balance = Math.max(0, inv.total - (inv.amountPaid || 0));
                  return (
                    <tr
                      key={inv._id}
                      className="hover:bg-slate-50/75 transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-mono font-medium text-blue-600">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">
                          {inv.customer?.name}
                        </div>
                        {inv.customer?.company && (
                          <div className="text-[11px] text-slate-500">
                            {inv.customer.company}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {formatDate(inv.issueDate)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {formatDate(inv.dueDate)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatCurrency(inv.total, inv.currency)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-emerald-600">
                          {formatCurrency(inv.amountPaid || 0, inv.currency)}
                        </span>
                        {balance > 0 && inv.amountPaid > 0 && (
                          <span className="block text-[10px] text-amber-600">
                            Bal: {formatCurrency(balance, inv.currency)}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">{getStatusBadge(inv.status)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {inv.status !== "paid" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRecordPayment(inv)}
                              className="h-7 text-[11px] text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 px-2"
                              title="Record Payment"
                            >
                              <CreditCard className="h-3 w-3 mr-1" />
                              Pay
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewInvoice(inv)}
                            className="h-7 text-[11px] text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2"
                            title="View / Print Invoice"
                          >
                            <Printer className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm(`Delete invoice #${inv.invoiceNumber}?`)) {
                                onDeleteInvoice(inv._id);
                              }
                            }}
                            className="h-7 text-[11px] text-slate-400 hover:text-red-600 hover:bg-red-50 p-1"
                            title="Delete Invoice"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

