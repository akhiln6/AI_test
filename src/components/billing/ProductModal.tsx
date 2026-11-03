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

export interface ProductType {
  _id?: string;
  name: string;
  description?: string;
  sku?: string;
  unitPrice: number;
  taxRate: number;
  category?: string;
  unit?: string;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: ProductType | null;
  onSuccess: () => void;
}

export function ProductModal({
  isOpen,
  onClose,
  product,
  onSuccess,
}: ProductModalProps) {
  const [formData, setFormData] = useState<ProductType>({
    name: "",
    description: "",
    sku: "",
    unitPrice: 0,
    taxRate: 10,
    category: "Services",
    unit: "units",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        _id: product._id,
        name: product.name || "",
        description: product.description || "",
        sku: product.sku || "",
        unitPrice: product.unitPrice ?? 0,
        taxRate: product.taxRate ?? 10,
        category: product.category || "Services",
        unit: product.unit || "units",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        sku: "",
        unitPrice: 0,
        taxRate: 10,
        category: "Services",
        unit: "units",
      });
    }
    setError(null);
  }, [product, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Product or Service name is required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = formData._id ? `/api/products/${formData._id}` : "/api/products";
      const method = formData._id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          unitPrice: Number(formData.unitPrice),
          taxRate: Number(formData.taxRate),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save product");
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {formData._id ? "Edit Product / Service" : "Add Product / Service"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="p-3 text-xs rounded-md bg-red-50 text-red-800 border border-red-200">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="prod-name">Item Name *</Label>
            <Input
              id="prod-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Web Development or Consulting"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="prod-sku">SKU / Item Code</Label>
              <Input
                id="prod-sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="SRV-001"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prod-category">Category</Label>
              <Select
                id="prod-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Services">Services</option>
                <option value="Consulting">Consulting</option>
                <option value="Development">Development</option>
                <option value="Design">Design</option>
                <option value="Support">Support</option>
                <option value="Physical Goods">Physical Goods</option>
                <option value="Subscription">Subscription</option>
                <option value="Other">Other</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="prod-price">Unit Price *</Label>
              <Input
                id="prod-price"
                type="number"
                step="0.01"
                min="0"
                value={formData.unitPrice}
                onChange={(e) =>
                  setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })
                }
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prod-tax">Tax Rate (%)</Label>
              <Input
                id="prod-tax"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.taxRate}
                onChange={(e) =>
                  setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prod-unit">Unit Type</Label>
              <Select
                id="prod-unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              >
                <option value="hours">hours</option>
                <option value="units">units</option>
                <option value="days">days</option>
                <option value="month">month</option>
                <option value="items">items</option>
                <option value="pcs">pcs</option>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prod-desc">Description</Label>
            <Textarea
              id="prod-desc"
              rows={2}
              placeholder="Detailed description shown on line items..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? "Saving..." : formData._id ? "Update Item" : "Create Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

