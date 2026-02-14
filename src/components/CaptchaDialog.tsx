"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useERPData } from "@/context/ERPDataContext";
import {
  getCaptcha,
  submitCaptcha,
  refreshCaptcha,
  ApiError,
} from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface CaptchaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CaptchaDialog({ open, onOpenChange }: CaptchaDialogProps) {
  const { getStoredCreds, reAuthenticate } = useAuth();
  const { fetchAllAndCache, clearSessionExpired } = useERPData();

  const [sessionId, setSessionId] = useState("");
  const [captchaImage, setCaptchaImage] = useState("");
  const [captchaText, setCaptchaText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"loading" | "captcha" | "syncing" | "error">("loading");

  // Auto-fetch CAPTCHA when dialog opens
  useEffect(() => {
    if (!open) return;

    // Reset state
    setCaptchaText("");
    setError("");

    const creds = getStoredCreds();
    if (!creds) {
      setStep("error");
      setError("No stored credentials. Please log in again.");
      return;
    }

    setStep("loading");
    setLoading(true);

    getCaptcha(creds.username, creds.password)
      .then((res) => {
        setSessionId(res.sessionId);
        setCaptchaImage(res.captchaImage);
        setStep("captcha");
      })
      .catch((err) => {
        if (err instanceof ApiError) {
          if (err.details?.includes("Navigation timeout") || err.status === 500) {
            setError("ERP server unreachable. Please try again later.");
          } else {
            setError("ERP connection failed. Your password may have changed.");
          }
        } else {
          setError("Failed to connect to ERP. Please try again.");
        }
        setStep("error");
      })
      .finally(() => setLoading(false));
  }, [open, getStoredCreds]);

  const handleRefresh = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    setError("");
    try {
      const fresh = await refreshCaptcha(sessionId);
      setCaptchaImage(fresh.captchaImage);
      setCaptchaText("");
    } catch {
      setError("Could not refresh CAPTCHA.");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaText.trim()) {
      setError("Please enter the CAPTCHA text.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await submitCaptcha(sessionId, captchaText.trim());

      // Re-authenticate with new session
      reAuthenticate(res.sessionId, res.student);
      clearSessionExpired();

      // Sync data
      setStep("syncing");
      await fetchAllAndCache(res.sessionId);

      toast.success("Data synced!");
      onOpenChange(false);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        // Wrong CAPTCHA — refresh and retry
        setCaptchaText("");
        try {
          const fresh = await refreshCaptcha(sessionId);
          setCaptchaImage(fresh.captchaImage);
          setError("Wrong CAPTCHA. Try again with the new image.");
        } catch {
          setError("Session expired. Please close and try again.");
        }
      } else if (err instanceof ApiError) {
        setError(err.details || err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
      setStep("captcha");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Quick Re-login</DialogTitle>
          <DialogDescription>
            Your session expired. Solve the CAPTCHA to sync fresh data.
          </DialogDescription>
        </DialogHeader>

        {step === "loading" && (
          <div className="flex flex-col items-center gap-3 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            <p className="text-sm text-muted-foreground">Connecting to ERP...</p>
          </div>
        )}

        {step === "syncing" && (
          <div className="flex flex-col items-center gap-3 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            <p className="text-sm text-muted-foreground">Syncing your data...</p>
          </div>
        )}

        {step === "error" && (
          <div className="space-y-4 py-4">
            <p className="text-sm text-red-500 text-center">{error}</p>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setStep("loading");
                  setError("");
                  const creds = getStoredCreds();
                  if (creds) {
                    setLoading(true);
                    getCaptcha(creds.username, creds.password)
                      .then((res) => {
                        setSessionId(res.sessionId);
                        setCaptchaImage(res.captchaImage);
                        setStep("captcha");
                      })
                      .catch(() => {
                        setError("Still unable to connect. Try again later.");
                        setStep("error");
                      })
                      .finally(() => setLoading(false));
                  }
                }}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Try Again
              </Button>
              <Link href="/login" onClick={() => onOpenChange(false)}>
                <Button variant="outline" className="w-full">
                  Go to Full Login
                </Button>
              </Link>
            </div>
          </div>
        )}

        {step === "captcha" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex-1 overflow-hidden rounded-lg border border-border bg-white p-2">
                  {captchaImage && (
                    <img
                      src={captchaImage}
                      alt="CAPTCHA"
                      className="mx-auto h-12 object-contain"
                      draggable={false}
                    />
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={loading}
                  title="New CAPTCHA"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="captcha-dialog">CAPTCHA Text</Label>
              <Input
                id="captcha-dialog"
                type="text"
                placeholder="Type what you see above"
                value={captchaText}
                onChange={(e) => setCaptchaText(e.target.value)}
                autoFocus
                autoComplete="off"
                disabled={loading}
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Verifying..." : "Sync Data"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
