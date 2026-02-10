"use client";

import { getRiskLabel, getRiskColor, getRiskBgColor } from "@/lib/attendanceMath";

interface RiskMeterProps {
  riskScore: number;
}

export function RiskMeter({ riskScore }: RiskMeterProps) {
  const label = getRiskLabel(riskScore);
  const textColor = getRiskColor(riskScore);
  const bgColor = getRiskBgColor(riskScore);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Risk Meter</span>
        <span className={`text-sm font-semibold ${textColor}`}>{label}</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${bgColor}`}
          style={{ width: `${Math.min(100, Math.max(2, riskScore))}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>Safe</span>
        <span>Low</span>
        <span>Moderate</span>
        <span>High</span>
        <span>Critical</span>
      </div>
    </div>
  );
}
