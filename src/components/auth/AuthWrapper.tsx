"use client";

import { useState, useEffect } from "react";
import { LoginPage } from "./LoginPage";
import { BillingApp } from "@/components/billing/BillingApp";
import { Receipt } from "lucide-react";

export function AuthWrapper() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    checkSession();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error(e);
    } finally {
      setUser(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 animate-pulse">
            <Receipt className="h-6 w-6" />
          </div>
          <span className="text-sm font-semibold text-slate-700">
            Loading BillFlow...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLoginSuccess={(u) => setUser(u)} />;
  }

  return <BillingApp user={user} onLogout={handleLogout} />;
}

