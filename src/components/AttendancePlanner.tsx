"use client";

import { useMemo, Suspense, lazy } from "react";
import { useAttendanceData } from "@/hooks/useAttendanceData";
import { calcAttendance, validateInputs } from "@/lib/attendanceMath";
import { AttendanceForm } from "@/components/AttendanceForm";
import { ResultsPanel } from "@/components/ResultsPanel";
import { RiskMeter } from "@/components/RiskMeter";
import { SkipTodayChecker } from "@/components/SkipTodayChecker";
import { QuickUpdateButtons } from "@/components/QuickUpdateButtons";
import { AdSlot } from "@/components/AdSlot";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, CalendarDays, Settings } from "lucide-react";

const WhatIfSimulator = lazy(() =>
  import("@/components/WhatIfSimulator").then((m) => ({ default: m.WhatIfSimulator }))
);
const WeeklyPlanner = lazy(() =>
  import("@/components/WeeklyPlanner").then((m) => ({ default: m.WeeklyPlanner }))
);
const ReminderSettings = lazy(() =>
  import("@/components/ReminderSettings").then((m) => ({ default: m.ReminderSettings }))
);

function LazyFallback() {
  return <div className="flex h-20 items-center justify-center text-sm text-muted-foreground">Loading...</div>;
}

export function AttendancePlanner() {
  const { data, setData, loaded, markPresent, markAbsent, reset } = useAttendanceData();

  const errors = useMemo(() => validateInputs(data.A, data.T, data.R, data.target), [data]);
  const result = useMemo(() => {
    if (errors.length > 0) return null;
    return calcAttendance(data.A, data.T, data.R, data.target);
  }, [data, errors]);

  if (!loaded) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AdSlot id="ad-slot-top" />

      <Tabs defaultValue="calculator" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calculator" className="gap-1.5 text-xs sm:text-sm">
            <Calculator className="h-3.5 w-3.5" />
            Calculator
          </TabsTrigger>
          <TabsTrigger value="planner" className="gap-1.5 text-xs sm:text-sm">
            <CalendarDays className="h-3.5 w-3.5" />
            Planner
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-1.5 text-xs sm:text-sm">
            <Settings className="h-3.5 w-3.5" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="mt-4 space-y-5">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <AttendanceForm data={data} onChange={setData} />
          </div>

          {result && (
            <>
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <ResultsPanel result={result} target={data.target} T={data.T} />
              </div>

              <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <RiskMeter riskScore={result.riskScore} />
              </div>

              <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <SkipTodayChecker A={data.A} T={data.T} R={data.R} target={data.target} />
              </div>

              <AdSlot id="ad-slot-mid" />

              <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <QuickUpdateButtons onPresent={markPresent} onAbsent={markAbsent} onReset={reset} />
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="planner" className="mt-4 space-y-5">
          <Suspense fallback={<LazyFallback />}>
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <WhatIfSimulator A={data.A} T={data.T} R={data.R} target={data.target} />
            </div>
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <WeeklyPlanner A={data.A} T={data.T} R={data.R} target={data.target} />
            </div>
          </Suspense>
        </TabsContent>

        <TabsContent value="settings" className="mt-4 space-y-5">
          <Suspense fallback={<LazyFallback />}>
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <ReminderSettings />
            </div>
          </Suspense>
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">About</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Attendance Planner helps college students maintain their target attendance.
              All data is stored locally on your device. No account needed.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Last updated: {data.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : "Never"}
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <AdSlot id="ad-slot-bottom" className="sticky bottom-0" />
    </div>
  );
}
