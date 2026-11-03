"use client";

import { useState } from "react";
import { Search, Plus, Package, Edit, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { ProductType } from "./ProductModal";

interface ProductsTabProps {
  products: ProductType[];
  loading: boolean;
  onNewProduct: () => void;
  onEditProduct: (product: ProductType) => void;
  onDeleteProduct: (id: string) => void;
  currency?: string;
}

export function ProductsTab({
  products,
  loading,
  onNewProduct,
  onEditProduct,
  onDeleteProduct,
  currency = "USD",
}: ProductsTabProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categories = Array.from(
    new Set(products.map((p) => p.category || "Services"))
  );

  const filtered = products.filter((p) => {
    const matchesCat =
      categoryFilter === "all" || (p.category || "Services") === categoryFilter;

    const term = search.toLowerCase().trim();
    const matchesSearch =
      !term ||
      p.name.toLowerCase().includes(term) ||
      p.sku?.toLowerCase().includes(term) ||
      p.description?.toLowerCase().includes(term);

    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Products & Services
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure items, standard hourly rates, packages, and tax rates for fast invoicing.
          </p>
        </div>

        <Button
          onClick={onNewProduct}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Item
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              categoryFilter === "all"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            All Categories ({products.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                categoryFilter === cat
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search catalog items, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 animate-pulse">
            Loading products from MongoDB...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Package className="h-6 w-6" />
            </div>
            <div className="text-sm font-semibold text-slate-800">
              No products found
            </div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {search
                ? "No item matched your search filter."
                : "Add services or inventory items to speed up line item creation."}
            </p>
            <Button size="sm" onClick={onNewProduct} className="text-xs bg-blue-600 text-white">
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add First Item
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[650px]">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Item & Description</th>
                  <th className="py-3 px-4 font-semibold">SKU</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold text-right">Unit Price</th>
                  <th className="py-3 px-4 font-semibold text-center">Tax Rate</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{p.name}</div>
                      {p.description && (
                        <div className="text-[11px] text-slate-500 line-clamp-1 max-w-md">
                          {p.description}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                      {p.sku || "-"}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary" className="text-[10px]">
                        <Tag className="h-2.5 w-2.5 mr-1 text-slate-400" />
                        {p.category || "Services"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {formatCurrency(p.unitPrice, currency)}
                      <span className="text-[10px] text-slate-400 font-normal ml-1">
                        / {p.unit || "unit"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-slate-600">
                      {p.taxRate > 0 ? `${p.taxRate}%` : "0%"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditProduct(p)}
                          className="h-7 text-[11px] text-slate-600 hover:text-blue-600 hover:bg-slate-100 px-2"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm(`Delete product ${p.name}?`)) {
                              onDeleteProduct(p._id!);
                            }
                          }}
                          className="h-7 text-[11px] text-slate-400 hover:text-red-600 hover:bg-red-50 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

