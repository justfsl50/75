"use client";

import type { AttendanceResult } from "@/lib/attendanceMath";
import { getRiskLabel, getRiskColor } from "@/lib/attendanceMath";
import { CheckCircle2, XCircle, TrendingUp, TrendingDown, Calendar, Target } from "lucide-react";

interface ResultsPanelProps {
  result: AttendanceResult;
  target: number;
  T: number;
}

export function ResultsPanel({ result, target, T }: ResultsPanelProps) {
  if (T === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 text-center">
        <p className="text-muted-foreground">Enter your class data above to see results.</p>
      </div>
    );
  }

  const riskLabel = getRiskLabel(result.riskScore);
  const riskColor = getRiskColor(result.riskScore);

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">Results</h2>
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Current Attendance"
          value={`${result.currentPercent.toFixed(1)}%`}
          color={result.currentPercent >= target ? "text-emerald-500" : "text-red-500"}
        />
        <StatCard
          icon={<Target className="h-4 w-4" />}
          label="Must Attend Next"
          value={`${result.requiredFuture}`}
          sublabel="classes"
          color="text-blue-500"
        />
        <StatCard
          icon={<Calendar className="h-4 w-4" />}
          label="Can Skip"
          value={`${result.skippable}`}
          sublabel="classes"
          color={result.skippable > 0 ? "text-emerald-500" : "text-red-500"}
        />
        <StatCard
          icon={<TrendingDown className="h-4 w-4" />}
          label="If Attend All"
          value={`${result.finalPercentIfAttendAll.toFixed(1)}%`}
          color="text-indigo-500"
        />
      </div>

      {/* Reachable banner */}
      <div
        className={`flex items-center gap-2 rounded-lg p-3 text-sm font-medium ${
          result.reachable
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : "bg-red-500/10 text-red-600 dark:text-red-400"
        }`}
      >
        {result.reachable ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
        {result.reachable ? `${target}% target is reachable!` : `${target}% target is NOT reachable`}
      </div>

      {/* Risk */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-2.5">
        <span className="text-sm text-muted-foreground">Risk Level</span>
        <span className={`text-sm font-semibold ${riskColor}`}>{riskLabel}</span>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sublabel,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel?: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3.5">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className={`mt-1 text-2xl font-bold ${color}`}>
        {value}
        {sublabel && <span className="ml-1 text-xs font-normal text-muted-foreground">{sublabel}</span>}
      </div>
    </div>
  );
}
