"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useERPData } from "@/context/ERPDataContext";
import {
  getCaptcha,
  submitCaptcha,
  refreshCaptcha,
  ApiError,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Loader2, RefreshCw, Eye, EyeOff, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

type Step = "credentials" | "captcha" | "syncing";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const { fetchAllAndCache, loadingStep } = useERPData();
  const router = useRouter();

  const [step, setStep] = useState<Step>("credentials");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [captchaImage, setCaptchaImage] = useState("");
  const [captchaText, setCaptchaText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRefresh = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    setError("");
    try {
      const fresh = await refreshCaptcha(sessionId);
      setCaptchaImage(fresh.captchaImage);
      setCaptchaText("");
    } catch {
      setError("Could not refresh CAPTCHA. Please start over.");
      setStep("credentials");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && step !== "syncing") {
      router.replace("/");
    }
  }, [isAuthenticated, router, step]);

  if (isAuthenticated && step !== "syncing") {
    return null;
  }

  const handleGetCaptcha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await getCaptcha(username.trim(), password);
      setSessionId(res.sessionId);
      setCaptchaImage(res.captchaImage);
      setCaptchaText("");
      setStep("captcha");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.details || err.message);
      } else {
        setError("Failed to connect. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCaptcha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaText.trim()) {
      setError("Please enter the CAPTCHA text.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await submitCaptcha(sessionId, captchaText.trim());
      // Store credentials for quick re-login + set auth state
      login(res.sessionId, res.student, username.trim(), password);
      toast.success(`Welcome, ${res.student.name}!`);

      // Show syncing state and fetch all data
      setStep("syncing");
      await fetchAllAndCache(res.sessionId);

      // Redirect to calculator
      router.push("/");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        // Wrong captcha — refresh and retry
        setError("Wrong CAPTCHA. Fetching a new one...");
        setCaptchaText("");
        try {
          const fresh = await refreshCaptcha(sessionId);
          setCaptchaImage(fresh.captchaImage);
          setError("Wrong CAPTCHA. Please try again with the new image.");
        } catch {
          setError("Session expired. Please start over.");
          setStep("credentials");
        }
      } else if (err instanceof ApiError) {
        setError(err.details || err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-indigo-500" />
            <span className="text-xl font-bold text-foreground">Attendance75</span>
          </Link>
          <p className="text-sm text-muted-foreground text-center">
            Connect to your college ERP to sync real attendance data
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          {step === "syncing" ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">Syncing your data...</p>
                {loadingStep && (
                  <p className="mt-1 text-xs text-muted-foreground">{loadingStep}</p>
                )}
              </div>
            </div>
          ) : step === "credentials" ? (
            <form onSubmit={handleGetCaptcha} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="username">Username / CRN</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="e.g. 2023BCS000"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  disabled={loading}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">ERP Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Your ERP password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    disabled={loading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Connecting to ERP..." : "Continue"}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Your credentials are sent directly to your college ERP and stored locally for quick re-login.
              </p>
            </form>
          ) : (
            <form onSubmit={handleSubmitCaptcha} className="space-y-4">
              <button
                type="button"
                onClick={() => { setStep("credentials"); setError(""); }}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>

              <div className="space-y-2">
                <Label>Solve the CAPTCHA</Label>
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
                    title="Load new CAPTCHA"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="captcha">CAPTCHA Text</Label>
                <Input
                  id="captcha"
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
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          )}
        </div>

        {/* Footer */}
        {step !== "syncing" && (
          <p className="text-center text-xs text-muted-foreground">
            Or use the{" "}
            <Link href="/" className="text-indigo-500 underline underline-offset-2 hover:text-indigo-400">
              manual calculator
            </Link>{" "}
            without logging in.
          </p>
        )}
      </div>
    </div>
  );
}
