"use client";

import { useState, useEffect } from "react";
import {
  Save,
  Building,
  CreditCard,
  Database,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DbStatus } from "./DbStatusBanner";

interface SettingsData {
  companyName: string;
  email: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  taxId?: string;
  currency: string;
  defaultTaxRate: number;
  paymentDetails?: string;
  defaultTerms?: string;
  logoUrl?: string;
}

interface SettingsTabProps {
  initialSettings: SettingsData | null;
  onSeedData: () => void;
  seeding?: boolean;
}

export function SettingsTab({
  initialSettings,
  onSeedData,
  seeding,
}: SettingsTabProps) {
  const [formData, setFormData] = useState<SettingsData>({
    companyName: "Acme Corporation",
    email: "billing@acme.com",
    phone: "+1 (555) 019-2834",
    address: {
      street: "123 Business Avenue, Suite 400",
      city: "San Francisco",
      state: "CA",
      postalCode: "94107",
      country: "USA",
    },
    taxId: "US-84920412",
    currency: "USD",
    defaultTaxRate: 10,
    paymentDetails:
      "Bank: Silicon Valley Bank\nAccount Name: Acme Corp\nAccount Number: 9876543210\nRouting Number: 121000358\nSWIFT: SVBUS6S",
    defaultTerms:
      "Payment is due within 14 days of invoice date. Thank you for your business!",
    logoUrl: "",
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null);
  const [checkingDb, setCheckingDb] = useState(false);

  useEffect(() => {
    if (initialSettings) {
      setFormData(initialSettings);
    }
  }, [initialSettings]);

  const testDb = async () => {
    setCheckingDb(true);
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setDbStatus(data);
    } catch {
      setDbStatus({
        connected: false,
        message: "Failed to reach health API endpoint.",
        hasPasswordPlaceholder: false,
      });
    } finally {
      setCheckingDb(false);
    }
  };

  useEffect(() => {
    testDb();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Settings & Configuration
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure your business profile, default invoice terms, payment details, and MongoDB Atlas connection.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Profile */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Building className="h-4 w-4 text-blue-600" />
              Company / Business Profile
            </CardTitle>
            <CardDescription className="text-xs">
              This information is displayed prominently on your printed and exported invoices.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="companyName">Company / Business Name *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="companyEmail">Billing Email *</Label>
                <Input
                  id="companyEmail"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="companyPhone">Phone Number</Label>
                <Input
                  id="companyPhone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="companyTax">Tax ID / EIN / VAT / GST Number</Label>
                <Input
                  id="companyTax"
                  value={formData.taxId}
                  onChange={(e) =>
                    setFormData({ ...formData, taxId: e.target.value })
                  }
                  placeholder="e.g. US-12345678"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <Label>Business Street Address</Label>
              <Input
                placeholder="Street Address, Suite / Floor"
                value={formData.address?.street}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, street: e.target.value },
                  })
                }
              />
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
          </CardContent>
        </Card>

        {/* Invoice & Payment Defaults */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-blue-600" />
              Invoice & Payment Defaults
            </CardTitle>
            <CardDescription className="text-xs">
              Default currency, default tax rates, and wire transfer or payment instructions.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="prefCurrency">Default Currency</Label>
                <Select
                  id="prefCurrency"
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value })
                  }
                >
                  <option value="USD">USD ($ - US Dollar)</option>
                  <option value="EUR">EUR (€ - Euro)</option>
                  <option value="GBP">GBP (£ - British Pound)</option>
                  <option value="INR">INR (₹ - Indian Rupee)</option>
                  <option value="CAD">CAD ($ - Canadian Dollar)</option>
                  <option value="AUD">AUD ($ - Australian Dollar)</option>
                  <option value="SGD">SGD ($ - Singapore Dollar)</option>
                  <option value="AED">AED (AED - UAE Dirham)</option>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="prefTax">Default Tax Rate (%)</Label>
                <Input
                  id="prefTax"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.defaultTaxRate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      defaultTaxRate: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="paymentDetails">Payment Instructions (Bank / Wire / UPI)</Label>
              <Textarea
                id="paymentDetails"
                rows={3}
                placeholder="Bank Name: ...&#10;Account Number: ...&#10;Routing/SWIFT: ...&#10;UPI ID: ..."
                value={formData.paymentDetails}
                onChange={(e) =>
                  setFormData({ ...formData, paymentDetails: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="defaultTerms">Default Invoice Terms & Notes</Label>
              <Textarea
                id="defaultTerms"
                rows={2}
                placeholder="Payment is due within 14 days of invoice date..."
                value={formData.defaultTerms}
                onChange={(e) =>
                  setFormData({ ...formData, defaultTerms: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Bar */}
        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            <Save className="h-4 w-4 mr-1.5" />
            {saving ? "Saving Changes..." : "Save Settings"}
          </Button>
          {saveSuccess && (
            <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              Settings saved successfully!
            </span>
          )}
        </div>
      </form>

      {/* MongoDB Atlas Diagnostics & Vercel Guide */}
      <Card className="border-slate-200 shadow-xs bg-slate-50/50">
        <CardHeader className="p-5 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-600" />
              MongoDB Atlas Connection & Vercel Deployment
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={testDb}
              disabled={checkingDb}
              className="text-xs h-8 bg-white"
            >
              <RefreshCw
                className={`h-3 w-3 mr-1 ${checkingDb ? "animate-spin" : ""}`}
              />
              Test Connection
            </Button>
          </div>
          <CardDescription className="text-xs">
            Diagnostics and connection string setup for MongoDB Atlas cluster.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0 space-y-4">
          <div
            className={`p-3.5 rounded-lg border text-xs flex items-start gap-2.5 ${
              dbStatus?.connected
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-amber-50 border-amber-200 text-amber-900"
            }`}
          >
            {dbStatus?.connected ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-semibold">
                Status: {dbStatus?.connected ? "Online & Connected" : "Action Required"}
              </div>
              <p className="mt-0.5 leading-relaxed">{dbStatus?.message}</p>
            </div>
          </div>

          <div className="bg-slate-900 text-slate-100 rounded-lg p-3.5 text-xs font-mono space-y-2 overflow-x-auto">
            <div className="text-slate-400 text-[11px]"># Configured URI in .env.local:</div>
            <div className="text-emerald-400 break-all select-all">
              mongodb+srv://akhiln6_db_user:&lt;db_password&gt;@cluster0.2op9u0f.mongodb.net/billing_app?retryWrites=true&w=majority
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600">
            <h4 className="font-semibold text-slate-900">
              Steps to Deploy on Vercel:
            </h4>
            <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed">
              <li>
                In your MongoDB Atlas Dashboard, ensure <strong>Network Access</strong> includes{" "}
                <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">
                  0.0.0.0/0
                </code>{" "}
                (Allow Access from Anywhere) so Vercel serverless functions can connect.
              </li>
              <li>
                Push your code to GitHub / GitLab and import the repository into{" "}
                <strong>Vercel</strong>.
              </li>
              <li>
                In the Vercel project deployment screen (or Project Settings → Environment Variables), add:
                <div className="mt-1 p-2 rounded bg-slate-100 font-mono text-[11px] text-slate-900">
                  MONGODB_URI = mongodb+srv://akhiln6_db_user:YOUR_ACTUAL_PASSWORD@cluster0.2op9u0f.mongodb.net/billing_app?retryWrites=true&w=majority
                </div>
              </li>
              <li>Deploy! The app will immediately connect to your MongoDB Atlas cluster.</li>
            </ol>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-600">
              Need sample data to test workflows right now?
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSeedData}
              disabled={seeding}
              className="text-xs bg-white text-slate-700 hover:bg-slate-50"
            >
              <Sparkles className={`h-3.5 w-3.5 mr-1.5 text-amber-500 ${seeding ? "animate-spin" : ""}`} />
              {seeding ? "Seeding..." : "Load Demo Billing Data"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

