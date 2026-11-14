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

export interface CustomerType {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  whatsappNumber?: string;
  company?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  taxNumber?: string;
  notes?: string;
}

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: CustomerType | null;
  onSuccess: (savedCustomer?: CustomerType) => void;
}

export function CustomerModal({
  isOpen,
  onClose,
  customer,
  onSuccess,
}: CustomerModalProps) {
  const [formData, setFormData] = useState<CustomerType>({
    name: "",
    email: "",
    phone: "",
    whatsappNumber: "",
    company: "",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
    taxNumber: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (customer) {
      setFormData({
        _id: customer._id,
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        whatsappNumber: customer.whatsappNumber || "",
        company: customer.company || "",
        address: {
          street: customer.address?.street || "",
          city: customer.address?.city || "",
          state: customer.address?.state || "",
          postalCode: customer.address?.postalCode || "",
          country: customer.address?.country || "",
        },
        taxNumber: customer.taxNumber || "",
        notes: customer.notes || "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        whatsappNumber: "",
        company: "",
        address: { street: "", city: "", state: "", postalCode: "", country: "" },
        taxNumber: "",
        notes: "",
      });
    }
    setError(null);
  }, [customer, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Customer name and email are required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = formData._id ? `/api/customers/${formData._id}` : "/api/customers";
      const method = formData._id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save customer");
      }

      onSuccess(data.data);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {formData._id ? "Edit Customer" : "Add New Customer"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="p-3 text-xs rounded-md bg-red-50 text-red-800 border border-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cust-name">Full Name *</Label>
              <Input
                id="cust-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Alex Morgan"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cust-email">Email Address *</Label>
              <Input
                id="cust-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="alex@company.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cust-company">Company Name</Label>
              <Input
                id="cust-company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Acme Corp"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cust-phone">Phone Number</Label>
              <Input
                id="cust-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 012-3456"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cust-tax">Tax ID / VAT / GST Number</Label>
              <Input
                id="cust-tax"
                value={formData.taxNumber}
                onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                placeholder="e.g. US-123456789 or GSTIN"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="cust-whatsapp" className="flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                  WhatsApp Number
                </Label>
                {formData.phone && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, whatsappNumber: formData.phone })}
                    className="text-[11px] text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                  >
                    Same as phone
                  </button>
                )}
              </div>
              <Input
                id="cust-whatsapp"
                value={formData.whatsappNumber || ""}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                placeholder="+1 (555) 012-3456"
              />
            </div>
          </div>

          <div className="space-y-2 pt-1 border-t border-slate-100">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
              Billing Address
            </span>
            <div className="space-y-1.5">
              <Input
                placeholder="Street Address"
                value={formData.address?.street}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, street: e.target.value },
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Input
                placeholder="City"
                value={formData.address?.city}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, city: e.target.value },
                  })
                }
              />
              <Input
                placeholder="State / Region"
                value={formData.address?.state}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, state: e.target.value },
                  })
                }
              />
              <Input
                placeholder="Postal Code"
                value={formData.address?.postalCode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, postalCode: e.target.value },
                  })
                }
              />
              <Input
                placeholder="Country"
                value={formData.address?.country}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, country: e.target.value },
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cust-notes">Internal Notes</Label>
            <Textarea
              id="cust-notes"
              rows={2}
              placeholder="Payment terms, special instructions, contact notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? "Saving..." : formData._id ? "Update Customer" : "Create Customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

