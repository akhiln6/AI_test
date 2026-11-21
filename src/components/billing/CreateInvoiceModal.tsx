"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Trash2, Plus, UserPlus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { CustomerType } from "./CustomerModal";
import { ProductType } from "./ProductModal";

export interface LineItem {
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount: number;
  total: number;
}

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onOpenCustomerModal: () => void;
  customers: CustomerType[];
  products: ProductType[];
  defaultCurrency?: string;
}

export function CreateInvoiceModal({
  isOpen,
  onClose,
  onSuccess,
  onOpenCustomerModal,
  customers,
  products,
  defaultCurrency = "INR",
}: CreateInvoiceModalProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");
  const [issueDate, setIssueDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  });
  const [currency, setCurrency] = useState<string>(defaultCurrency);
  const [notes, setNotes] = useState<string>(
    "Thank you for your business. Please quote invoice number when paying."
  );
  const [terms, setTerms] = useState<string>("Payment due within 14 days.");

  const [items, setItems] = useState<LineItem[]>([
    {
      description: "Consulting / Professional Services",
      quantity: 1,
      unitPrice: 100,
      taxRate: 10,
      discount: 0,
      total: 110,
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (customers.length > 0 && !selectedCustomerId) {
        setSelectedCustomerId(customers[0]._id || "");
      }
      setInvoiceNumber("");
      setError(null);
    }
  }, [isOpen, customers, selectedCustomerId]);

  const recalculateItem = (item: LineItem): LineItem => {
    const gross = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
    const disc = gross * ((Number(item.discount) || 0) / 100);
    const taxable = gross - disc;
    const tax = taxable * ((Number(item.taxRate) || 0) / 100);
    return {
      ...item,
      total: Math.round((taxable + tax) * 100) / 100,
    };
  };

  const handleItemChange = (index: number, field: keyof LineItem, value: unknown) => {
    const newItems = [...items];
    const current = { ...newItems[index], [field]: value };
    newItems[index] = recalculateItem(current);
    setItems(newItems);
  };

  const handleProductSelect = (index: number, productId: string) => {
    const prod = products.find((p) => p._id === productId);
    if (!prod) return;

    const newItems = [...items];
    newItems[index] = recalculateItem({
      ...newItems[index],
      productId: prod._id,
      description: prod.name + (prod.description ? ` - ${prod.description}` : ""),
      unitPrice: prod.unitPrice,
      taxRate: prod.taxRate,
    });
    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      recalculateItem({
        description: "",
        quantity: 1,
        unitPrice: 0,
        taxRate: 10,
        discount: 0,
        total: 0,
      }),
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Compute overall totals
  const subtotal = items.reduce(
    (acc, it) => acc + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0),
    0
  );
  const discountTotal = items.reduce((acc, it) => {
    const gross = (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0);
    return acc + gross * ((Number(it.discount) || 0) / 100);
  }, 0);
  const taxTotal = items.reduce((acc, it) => {
    const gross = (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0);
    const taxable = gross - gross * ((Number(it.discount) || 0) / 100);
    return acc + taxable * ((Number(it.taxRate) || 0) / 100);
  }, 0);
  const grandTotal = subtotal - discountTotal + taxTotal;

  const handleSubmit = async (status: "pending" | "draft") => {
    if (!selectedCustomerId) {
      setError("Please select a customer or add a new customer first.");
      return;
    }

    if (items.some((it) => !it.description.trim())) {
      setError("Please provide a description for all line items.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          invoiceNumber: invoiceNumber.trim() || undefined,
          issueDate,
          dueDate,
          currency,
          items,
          status,
          notes,
          terms,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create invoice");
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Invoice</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {error && (
            <div className="p-3 text-xs rounded-md bg-red-50 text-red-800 border border-red-200">
              {error}
            </div>
          )}

          {/* Top Info Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="space-y-1.5 sm:col-span-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="inv-customer">Customer *</Label>
                <button
                  type="button"
                  onClick={onOpenCustomerModal}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium cursor-pointer"
                >
                  <UserPlus className="h-3 w-3" />
                  + New Customer
                </button>
              </div>
              <Select
                id="inv-customer"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
              >
                <option value="">-- Choose Customer --</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} {c.company ? `(${c.company})` : ""} - {c.email}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="inv-num">Invoice # (Auto or Custom)</Label>
              <Input
                id="inv-num"
                placeholder="e.g. INV-2026-0004"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="inv-currency">Currency</Label>
              <Select
                id="inv-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AUD">AUD ($)</option>
                <option value="SGD">SGD ($)</option>
                <option value="AED">AED (AED)</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="inv-issue">Issue Date</Label>
              <Input
                id="inv-issue"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="inv-due">Due Date</Label>
              <Input
                id="inv-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-slate-800 text-sm">Line Items</h4>
              {products.length > 0 && (
                <span className="text-xs text-slate-500">
                  Select catalog item or type custom description
                </span>
              )}
            </div>

            <div className="border border-slate-200 rounded-lg overflow-x-auto bg-white">
              <table className="w-full text-left text-xs min-w-[650px]">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 pl-3 w-5/12">Item / Description</th>
                    <th className="p-2.5 w-20">Qty</th>
                    <th className="p-2.5 w-24">Price</th>
                    <th className="p-2.5 w-20">Tax %</th>
                    <th className="p-2.5 w-20">Disc %</th>
                    <th className="p-2.5 w-24 text-right">Total</th>
                    <th className="p-2.5 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50/50">
                      <td className="p-2 pl-3">
                        {products.length > 0 && (
                          <div className="mb-1">
                            <select
                              className="text-[11px] text-slate-600 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 w-full cursor-pointer"
                              onChange={(e) =>
                                handleProductSelect(index, e.target.value)
                              }
                              defaultValue=""
                            >
                              <option value="" disabled>
                                ⚡ Choose from catalog...
                              </option>
                              {products.map((p) => (
                                <option key={p._id} value={p._id}>
                                  {p.name} - {formatCurrency(p.unitPrice, currency)}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        <Input
                          placeholder="Description of product or service..."
                          value={item.description}
                          onChange={(e) =>
                            handleItemChange(index, "description", e.target.value)
                          }
                          className="h-8 text-xs"
                          required
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "quantity",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="h-8 text-xs w-20"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "unitPrice",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="h-8 text-xs w-24"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.5"
                          min="0"
                          max="100"
                          value={item.taxRate}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "taxRate",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="h-8 text-xs w-20"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.5"
                          min="0"
                          max="100"
                          value={item.discount}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "discount",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="h-8 text-xs w-20"
                        />
                      </td>
                      <td className="p-2 text-right font-medium text-slate-800 text-xs">
                        {formatCurrency(item.total, currency)}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          disabled={items.length <= 1}
                          className="text-slate-400 hover:text-red-600 disabled:opacity-20 cursor-pointer p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItem}
              className="text-xs h-8"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Another Line Item
            </Button>
          </div>

          {/* Bottom Calculations & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-200">
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="inv-notes">Invoice Notes / Instructions</Label>
                <Textarea
                  id="inv-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes for client..."
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="inv-terms">Terms & Conditions</Label>
                <Input
                  id="inv-terms"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  placeholder="e.g. Net 14 days"
                  className="text-xs"
                />
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600 text-xs">
                <span>Subtotal:</span>
                <span className="font-medium text-slate-800">
                  {formatCurrency(subtotal, currency)}
                </span>
              </div>
              {discountTotal > 0 && (
                <div className="flex justify-between text-emerald-600 text-xs">
                  <span>Discount:</span>
                  <span>-{formatCurrency(discountTotal, currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600 text-xs">
                <span>Estimated Tax:</span>
                <span className="font-medium text-slate-800">
                  +{formatCurrency(taxTotal, currency)}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline font-bold text-slate-900 text-base">
                <span>Total Amount:</span>
                <span className="text-blue-600 text-lg">
                  {formatCurrency(grandTotal, currency)}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-slate-200 gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={loading}
              onClick={() => handleSubmit("draft")}
            >
              Save as Draft
            </Button>
            <Button
              type="button"
              disabled={loading}
              onClick={() => handleSubmit("pending")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Creating..." : "Create & Send Invoice"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

