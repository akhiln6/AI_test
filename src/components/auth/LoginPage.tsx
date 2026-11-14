"use client";

import { useState } from "react";
import { Receipt, Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface LoginPageProps {
  onLoginSuccess: (user: { email: string; name: string }) => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid username or password");
      }

      onLoginSuccess(data.user);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full blur-3xl pointer-events-none opacity-60"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-100 rounded-full blur-3xl pointer-events-none opacity-60"></div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand header */}
        <div className="flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 mb-3">
            <Receipt className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            BillFlow
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise Invoicing & Billing Management
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-lg font-bold text-slate-900">
              Sign In to Your Account
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Enter your credentials to access your invoices, customers, and billing analytics.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 pt-0 space-y-4">
            {error && (
              <div className="p-3 text-xs rounded-lg bg-red-50 text-red-800 border border-red-200 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="login-email">Email / Username</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="pl-9 h-10 text-sm"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="login-password">Password</Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-9 pr-10 h-10 text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-all text-sm mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Authenticating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security badge footer */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Protected Session &bull; MongoDB Atlas Connected</span>
        </div>
      </div>
    </div>
  );
}
