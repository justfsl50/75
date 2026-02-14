"use client";

import { InstallPWAButton } from "@/components/InstallPWAButton";
import { useAuth } from "@/context/AuthContext";
import { useERPData } from "@/context/ERPDataContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GraduationCap, LogIn } from "lucide-react";
import Link from "next/link";

export function Header() {
  const { isAuthenticated, student } = useAuth();
  const erpData = useERPData();

  // Determine sync status dot color
  const statusColor = erpData.sessionExpired
    ? "bg-red-500"
    : erpData.lastSynced && (Date.now() - erpData.lastSynced) < 300000
      ? "bg-emerald-500"
      : erpData.lastSynced
        ? "bg-amber-500"
        : undefined;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex items-center justify-between px-4 py-3 max-w-lg">
        <Link href="/" className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-indigo-500" />
          <span className="text-base font-bold text-foreground">Attendance75</span>
        </Link>

        <div className="flex items-center gap-2">
          <InstallPWAButton />

          {isAuthenticated && student ? (
            <div className="relative flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm">
              <Avatar className="h-6 w-6">
                <AvatarImage src={student.photo ?? undefined} alt={student.name} />
                <AvatarFallback className="bg-indigo-100 text-xs font-bold text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300">
                  {student.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-foreground sm:inline">{student.name.split(" ")[0]}</span>
              {statusColor && (
                <span className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-background ${statusColor}`} />
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">ERP Login</span>
              <span className="sm:hidden">Login</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
