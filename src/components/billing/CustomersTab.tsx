"use client";

import { useState } from "react";
import { Search, Plus, Mail, Phone, MapPin, Building, Edit, Trash2, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomerType } from "./CustomerModal";

interface CustomersTabProps {
  customers: CustomerType[];
  loading: boolean;
  onNewCustomer: () => void;
  onEditCustomer: (customer: CustomerType) => void;
  onDeleteCustomer: (id: string) => void;
  onInvoiceCustomer: (customer: CustomerType) => void;
}

export function CustomersTab({
  customers,
  loading,
  onNewCustomer,
  onEditCustomer,
  onDeleteCustomer,
  onInvoiceCustomer,
}: CustomersTabProps) {
  const [search, setSearch] = useState("");

  const filtered = customers.filter((c) => {
    const term = search.toLowerCase().trim();
    return (
      !term ||
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.company?.toLowerCase().includes(term) ||
      c.phone?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Customers
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your client directory, contact information, and billing addresses.
          </p>
        </div>

        <Button
          onClick={onNewCustomer}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Customer
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search customers by name, company, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
        <div className="text-xs text-slate-500">
          Showing <strong>{filtered.length}</strong> of {customers.length} clients
        </div>
      </div>

      {/* Customers Cards / Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 animate-pulse">
          Loading customers from MongoDB...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Building className="h-6 w-6" />
          </div>
          <div className="text-sm font-semibold text-slate-800">No customers found</div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search
              ? "No customer matches your search term."
              : "Add your first customer to start issuing invoices."}
          </p>
          <Button size="sm" onClick={onNewCustomer} className="text-xs bg-blue-600 text-white">
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Customer
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {c.name}
                    </h3>
                    {c.company && (
                      <span className="text-xs font-medium text-blue-600 flex items-center gap-1 mt-0.5">
                        <Building className="h-3 w-3" />
                        {c.company}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditCustomer(c)}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded cursor-pointer"
                      title="Edit Customer"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete customer ${c.name}?`)) {
                          onDeleteCustomer(c._id!);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                      title="Delete Customer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{c.email}</span>
                  </div>

                  {c.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{c.phone}</span>
                    </div>
                  )}

                  {(c.address?.city || c.address?.country) && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="text-[11px] text-slate-500 line-clamp-1">
                        {c.address.street ? `${c.address.street}, ` : ""}
                        {c.address.city ? `${c.address.city}, ` : ""}
                        {c.address.state ? `${c.address.state} ` : ""}
                        {c.address.country}
                      </span>
                    </div>
                  )}

                  {c.taxNumber && (
                    <div className="text-[11px] text-slate-500 font-mono pt-0.5">
                      Tax/VAT: {c.taxNumber}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onInvoiceCustomer(c)}
                  className="w-full text-xs h-8 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 border-slate-200"
                >
                  <Receipt className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                  Bill this Customer
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

