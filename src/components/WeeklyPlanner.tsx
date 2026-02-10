"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { weeklyDistributionPlan } from "@/lib/attendanceMath";
import { Info, AlertTriangle } from "lucide-react";

interface WeeklyPlannerProps {
  A: number;
  T: number;
  R: number;
  target: number;
}

export function WeeklyPlanner({ A, T, R, target }: WeeklyPlannerProps) {
  const [weeks, setWeeks] = useState(8);
  const [classesPerWeek, setClassesPerWeek] = useState(6);

  const plan = useMemo(
    () => weeklyDistributionPlan(A, T, R, target, weeks, classesPerWeek),
    [A, T, R, target, weeks, classesPerWeek]
  );

  // Show helpful message when no data is entered
  if (R === 0 && T === 0) {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Weekly Survival Planner</h2>
        <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/50 p-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Enter your attendance data in the Calculator tab first. Set your total classes, attended classes, and remaining classes to get a weekly plan.
          </p>
        </div>
      </div>
    );
  }

  if (R === 0) {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Weekly Survival Planner</h2>
        <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/50 p-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No remaining classes to plan. Update your remaining classes in the Calculator tab to use the Weekly Planner.
          </p>
        </div>
      </div>
    );
  }

  // Check if the user's inputs are inconsistent with their actual R
  const totalInWindow = weeks * classesPerWeek;
  const mismatch = totalInWindow > 0 && Math.abs(totalInWindow - R) / Math.max(totalInWindow, R) > 0.5;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Weekly Survival Planner</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="weeksRemaining" className="text-sm">Weeks Remaining</Label>
          <Input
            id="weeksRemaining"
            type="number"
            min={1}
            max={52}
            inputMode="numeric"
            value={weeks || ""}
            onChange={(e) => setWeeks(Math.max(1, parseInt(e.target.value) || 1))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="classesPerWeek" className="text-sm">Classes / Week</Label>
          <Input
            id="classesPerWeek"
            type="number"
            min={1}
            max={50}
            inputMode="numeric"
            value={classesPerWeek || ""}
            onChange={(e) => setClassesPerWeek(Math.max(1, parseInt(e.target.value) || 1))}
          />
        </div>
      </div>

      {/* Mismatch warning */}
      {mismatch && (
        <div className="flex items-start gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-2.5">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-yellow-500" />
          <p className="text-xs text-yellow-600 dark:text-yellow-400">
            You have {R} remaining classes but {weeks} weeks &times; {classesPerWeek} classes = {totalInWindow} planned.
            {" "}Adjust weeks or classes/week to match for the most accurate plan.
          </p>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-border bg-card p-3">
          <span className="text-xs text-muted-foreground">Min Attend / Week</span>
          <p className="text-xl font-bold text-indigo-500">{plan.minPerWeek}</p>
          <span className="text-[10px] text-muted-foreground">out of {classesPerWeek}</span>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <span className="text-xs text-muted-foreground">Can Skip / Week</span>
          <p className="text-xl font-bold text-emerald-500">{plan.skippablePerWeek}</p>
          <span className="text-[10px] text-muted-foreground">out of {classesPerWeek}</span>
        </div>
      </div>

      {/* Weekly distribution */}
      {plan.distribution.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Weekly Distribution (min classes to attend)</h3>
          <div className="flex flex-wrap gap-1.5">
            {plan.distribution.map((count, i) => (
              <div
                key={i}
                className={`flex h-10 w-10 flex-col items-center justify-center rounded-lg border text-xs ${
                  count >= classesPerWeek
                    ? "border-red-500/30 bg-red-500/10"
                    : count === 0
                      ? "border-emerald-500/30 bg-emerald-500/10"
                      : "border-border bg-card"
                }`}
              >
                <span className="text-[10px] text-muted-foreground">W{i + 1}</span>
                <span className="font-bold text-foreground">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
