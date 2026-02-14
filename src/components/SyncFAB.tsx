"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useERPData } from "@/context/ERPDataContext";
import { CaptchaDialog } from "@/components/CaptchaDialog";
import { RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function SyncFAB() {
  const { isAuthenticated } = useAuth();
  const erpData = useERPData();
  const [captchaOpen, setCaptchaOpen] = useState(false);

  if (!isAuthenticated) return null;

  // Determine if data is stale (> 10 min)
  const isStale = erpData.lastSynced
    ? (Date.now() - erpData.lastSynced) > 600000
    : true;

  const handleSync = async () => {
    if (erpData.sessionExpired) {
      // Open CAPTCHA re-login dialog
      setCaptchaOpen(true);
      return;
    }

    // Try dynamic sync
    try {
      await erpData.syncDynamic();
      toast.success("Data synced!");
    } catch {
      // If it failed due to session expiry, ERPDataContext sets the flag
      if (erpData.sessionExpired) {
        setCaptchaOpen(true);
      }
    }
  };

  return (
    <>
      <AnimatePresence>
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleSync}
          disabled={erpData.loading}
          className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500 text-white shadow-lg transition-colors hover:bg-indigo-600 disabled:opacity-70"
          title={erpData.sessionExpired ? "Re-login to sync" : "Sync attendance data"}
        >
          {erpData.loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <div className="relative">
              <RefreshCw className="h-5 w-5" />
              {/* Stale/expired indicator dot */}
              {(isStale || erpData.sessionExpired) && (
                <span
                  className={`absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-indigo-500 ${
                    erpData.sessionExpired ? "bg-red-500 animate-pulse" : "bg-amber-500 animate-pulse"
                  }`}
                />
              )}
            </div>
          )}
        </motion.button>
      </AnimatePresence>

      <CaptchaDialog open={captchaOpen} onOpenChange={setCaptchaOpen} />
    </>
  );
}
