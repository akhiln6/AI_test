"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";

interface InvoiceData {
  _id: string;
  invoiceNumber: string;
  total: number;
  amountPaid: number;
  currency: string;
  customer: {
    name: string;
  };
}

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceData | null;
  onPaymentSuccess: () => void;
}

export function RecordPaymentModal({
  isOpen,
  onClose,
  invoice,
  onPaymentSuccess,
}: RecordPaymentModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [method, setMethod] = useState<string>("bank_transfer");
  const [reference, setReference] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!invoice) return null;

  const remainingBalance = Math.max(0, invoice.total - (invoice.amountPaid || 0));

  const handleOpen = () => {
    setAmount(remainingBalance.toString());
    setMethod("bank_transfer");
    setReference("");
    setNote("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid payment amount greater than zero.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/invoices/${invoice._id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numAmount,
          method,
          reference,
          note,
          date: new Date().toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to record payment");
      }

      onPaymentSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (open) handleOpen();
        else onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record payment for Invoice #{invoice.invoiceNumber} ({invoice.customer?.name})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="p-3 text-xs rounded-md bg-red-50 text-red-800 border border-red-200">
              {error}
            </div>
          )}

          <div className="rounded-lg bg-slate-50 p-3 border border-slate-200 text-xs flex justify-between items-center">
            <div>
              <span className="text-slate-500 block">Total Invoiced:</span>
              <span className="font-semibold text-slate-800 text-sm">
                {formatCurrency(invoice.total, invoice.currency)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Already Paid:</span>
              <span className="font-semibold text-emerald-600 text-sm">
                {formatCurrency(invoice.amountPaid || 0, invoice.currency)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">Remaining Due:</span>
              <span className="font-bold text-blue-600 text-sm">
                {formatCurrency(remainingBalance, invoice.currency)}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pay-amount">Payment Amount ({invoice.currency})</Label>
            <div className="relative">
              <Input
                id="pay-amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setAmount(remainingBalance.toString())}
                className="text-[11px] text-blue-600 hover:underline cursor-pointer"
              >
                Pay Full Balance ({formatCurrency(remainingBalance, invoice.currency)})
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pay-method">Payment Method</Label>
            <Select
              id="pay-method"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              <option value="bank_transfer">Bank Wire / ACH</option>
              <option value="credit_card">Credit / Debit Card</option>
              <option value="upi">UPI / Instant Transfer</option>
              <option value="paypal">PayPal</option>
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
              <option value="other">Other</option>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pay-ref">Transaction / Reference # (Optional)</Label>
            <Input
              id="pay-ref"
              placeholder="e.g. TXN-892401 or Wire Ref"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pay-note">Internal Notes (Optional)</Label>
            <Input
              id="pay-note"
              placeholder="e.g. Deposited in Chase Bank account"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? "Recording..." : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

