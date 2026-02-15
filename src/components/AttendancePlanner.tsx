"use client";

import { useMemo, useEffect, useState, Suspense, lazy } from "react";
import { useAuth } from "@/context/AuthContext";
import { useERPData } from "@/context/ERPDataContext";
import { useAttendanceData } from "@/hooks/useAttendanceData";
import { calcAttendance, validateInputs } from "@/lib/attendanceMath";
import { AttendanceForm } from "@/components/AttendanceForm";
import { ResultsPanel } from "@/components/ResultsPanel";
import { RiskMeter } from "@/components/RiskMeter";
import { SkipTodayChecker } from "@/components/SkipTodayChecker";
import { QuickUpdateButtons } from "@/components/QuickUpdateButtons";
import { AdSlot } from "@/components/AdSlot";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import {
  Calculator, CalendarDays, Settings, BookOpen, Coffee, Minus,
  LogOut, RefreshCw, Loader2, AlertCircle, Trash2, User,
  ChevronRight, Zap,
  Mail, Phone, MapPin, Building2, FileText, ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import type { TodayClassPeriod, ClassPeriod, DaySchedule } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

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

// ─── Helpers ────────────────────────────────────────────────────

function pctColor(pct: number) {
  if (pct >= 75) return "text-emerald-500";
  if (pct >= 65) return "text-yellow-500";
  return "text-red-500";
}

function barColor(pct: number) {
  if (pct >= 75) return "bg-emerald-500";
  if (pct >= 65) return "bg-yellow-500";
  return "bg-red-500";
}

function pctBg(pct: number) {
  if (pct >= 75) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  if (pct >= 65) return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
  return "bg-red-500/10 text-red-600 dark:text-red-400";
}

function relativeTime(ts: number | null): string {
  if (!ts) return "Never";
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
function getDayIndex(): number {
  const d = new Date().getDay();
  return d >= 1 && d <= 5 ? d - 1 : 0;
}

// ─── Info Row helper ────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground flex-shrink-0">{label}</span>
      <span className="text-foreground text-right font-medium">{value}</span>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────

export function AttendancePlanner() {
  const { isAuthenticated, student, logout, resetAll } = useAuth();
  const erpData = useERPData();
  const { data, setData, loaded, markPresent, markAbsent, reset } = useAttendanceData();
  const [selectedSubject, setSelectedSubject] = useState<string>("overall");

  // Auto-fill calculator data from ERP when available
  useEffect(() => {
    if (!isAuthenticated) return;

    if (selectedSubject === "overall" && erpData.overallAttendance) {
      const att = erpData.overallAttendance;
      // ERP returns totalClasses/classesAttended; some ERPs swap them - use the larger as T (total held)
      const a = Math.min(att.classesAttended, att.totalClasses);
      const t = Math.max(att.classesAttended, att.totalClasses);
      setData((prev) => ({
        ...prev,
        A: a,
        T: t,
        target: prev.target || 75,
      }));
    } else if (selectedSubject !== "overall" && erpData.subjectAttendance) {
      const sub = erpData.subjectAttendance.subjects.find((s) => s.id === selectedSubject);
      if (sub) {
        const a = Math.min(sub.classesAttended, sub.totalClasses);
        const t = Math.max(sub.classesAttended, sub.totalClasses);
        setData((prev) => ({
          ...prev,
          A: a,
          T: t,
          target: prev.target || 75,
        }));
      }
    }
  }, [isAuthenticated, selectedSubject, erpData.overallAttendance, erpData.subjectAttendance, setData]);

  const errors = useMemo(() => validateInputs(data.A, data.T, data.R, data.target), [data]);
  const result = useMemo(() => {
    if (errors.length > 0) return null;
    return calcAttendance(data.A, data.T, data.R, data.target);
  }, [data, errors]);

  const timetableData = erpData.timetable?.timetable ?? [];
  const classesPerWeek = useMemo(() => {
    if (timetableData.length === 0) return 5;
    let count = 0;
    for (const day of timetableData) {
      count += day.periods.filter((p) => p.type === "class").length;
    }
    return count || 5;
  }, [timetableData]);

  if (!loaded) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  const subjects = erpData.subjectAttendance?.subjects?.slice().sort((a, b) => a.percentage - b.percentage) ?? [];
  const todayData = erpData.today;

  return (
    <div className="space-y-4">
      <AdSlot id="ad-slot-top" maxHeight={100} />

      {/* Session expired banner */}
      {isAuthenticated && erpData.sessionExpired && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm dark:border-amber-800 dark:bg-amber-950/50"
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-amber-500" />
          <span className="flex-1 text-amber-700 dark:text-amber-300">Session expired — data may be outdated</span>
        </motion.div>
      )}

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

        {/* ═══════════════════ CALCULATOR TAB ═══════════════════ */}
        <TabsContent value="calculator" className="mt-4 space-y-5">
          {/* Student Banner (logged in only) */}
          {isAuthenticated && erpData.dashboard && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <Avatar className="h-12 w-12 border-2 border-indigo-500">
                <AvatarImage src={erpData.dashboard.photo ?? undefined} alt={erpData.dashboard.name} />
                <AvatarFallback className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300 font-bold">
                  {erpData.dashboard.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-base font-bold text-foreground">{erpData.dashboard.name}</h2>
                <p className="text-xs text-muted-foreground">
                  {erpData.dashboard.crn} &middot; Sem {erpData.dashboard.semester} &middot; {erpData.dashboard.section}
                </p>
              </div>
              {erpData.overallAttendance && (() => {
                const att = erpData.overallAttendance;
                const a = Math.min(att.classesAttended, att.totalClasses);
                const t = Math.max(att.classesAttended, att.totalClasses);
                const pct = t > 0 ? (a / t) * 100 : 0;
                return (
                  <Badge variant="outline" className={`text-xs font-bold ${pctColor(pct)}`}>
                    {pct.toFixed(1)}%
                  </Badge>
                );
              })()}
            </motion.div>
          )}

          {/* Last visit greeting */}
          {isAuthenticated && erpData.lastVisit?.lastVisit?.greeting && (
            <p className="text-xs text-muted-foreground">
              {erpData.lastVisit.lastVisit.greeting}, {erpData.lastVisit.lastVisit.name} &middot;{" "}
              Last ERP visit: {erpData.lastVisit.lastVisit.lastVisitTime}
            </p>
          )}

          {/* Subject Selector (logged in only) */}
          {isAuthenticated && subjects.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <label className="mb-2 block text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Analyze Subject
              </label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overall">Overall (All Subjects)</SelectItem>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.percentage.toFixed(1)}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* HeroBanner for non-logged-in users */}
          {!isAuthenticated && (
            <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-5 dark:border-indigo-800 dark:from-indigo-950/50 dark:to-purple-950/50">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-500 text-white">
                  <Zap className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-bold text-foreground">Connect your college ERP</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Auto-fill attendance data, view timetable, and track each subject automatically.
                  </p>
                  <Link
                    href="/login"
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
                  >
                    Login with ERP
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Attendance Form */}
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

              {!isAuthenticated && (
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                  <QuickUpdateButtons onPresent={markPresent} onAbsent={markAbsent} onReset={reset} />
                </div>
              )}
            </>
          )}

          <AdSlot id="ad-slot-mid" maxHeight={250} />

          {/* Today's Schedule (logged in only) */}
          {isAuthenticated && todayData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Today &middot; {todayData.day}
              </h3>

              {todayData.periods.length === 0 ? (
                <p className="text-sm text-muted-foreground">{todayData.message || "No classes today"}</p>
              ) : (
                <div className="space-y-2">
                  {todayData.periods.map((p, i) => {
                    if (p.type === "lunch") {
                      return (
                        <div key={i} className="flex items-center gap-3 rounded-lg bg-amber-50 px-3 py-2 text-xs dark:bg-amber-950/30">
                          <Coffee className="h-3.5 w-3.5 text-amber-500" />
                          <span className="font-mono text-muted-foreground">{p.time}</span>
                          <span className="text-amber-600 dark:text-amber-400">Lunch Break</span>
                        </div>
                      );
                    }
                    if (p.type === "free") {
                      return (
                        <div key={i} className="flex items-center gap-3 rounded-lg bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                          <Minus className="h-3.5 w-3.5" />
                          <span className="font-mono">{p.time}</span>
                          <span>Free Period</span>
                        </div>
                      );
                    }
                    const cp = p as TodayClassPeriod;
                    const statusColor =
                      cp.attendanceStatus === "present" ? "bg-emerald-500"
                      : cp.attendanceStatus === "absent" ? "bg-red-500"
                      : cp.attendanceStatus === "suspended" ? "bg-gray-400"
                      : "bg-yellow-500";

                    return (
                      <div key={i} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2">
                        <span className="w-28 flex-shrink-0 text-xs font-mono text-muted-foreground">{cp.time}</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{cp.subject}</p>
                          {cp.code && <p className="text-xs text-muted-foreground">{cp.code}</p>}
                        </div>
                        <span className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${statusColor}`} title={cp.attendanceStatus} />
                      </div>
                    );
                  })}

                  {todayData.summary && (
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>Present: <strong className="text-emerald-500">{todayData.summary.present}</strong></span>
                      <span>Absent: <strong className="text-red-500">{todayData.summary.absent}</strong></span>
                      <span>Not Marked: <strong className="text-yellow-500">{todayData.summary.notMarked}</strong></span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Subject Cards (logged in only) */}
          {isAuthenticated && subjects.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-border bg-card shadow-sm"
            >
              <div className="p-4 pb-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Subject Breakdown
                </h3>
              </div>
              <Accordion type="single" collapsible className="px-2 pb-2">
                {subjects.map((sub) => {
                  const analysis = calcAttendance(sub.classesAttended, sub.totalClasses, 0, 75);
                  return (
                    <AccordionItem key={sub.id} value={sub.id} className="border-b-0">
                      <AccordionTrigger className="px-2 py-2 hover:no-underline">
                        <div className="flex w-full items-center gap-3 pr-2">
                          <div className="min-w-0 flex-1 text-left">
                            <p className="truncate text-sm font-medium text-foreground">{sub.name}</p>
                            <div className="mt-1 flex items-center gap-2">
                              <Progress value={Math.min(100, sub.percentage)} className="h-1.5 flex-1" />
                              <span className={`text-xs font-bold ${pctColor(sub.percentage)}`}>
                                {sub.percentage.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-2 pb-2">
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Attended</span>
                            <span className="font-medium">{sub.classesAttended} / {sub.totalClasses}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Absent</span>
                            <span className="font-medium text-red-500">{sub.classesAbsent}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Can Skip (at 75%)</span>
                            <span className={`font-bold ${analysis.skippable > 0 ? "text-emerald-500" : "text-red-500"}`}>
                              {analysis.skippable}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status</span>
                            <Badge variant="outline" className={`text-[10px] ${pctBg(sub.percentage)}`}>
                              {sub.percentage >= 75 ? "On Track" : "Below Target"}
                            </Badge>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </motion.div>
          )}

          {/* Loading indicator for ERP data */}
          {isAuthenticated && erpData.loading && (
            <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {erpData.loadingStep || "Loading..."}
            </div>
          )}
        </TabsContent>

        {/* ═══════════════════ PLANNER TAB ═══════════════════ */}
        <TabsContent value="planner" className="mt-4 space-y-5">
          <Suspense fallback={<LazyFallback />}>
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <WhatIfSimulator A={data.A} T={data.T} R={data.R} target={data.target} />
            </div>
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <WeeklyPlanner
                A={data.A}
                T={data.T}
                R={data.R}
                target={data.target}
              />
            </div>
          </Suspense>

          {/* Timetable (logged in only) */}
          {isAuthenticated && timetableData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-border bg-card shadow-sm overflow-hidden"
            >
              <div className="p-4 pb-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Weekly Timetable
                </h3>
              </div>
              <Tabs defaultValue={DAYS[getDayIndex()]} className="w-full">
                <TabsList className="mx-4 grid w-[calc(100%-2rem)] grid-cols-5">
                  {DAYS.map((day, i) => (
                    <TabsTrigger key={day} value={day} className="text-[10px] sm:text-xs">
                      {day.slice(0, 3)}
                      {i === getDayIndex() && (
                        <span className="ml-0.5 inline-block h-1.5 w-1.5 rounded-full bg-indigo-500" />
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {DAYS.map((day) => {
                  const dayData = timetableData.find((d: DaySchedule) => d.day === day);
                  const periods = dayData?.periods ?? [];

                  return (
                    <TabsContent key={day} value={day} className="mt-2 space-y-1.5 px-4 pb-4">
                      {periods.length === 0 ? (
                        <p className="py-6 text-center text-sm text-muted-foreground">No periods</p>
                      ) : (
                        periods.map((p, i) => {
                          if (p.type === "lunch") {
                            return (
                              <div key={i} className="flex items-center gap-3 rounded-lg bg-amber-50 px-3 py-2 dark:bg-amber-950/30">
                                <Coffee className="h-3.5 w-3.5 flex-shrink-0 text-amber-500" />
                                <span className="text-xs font-mono text-muted-foreground">{p.time}</span>
                                <span className="text-xs text-amber-600 dark:text-amber-400">Lunch</span>
                              </div>
                            );
                          }
                          if (p.type === "free") {
                            return (
                              <div key={i} className="flex items-center gap-3 rounded-lg bg-muted/40 px-3 py-2">
                                <Minus className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                                <span className="text-xs font-mono text-muted-foreground">{p.time}</span>
                                <span className="text-xs text-muted-foreground">Free</span>
                              </div>
                            );
                          }
                          const cp = p as ClassPeriod;
                          return (
                            <div key={i} className={`rounded-lg border border-border px-3 py-2 ${cp.isSuspended ? "opacity-60" : ""}`}>
                              <div className="flex items-start gap-2">
                                <BookOpen className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-indigo-500" />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <p className={`text-xs font-medium text-foreground ${cp.isSuspended ? "line-through" : ""}`}>
                                      {cp.subject}
                                    </p>
                                    {cp.classType && (
                                      <Badge variant="outline" className="text-[9px] px-1 py-0">
                                        {cp.classType}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap gap-x-2 text-[10px] text-muted-foreground">
                                    <span className="font-mono">{cp.time}</span>
                                    {cp.teacher && <span>{cp.teacher}</span>}
                                    {cp.room && <span>Room {cp.room}</span>}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </TabsContent>
                  );
                })}
              </Tabs>
            </motion.div>
          )}
        </TabsContent>

        {/* ═══════════════════ SETTINGS TAB ═══════════════════ */}
        <TabsContent value="settings" className="mt-4 space-y-5">
          {/* Profile Card (logged in only) */}
          {isAuthenticated && erpData.profile && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-border bg-card shadow-sm overflow-hidden"
            >
              {/* Profile header */}
              <div className="flex flex-col items-center gap-3 p-6 pb-4">
                <Avatar className="h-20 w-20 border-2 border-indigo-500">
                  <AvatarImage src={erpData.profile.photo ?? undefined} alt={erpData.profile.name} />
                  <AvatarFallback className="bg-indigo-100 text-2xl font-bold text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300">
                    {erpData.profile.firstName?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h2 className="text-lg font-bold text-foreground">{erpData.profile.name}</h2>
                  <p className="text-sm text-muted-foreground">{erpData.profile.crn}</p>
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-2 px-4 pb-2 text-sm">
                <InfoRow label="Roll Number" value={student?.rollNo} />
                <InfoRow label="Program" value={student?.program} />
                <InfoRow label="Branch" value={student?.branch} />
                <InfoRow label="Section" value={student?.section} />
                <InfoRow label="Semester" value={student?.semester} />
                <InfoRow label="DOB" value={erpData.profile.dob} />
                <InfoRow label="Gender" value={erpData.profile.gender === "M" ? "Male" : erpData.profile.gender === "F" ? "Female" : erpData.profile.gender} />
              </div>

              <Separator className="my-2" />

              {/* Collapsible sections */}
              <Accordion type="multiple" className="px-4 pb-4">
                <AccordionItem value="contact">
                  <AccordionTrigger className="text-sm py-2">
                    <span className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-indigo-500" /> Contact</span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 text-sm">
                    <InfoRow label="College Email" value={erpData.profile.email} />
                    <InfoRow label="Personal Email" value={erpData.profile.personalEmail} />
                    <InfoRow label="Phone" value={erpData.profile.phone} />
                    {erpData.profile.phone2 && <InfoRow label="Phone 2" value={erpData.profile.phone2} />}
                    <InfoRow label="Father&apos;s Phone" value={erpData.profile.fatherPhone} />
                    <InfoRow label="Mother&apos;s Phone" value={erpData.profile.motherPhone} />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="family">
                  <AccordionTrigger className="text-sm py-2">
                    <span className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-indigo-500" /> Family</span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 text-sm">
                    <InfoRow label="Father" value={erpData.profile.fatherName} />
                    <InfoRow label="Mother" value={erpData.profile.motherName} />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="address">
                  <AccordionTrigger className="text-sm py-2">
                    <span className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-indigo-500" /> Address</span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 text-sm">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Current</p>
                      <p className="text-foreground">
                        {[erpData.profile.address.current.line1, erpData.profile.address.current.line2, erpData.profile.address.current.line3].filter(Boolean).join(", ")}
                      </p>
                      <p className="text-muted-foreground">PIN: {erpData.profile.address.current.pincode}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Permanent</p>
                      <p className="text-foreground">
                        {[erpData.profile.address.permanent.line1, erpData.profile.address.permanent.line2, erpData.profile.address.permanent.line3].filter(Boolean).join(", ")}
                      </p>
                      <p className="text-muted-foreground">PIN: {erpData.profile.address.permanent.pincode}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="bank">
                  <AccordionTrigger className="text-sm py-2">
                    <span className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5 text-indigo-500" /> Bank Details</span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 text-sm">
                    <InfoRow label="Account No" value={erpData.profile.bank.accountNo} />
                    <InfoRow label="Bank" value={erpData.profile.bank.bankName} />
                    <InfoRow label="Branch" value={erpData.profile.bank.branch} />
                    <InfoRow label="IFSC" value={erpData.profile.bank.ifsc} />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="documents">
                  <AccordionTrigger className="text-sm py-2">
                    <span className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-indigo-500" /> Documents</span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 text-sm">
                    <InfoRow label="Aadhar" value={erpData.profile.documents.aadhar} />
                    <InfoRow label="Caste Certificate" value={erpData.profile.documents.casteCertificate} />
                    <InfoRow label="Domicile Certificate" value={erpData.profile.documents.domicileCertificate} />
                    <InfoRow label="Income Certificate" value={erpData.profile.documents.incomeCertificate} />
                    <InfoRow label="Transfer Certificate" value={erpData.profile.documents.transferCertificate} />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="emergency">
                  <AccordionTrigger className="text-sm py-2">
                    <span className="flex items-center gap-2"><ShieldAlert className="h-3.5 w-3.5 text-indigo-500" /> Emergency</span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 text-sm">
                    <InfoRow label="Name" value={erpData.profile.emergency.contactName} />
                    <InfoRow label="Phone" value={erpData.profile.emergency.contactNo} />
                    <InfoRow label="Relationship" value={erpData.profile.emergency.relationship} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          )}

          {/* Sync Info (logged in only) */}
          {isAuthenticated && (
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Data Sync</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <span className={`h-2 w-2 rounded-full ${
                    erpData.sessionExpired ? "bg-red-500" :
                    erpData.lastSynced && (Date.now() - erpData.lastSynced) < 300000 ? "bg-emerald-500" :
                    "bg-amber-500"
                  }`} />
                  <span className="text-muted-foreground">
                    {erpData.sessionExpired ? "Session expired" :
                     erpData.lastSynced ? `Last synced: ${relativeTime(erpData.lastSynced)}` : "Not synced"}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5"
                  onClick={() => {
                    erpData.syncDynamic().then(() => toast.success("Data synced!")).catch(() => {});
                  }}
                  disabled={erpData.loading}
                >
                  {erpData.loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                  Quick Sync
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5"
                  onClick={() => {
                    erpData.refresh().then(() => toast.success("All data refreshed!")).catch(() => {});
                  }}
                  disabled={erpData.loading}
                >
                  {erpData.loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                  Refresh All
                </Button>
              </div>
            </div>
          )}

          {/* Reminders */}
          <Suspense fallback={<LazyFallback />}>
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <ReminderSettings />
            </div>
          </Suspense>

          {/* About */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">About</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Attendance75 helps college students maintain their target attendance.
              {isAuthenticated
                ? " Your ERP data is cached locally and only cleared when you log out."
                : " All data is stored locally on your device. No account needed."}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Last updated: {data.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : "Never"}
            </p>
          </div>

          {/* Login CTA (not logged in) */}
          {!isAuthenticated && (
            <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-4 dark:border-indigo-800 dark:from-indigo-950/50 dark:to-purple-950/50">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-indigo-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Connect your ERP for more features</p>
                  <p className="text-xs text-muted-foreground">Auto-fill data, view profile, timetable & more</p>
                </div>
                <Link
                  href="/login"
                  className="rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-600"
                >
                  Login
                </Link>
              </div>
            </div>
          )}

          {/* Logout (logged in) */}
          {isAuthenticated && (
            <Button
              variant="outline"
              className="w-full gap-2 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          )}

          {/* Factory Reset */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-full gap-2 text-xs text-muted-foreground hover:text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Reset All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Factory Reset</AlertDialogTitle>
                <AlertDialogDescription>
                  This will delete ALL your data including saved attendance, reminders, cached ERP data, and stored credentials. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-500 hover:bg-red-600"
                  onClick={() => {
                    resetAll();
                    toast.success("All data has been cleared.");
                  }}
                >
                  Reset Everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>
      </Tabs>

      <AdSlot id="ad-slot-bottom" className="sticky bottom-0" maxHeight={100} />
    </div>
  );
}
