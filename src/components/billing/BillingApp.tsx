"use client";

import { useState, useEffect, useCallback } from "react";
import { Navbar, NavTab } from "./Navbar";
import { DbStatusBanner, DbStatus } from "./DbStatusBanner";
import { DashboardTab } from "./DashboardTab";
import { InvoicesTab } from "./InvoicesTab";
import { CustomersTab } from "./CustomersTab";
import { ProductsTab } from "./ProductsTab";
import { SettingsTab } from "./SettingsTab";
import { CreateInvoiceModal } from "./CreateInvoiceModal";
import { InvoiceDetailModal, FullInvoice } from "./InvoiceDetailModal";
import { RecordPaymentModal } from "./RecordPaymentModal";
import { CustomerModal, CustomerType } from "./CustomerModal";
import { ProductModal, ProductType } from "./ProductModal";

interface BillingAppProps {
  user?: { email: string; name: string } | null;
  onLogout?: () => void;
}

export function BillingApp({ user, onLogout }: BillingAppProps) {
  const [currentTab, setCurrentTab] = useState<NavTab>("dashboard");
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null);

  // Data States
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [invoices, setInvoices] = useState<FullInvoice[]>([]);
  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [settings, setSettings] = useState<any>(null);

  // Loading States
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [seeding, setSeeding] = useState(false);

  // Modal States
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<FullInvoice | null>(null);
  const [isInvoiceDetailOpen, setIsInvoiceDetailOpen] = useState(false);

  const [paymentInvoice, setPaymentInvoice] = useState<FullInvoice | null>(null);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerType | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Data Fetchers
  const fetchDashboard = useCallback(async () => {
    setLoadingDashboard(true);
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      if (json.success) setDashboardData(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDashboard(false);
    }
  }, []);

  const fetchInvoices = useCallback(async () => {
    setLoadingInvoices(true);
    try {
      const res = await fetch("/api/invoices");
      const json = await res.json();
      if (json.success) setInvoices(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingInvoices(false);
    }
  }, []);

  const fetchCustomers = useCallback(async () => {
    setLoadingCustomers(true);
    try {
      const res = await fetch("/api/customers");
      const json = await res.json();
      if (json.success) setCustomers(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCustomers(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch("/api/products");
      const json = await res.json();
      if (json.success) setProducts(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      const json = await res.json();
      if (json.success) setSettings(json.data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const refreshAll = useCallback(() => {
    fetchDashboard();
    fetchInvoices();
    fetchCustomers();
    fetchProducts();
    fetchSettings();
  }, [fetchDashboard, fetchInvoices, fetchCustomers, fetchProducts, fetchSettings]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Seed Demo Data
  const handleSeedData = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        refreshAll();
        alert("Demo data loaded successfully!");
      } else {
        alert(json.error || "Failed to seed demo data");
      }
    } catch (e) {
      alert("Error seeding demo data");
    } finally {
      setSeeding(false);
    }
  };

  // Handlers
  const handleOpenNewInvoice = () => {
    setIsCreateInvoiceOpen(true);
  };

  const handleOpenNewCustomer = () => {
    setSelectedCustomer(null);
    setIsCustomerModalOpen(true);
  };

  const handleEditCustomer = (customer: CustomerType) => {
    setSelectedCustomer(customer);
    setIsCustomerModalOpen(true);
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchCustomers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleInvoiceCustomer = (customer: CustomerType) => {
    setSelectedCustomer(customer);
    setIsCreateInvoiceOpen(true);
  };

  const handleOpenNewProduct = () => {
    setSelectedProduct(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (product: ProductType) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchProducts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleViewInvoice = (inv: FullInvoice) => {
    setSelectedInvoice(inv);
    setIsInvoiceDetailOpen(true);
  };

  const handleRecordPayment = (inv: FullInvoice) => {
    setPaymentInvoice(inv);
    setIsRecordPaymentOpen(true);
  };

  const handleDeleteInvoice = async (id: string) => {
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchInvoices();
        fetchDashboard();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <DbStatusBanner onStatusChange={setDbStatus} />

      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onNewInvoice={handleOpenNewInvoice}
        onSeedData={handleSeedData}
        seeding={seeding}
        user={user}
        onLogout={onLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === "dashboard" && (
          <DashboardTab
            data={dashboardData}
            loading={loadingDashboard}
            onNewInvoice={handleOpenNewInvoice}
            onNewCustomer={handleOpenNewCustomer}
            onViewInvoice={handleViewInvoice}
            onRecordPayment={handleRecordPayment}
            onSeedData={handleSeedData}
            onGoToInvoices={() => setCurrentTab("invoices")}
            seeding={seeding}
            currency={settings?.currency || "INR"}
          />
        )}

        {currentTab === "invoices" && (
          <InvoicesTab
            invoices={invoices}
            loading={loadingInvoices}
            onNewInvoice={handleOpenNewInvoice}
            onViewInvoice={handleViewInvoice}
            onRecordPayment={handleRecordPayment}
            onDeleteInvoice={handleDeleteInvoice}
          />
        )}

        {currentTab === "customers" && (
          <CustomersTab
            customers={customers}
            loading={loadingCustomers}
            onNewCustomer={handleOpenNewCustomer}
            onEditCustomer={handleEditCustomer}
            onDeleteCustomer={handleDeleteCustomer}
            onInvoiceCustomer={handleInvoiceCustomer}
          />
        )}

        {currentTab === "products" && (
          <ProductsTab
            products={products}
            loading={loadingProducts}
            onNewProduct={handleOpenNewProduct}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
            currency={settings?.currency || "INR"}
          />
        )}

        {currentTab === "settings" && (
          <SettingsTab
            initialSettings={settings}
            onSeedData={handleSeedData}
            seeding={seeding}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            BillFlow &bull; Next.js Invoicing Application &bull; MongoDB Atlas
          </span>
          <span className="text-[11px] text-slate-400">
            Deployable on Vercel
          </span>
        </div>
      </footer>

      {/* Modals */}
      <CreateInvoiceModal
        isOpen={isCreateInvoiceOpen}
        onClose={() => setIsCreateInvoiceOpen(false)}
        onSuccess={() => {
          fetchInvoices();
          fetchDashboard();
        }}
        onOpenCustomerModal={() => {
          setIsCreateInvoiceOpen(false);
          setIsCustomerModalOpen(true);
        }}
        customers={customers}
        products={products}
        defaultCurrency={settings?.currency || "INR"}
      />

      <InvoiceDetailModal
        isOpen={isInvoiceDetailOpen}
        onClose={() => setIsInvoiceDetailOpen(false)}
        invoice={selectedInvoice}
        settings={settings}
        onRecordPayment={(inv) => {
          setIsInvoiceDetailOpen(false);
          setPaymentInvoice(inv);
          setIsRecordPaymentOpen(true);
        }}
        onStatusUpdated={() => {
          fetchInvoices();
          fetchDashboard();
        }}
      />

      <RecordPaymentModal
        isOpen={isRecordPaymentOpen}
        onClose={() => setIsRecordPaymentOpen(false)}
        invoice={paymentInvoice}
        onPaymentSuccess={() => {
          fetchInvoices();
          fetchDashboard();
        }}
      />

      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        customer={selectedCustomer}
        onSuccess={() => {
          fetchCustomers();
          fetchDashboard();
        }}
      />

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        product={selectedProduct}
        onSuccess={() => {
          fetchProducts();
          fetchDashboard();
        }}
      />
    </div>
  );
}

