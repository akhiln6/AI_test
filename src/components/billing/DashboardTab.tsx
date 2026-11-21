"use client";

import {
  IndianRupee,
  Clock,
  AlertTriangle,
  Receipt,
  Plus,
  ArrowRight,
  TrendingUp,
  CreditCard,
  UserPlus,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { FullInvoice } from "./InvoiceDetailModal";

interface DashboardData {
  summary: {
    totalRevenue: number;
    totalInvoiced: number;
    totalPending: number;
    totalOverdue: number;
    totalInvoices: number;
    paidCount: number;
    pendingCount: number;
    overdueCount: number;
    draftCount: number;
    customerCount: number;
    productCount: number;
  };
  recentInvoices: FullInvoice[];
  monthlyTrends: { month: string; invoiced: number; paid: number }[];
}

interface DashboardTabProps {
  data: DashboardData | null;
  loading: boolean;
  onNewInvoice: () => void;
  onNewCustomer: () => void;
  onViewInvoice: (inv: FullInvoice) => void;
  onRecordPayment: (inv: FullInvoice) => void;
  onSeedData: () => void;
  onGoToInvoices: () => void;
  seeding?: boolean;
  currency?: string;
}

export function DashboardTab({
  data,
  loading,
  onNewInvoice,
  onNewCustomer,
  onViewInvoice,
  onRecordPayment,
  onSeedData,
  onGoToInvoices,
  seeding,
  currency = "INR",
}: DashboardTabProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse h-28 bg-slate-100 border-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  const summary = data?.summary || {
    totalRevenue: 0,
    totalInvoiced: 0,
    totalPending: 0,
    totalOverdue: 0,
    totalInvoices: 0,
    paidCount: 0,
    pendingCount: 0,
    overdueCount: 0,
    draftCount: 0,
    customerCount: 0,
    productCount: 0,
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
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Find max value for monthly trend chart scaling
  const maxMonthlyVal = Math.max(
    1000,
    ...(data?.monthlyTrends?.map((m) => Math.max(m.invoiced, m.paid)) || [1000])
  );

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Billing Overview
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time invoices, payments, revenue tracking, and customer balance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onNewCustomer}
            className="text-xs h-9 bg-white"
          >
            <UserPlus className="h-3.5 w-3.5 mr-1 text-slate-600" />
            Add Customer
          </Button>
          <Button
            size="sm"
            onClick={onNewInvoice}
            className="text-xs h-9 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Empty State Banner if no invoices */}
      {summary.totalInvoices === 0 && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-blue-950 text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Welcome to your new Billing App!
            </h3>
            <p className="text-xs text-blue-800 leading-relaxed max-w-xl">
              Get started by populating realistic sample customers, services, and invoices with one click, or create your first invoice manually.
            </p>
          </div>
          <Button
            onClick={onSeedData}
            disabled={seeding}
            className="bg-blue-600 hover:bg-blue-700 text-white shrink-0 shadow-sm"
          >
            <Sparkles className={`h-4 w-4 mr-1.5 ${seeding ? "animate-spin" : ""}`} />
            {seeding ? "Populating Data..." : "Load Demo Billing Data"}
          </Button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card className="border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-5">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Revenue
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(summary.totalRevenue, currency)}
            </div>
            <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              Collected from {summary.paidCount} paid invoice{summary.paidCount !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        {/* Pending Receivables */}
        <Card className="border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-5">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Pending Invoices
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(summary.totalPending, currency)}
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              {summary.pendingCount} pending invoice{summary.pendingCount !== 1 ? "s" : ""} awaiting payment
            </p>
          </CardContent>
        </Card>

        {/* Overdue */}
        <Card className="border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-5">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Overdue Invoices
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.totalOverdue, currency)}
            </div>
            <p className="text-[11px] text-red-500 font-medium mt-1">
              {summary.overdueCount} invoice{summary.overdueCount !== 1 ? "s" : ""} past due date
            </p>
          </CardContent>
        </Card>

        {/* Total Invoiced */}
        <Card className="border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-5">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Invoiced
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Receipt className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(summary.totalInvoiced, currency)}
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              Across {summary.totalInvoices} total invoice{summary.totalInvoices !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Middle Section: Chart & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend Chart */}
        <Card className="lg:col-span-2 border-slate-200 shadow-xs">
          <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-slate-900">
                Invoicing & Collections Trend
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Monthly comparison between total invoiced and payments collected.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-xs bg-blue-500"></span>
                <span className="text-slate-600">Invoiced</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-xs bg-emerald-500"></span>
                <span className="text-slate-600">Collected</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-2">
            <div className="h-48 flex items-end justify-between gap-3 pt-6 border-b border-slate-200">
              {data?.monthlyTrends?.map((m, idx) => {
                const invHeight = Math.max(8, (m.invoiced / maxMonthlyVal) * 100);
                const paidHeight = Math.max(8, (m.paid / maxMonthlyVal) * 100);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-1.5 h-full">
                      {/* Invoiced Bar */}
                      <div
                        style={{ height: `${invHeight}%` }}
                        className="w-1/2 max-w-[24px] bg-blue-500/80 hover:bg-blue-600 rounded-t-sm transition-all relative group-hover:shadow"
                        title={`${m.month} Invoiced: ${formatCurrency(m.invoiced, currency)}`}
                      />
                      {/* Paid Bar */}
                      <div
                        style={{ height: `${paidHeight}%` }}
                        className="w-1/2 max-w-[24px] bg-emerald-500 hover:bg-emerald-600 rounded-t-sm transition-all relative group-hover:shadow"
                        title={`${m.month} Collected: ${formatCurrency(m.paid, currency)}`}
                      />
                    </div>
                    <span className="text-[11px] font-medium text-slate-500 mt-2">
                      {m.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Breakdown Card */}
        <Card className="border-slate-200 shadow-xs flex flex-col justify-between">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-semibold text-slate-900">
              Invoice Status Breakdown
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Live status distribution of active billing items.
            </p>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-emerald-700 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    Paid ({summary.paidCount})
                  </span>
                  <span className="text-slate-700">
                    {summary.totalInvoices > 0
                      ? Math.round((summary.paidCount / summary.totalInvoices) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{
                      width: `${
                        summary.totalInvoices > 0
                          ? (summary.paidCount / summary.totalInvoices) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-amber-700 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                    Pending ({summary.pendingCount})
                  </span>
                  <span className="text-slate-700">
                    {summary.totalInvoices > 0
                      ? Math.round((summary.pendingCount / summary.totalInvoices) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all"
                    style={{
                      width: `${
                        summary.totalInvoices > 0
                          ? (summary.pendingCount / summary.totalInvoices) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-red-700 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-500"></span>
                    Overdue ({summary.overdueCount})
                  </span>
                  <span className="text-slate-700">
                    {summary.totalInvoices > 0
                      ? Math.round((summary.overdueCount / summary.totalInvoices) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 transition-all"
                    style={{
                      width: `${
                        summary.totalInvoices > 0
                          ? (summary.overdueCount / summary.totalInvoices) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-slate-400"></span>
                    Drafts ({summary.draftCount})
                  </span>
                  <span className="text-slate-700">
                    {summary.totalInvoices > 0
                      ? Math.round((summary.draftCount / summary.totalInvoices) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-400 transition-all"
                    style={{
                      width: `${
                        summary.totalInvoices > 0
                          ? (summary.draftCount / summary.totalInvoices) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Customers
                </span>
                <span className="text-base font-bold text-slate-800">
                  {summary.customerCount}
                </span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Catalog Items
                </span>
                <span className="text-base font-bold text-slate-800">
                  {summary.productCount}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices Table */}
      <Card className="border-slate-200 shadow-xs">
        <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold text-slate-900">
              Recent Invoices
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest invoices generated and their current status.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onGoToInvoices}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            View All Invoices
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {(!data?.recentInvoices || data.recentInvoices.length === 0) ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No invoices yet. Click <strong>Create Invoice</strong> to get started!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-y border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Invoice #</th>
                    <th className="py-2.5 px-4 font-semibold">Customer</th>
                    <th className="py-2.5 px-4 font-semibold">Due Date</th>
                    <th className="py-2.5 px-4 font-semibold">Amount</th>
                    <th className="py-2.5 px-4 font-semibold">Status</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.recentInvoices.map((inv) => (
                    <tr key={inv._id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-blue-600">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">
                          {inv.customer?.name}
                        </div>
                        {inv.customer?.company && (
                          <div className="text-[11px] text-slate-500">
                            {inv.customer.company}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {formatDate(inv.dueDate)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {formatCurrency(inv.total, inv.currency)}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(inv.status)}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        {inv.status !== "paid" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRecordPayment(inv)}
                            className="h-7 text-[11px] text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-2"
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
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

