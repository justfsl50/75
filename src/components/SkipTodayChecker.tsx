"use client";

import { canSkipToday } from "@/lib/attendanceMath";
import { Button } from "@/components/ui/button";
import { Coffee, ShieldAlert } from "lucide-react";
import { useState } from "react";

interface SkipTodayCheckerProps {
  A: number;
  T: number;
  R: number;
  target: number;
}

export function SkipTodayChecker({ A, T, R, target }: SkipTodayCheckerProps) {
  const [checked, setChecked] = useState(false);

  if (T === 0 || R === 0) return null;

  const { safe, resultAfterSkip } = canSkipToday(A, T, R, target);

  return (
    <div className="space-y-3">
      {!checked ? (
        <Button
          onClick={() => setChecked(true)}
          className="w-full gap-2 bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          size="lg"
        >
          <Coffee className="h-4 w-4" />
          Can I Skip Today?
        </Button>
      ) : (
        <div
          className={`rounded-xl border-2 p-4 text-center ${
            safe
              ? "border-emerald-500/30 bg-emerald-500/5"
              : "border-red-500/30 bg-red-500/5"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            {safe ? (
              <Coffee className="h-5 w-5 text-emerald-500" />
            ) : (
              <ShieldAlert className="h-5 w-5 text-red-500" />
            )}
            <span
              className={`text-lg font-bold ${
                safe ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
              }`}
            >
              {safe ? "Yes, you can skip!" : "No, don't skip!"}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {safe
              ? `After skipping, you'd still have ${resultAfterSkip.skippable} skip(s) left and ${resultAfterSkip.currentPercent.toFixed(1)}% attendance.`
              : `Skipping would drop you to ${resultAfterSkip.currentPercent.toFixed(1)}%. You need every class to reach ${target}%.`}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => setChecked(false)}
          >
            Check Again
          </Button>
        </div>
      )}
    </div>
  );
}
