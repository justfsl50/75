"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, Zap } from "lucide-react";

export function HeroBanner() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="mb-6 rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-5 dark:border-indigo-800 dark:from-indigo-950/50 dark:to-purple-950/50">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-500 text-white">
          <Zap className="h-5 w-5" />
        </div>
        <div className="flex-1">
          {isAuthenticated ? (
            <>
              <h2 className="text-base font-bold text-foreground">You&apos;re connected!</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                View your real attendance, timetable, and profile from your college ERP.
              </p>
              <Link
                href="/dashboard"
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
              >
                Go to Dashboard
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-base font-bold text-foreground">Connect your college ERP</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Sync real attendance data, view your timetable, and track each subject automatically.
              </p>
              <Link
                href="/login"
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
              >
                Login with ERP
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
