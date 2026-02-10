"use client";

import { InstallPWAButton } from "@/components/InstallPWAButton";
import { GraduationCap } from "lucide-react";
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-indigo-500" />
          <span className="text-base font-bold text-foreground">75Attendance</span>
        </Link>
        <InstallPWAButton />
      </div>
    </header>
  );
}
