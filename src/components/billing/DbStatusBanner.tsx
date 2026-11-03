"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, RefreshCw, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface DbStatus {
  connected: boolean;
  message: string;
  hasPasswordPlaceholder: boolean;
}

export function DbStatusBanner({ onStatusChange }: { onStatusChange?: (status: DbStatus) => void }) {
  const [status, setStatus] = useState<DbStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setStatus(data);
      if (onStatusChange) onStatusChange(data);
    } catch {
      const errStatus = {
        connected: false,
        message: "Unable to check database status.",
        hasPasswordPlaceholder: false,
      };
      setStatus(errStatus);
      if (onStatusChange) onStatusChange(errStatus);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  if (loading && !status) {
    return null;
  }

  if (status?.connected) {
    return (
      <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs text-emerald-800 flex items-center justify-between no-print">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>
            <strong>MongoDB Atlas:</strong> Connected to Cluster (<code className="font-mono bg-emerald-100 px-1 py-0.5 rounded text-[11px]">cluster0.2op9u0f.mongodb.net</code>)
          </span>
        </div>
        <button
          onClick={checkStatus}
          title="Refresh connection"
          className="hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
        >
          <RefreshCw className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border-b border-amber-300 px-4 py-3 text-xs text-amber-900 no-print">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <div className="font-semibold text-amber-950 flex items-center gap-2">
              <Database className="h-3.5 w-3.5" />
              MongoDB Atlas Setup Required
            </div>
            <p className="mt-0.5 text-amber-800 leading-relaxed">
              {status?.hasPasswordPlaceholder ? (
                <>
                  Your MongoDB Atlas URL is set with placeholder{" "}
                  <code className="font-mono bg-amber-200/80 px-1.5 py-0.5 rounded font-bold text-amber-950">
                    &lt;db_password&gt;
                  </code>
                  . Replace it with your actual Atlas password in{" "}
                  <code className="font-mono bg-amber-200/80 px-1.5 py-0.5 rounded font-bold text-amber-950">
                    .env.local
                  </code>{" "}
                  (for local) or in your <strong>Vercel Project Settings → Environment Variables</strong>.
                </>
              ) : (
                status?.message || "Not connected to MongoDB Atlas."
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs bg-white border-amber-300 text-amber-900 hover:bg-amber-100"
            onClick={checkStatus}
            disabled={loading}
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${loading ? "animate-spin" : ""}`} />
            Re-check Connection
          </Button>
        </div>
      </div>
    </div>
  );
}

