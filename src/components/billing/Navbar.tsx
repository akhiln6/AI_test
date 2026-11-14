"use client";

import { Receipt, Plus, Sparkles, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export type NavTab = "dashboard" | "invoices" | "customers" | "products" | "settings";

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onNewInvoice: () => void;
  onSeedData: () => void;
  seeding?: boolean;
  user?: { email: string; name: string } | null;
  onLogout?: () => void;
}

export function Navbar({
  currentTab,
  onTabChange,
  onNewInvoice,
  onSeedData,
  seeding,
  user,
  onLogout,
}: NavbarProps) {
  const tabs: { id: NavTab; label: string }[] = [
    { id: "dashboard", label: "Dashboard" },
    { id: "invoices", label: "Invoices" },
    { id: "customers", label: "Customers" },
    { id: "products", label: "Products & Services" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => onTabChange("dashboard")}
            >
              <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight text-slate-900 block leading-tight">
                  BillFlow
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block leading-none">
                  Billing App
                </span>
              </div>
            </div>

            <nav className="hidden md:flex space-x-1">
              {tabs.map((tab) => {
                const active = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                      active
                        ? "bg-slate-100 text-blue-600 font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onSeedData}
              disabled={seeding}
              className="hidden lg:inline-flex text-xs h-9 border-slate-200 text-slate-700 hover:bg-slate-50"
              title="Populate demo data to explore features"
            >
              <Sparkles className={`h-3.5 w-3.5 mr-1.5 text-amber-500 ${seeding ? "animate-spin" : ""}`} />
              {seeding ? "Seeding..." : "Demo Data"}
            </Button>
            <Button
              size="sm"
              onClick={onNewInvoice}
              className="h-9 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              <Plus className="h-4 w-4 mr-1 sm:mr-1.5" />
              New Invoice
            </Button>

            {/* User profile & Logout */}
            {user && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 ml-1">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-900 leading-tight">
                    {user.name || "Akhil"}
                  </span>
                  <span className="text-[10px] text-slate-500 leading-none truncate max-w-[130px]">
                    {user.email}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  className="h-9 w-9 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Subnav */}
        <div className="md:hidden flex overflow-x-auto py-2 space-x-1 border-t border-slate-100">
          {tabs.map((tab) => {
            const active = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-3 py-1 text-xs rounded-md whitespace-nowrap font-medium transition-colors ${
                  active
                    ? "bg-slate-100 text-blue-600 font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
