"use client";

import { useState, useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import { simulateMissN, simulateAttendN } from "@/lib/attendanceMath";
import { getRiskColor, getRiskLabel } from "@/lib/attendanceMath";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info } from "lucide-react";

interface WhatIfSimulatorProps {
  A: number;
  T: number;
  R: number;
  target: number;
}

export function WhatIfSimulator({ A, T, R, target }: WhatIfSimulatorProps) {
  const [missN, setMissN] = useState(0);
  const [attendN, setAttendN] = useState(0);
  const maxSim = Math.min(R, 30);

  const missResult = useMemo(() => simulateMissN(A, T, R, target, missN), [A, T, R, target, missN]);
  const attendResult = useMemo(() => simulateAttendN(A, T, R, target, attendN), [A, T, R, target, attendN]);

  // Show a helpful message when simulation is not possible
  if (R === 0 && T === 0) {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">What-If Simulator</h2>
        <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/50 p-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Enter your attendance data in the Calculator tab first. Set your total classes, attended classes, and remaining classes to start simulating.
          </p>
        </div>
      </div>
    );
  }

  if (R === 0) {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">What-If Simulator</h2>
        <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/50 p-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No remaining classes to simulate. Update your remaining classes in the Calculator tab to use the What-If Simulator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">What-If Simulator</h2>
      <Tabs defaultValue="miss" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="miss">Miss Classes</TabsTrigger>
          <TabsTrigger value="attend">Attend Classes</TabsTrigger>
        </TabsList>
        <TabsContent value="miss" className="space-y-4 pt-2">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Miss next</span>
              <span className="font-semibold text-foreground">{missN} classes</span>
            </div>
            <Slider
              value={[missN]}
              onValueChange={([v]) => setMissN(v)}
              min={0}
              max={maxSim}
              step={1}
            />
          </div>
          <SimResult
            currentPercent={missResult.currentPercent}
            skippable={missResult.skippable}
            reachable={missResult.reachable}
            riskScore={missResult.riskScore}
            target={target}
          />
        </TabsContent>
        <TabsContent value="attend" className="space-y-4 pt-2">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Attend next</span>
              <span className="font-semibold text-foreground">{attendN} classes</span>
            </div>
            <Slider
              value={[attendN]}
              onValueChange={([v]) => setAttendN(v)}
              min={0}
              max={maxSim}
              step={1}
            />
          </div>
          <SimResult
            currentPercent={attendResult.currentPercent}
            skippable={attendResult.skippable}
            reachable={attendResult.reachable}
            riskScore={attendResult.riskScore}
            target={target}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SimResult({
  currentPercent,
  skippable,
  reachable,
  riskScore,
  target,
}: {
  currentPercent: number;
  skippable: number;
  reachable: boolean;
  riskScore: number;
  target: number;
}) {
  const riskColor = getRiskColor(riskScore);
  return (
    <div className="grid grid-cols-2 gap-2 text-sm">
      <div className="rounded-lg border border-border bg-card p-2.5">
        <span className="text-xs text-muted-foreground">Attendance</span>
        <p className={`font-bold ${currentPercent >= target ? "text-emerald-500" : "text-red-500"}`}>
          {currentPercent.toFixed(1)}%
        </p>
      </div>
      <div className="rounded-lg border border-border bg-card p-2.5">
        <span className="text-xs text-muted-foreground">Can Skip</span>
        <p className={`font-bold ${skippable > 0 ? "text-emerald-500" : "text-red-500"}`}>{skippable}</p>
      </div>
      <div className="rounded-lg border border-border bg-card p-2.5">
        <span className="text-xs text-muted-foreground">Target</span>
        <p className={`font-bold ${reachable ? "text-emerald-500" : "text-red-500"}`}>
          {reachable ? "Reachable" : "Not Reachable"}
        </p>
      </div>
      <div className="rounded-lg border border-border bg-card p-2.5">
        <span className="text-xs text-muted-foreground">Risk</span>
        <p className={`font-bold ${riskColor}`}>{getRiskLabel(riskScore)}</p>
      </div>
    </div>
  );
}
