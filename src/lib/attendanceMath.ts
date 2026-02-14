/**
 * Pure attendance calculation utilities.
 * All functions are stateless and side-effect free.
 */

export interface AttendanceData {
  A: number; // classes attended
  T: number; // total classes held
  R: number; // remaining scheduled classes
  target: number; // target percentage (0-100)
  lastUpdated: number; // timestamp
}

export interface AttendanceResult {
  currentPercent: number;
  requiredTotal: number;
  requiredFuture: number;
  skippable: number;
  reachable: boolean;
  finalPercentIfAttendAll: number;
  riskScore: number; // 0-100, higher = more risk
}

export interface WeeklyPlan {
  weeksRemaining: number;
  classesPerWeek: number;
  minPerWeek: number;
  skippablePerWeek: number;
  distribution: number[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export function validateInputs(A: number, T: number, R: number, target: number): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!Number.isFinite(A) || A < 0) errors.push({ field: "A", message: "Classes attended must be 0 or more" });
  if (!Number.isFinite(T) || T < 0) errors.push({ field: "T", message: "Total classes must be 0 or more" });
  if (!Number.isFinite(R) || R < 0) errors.push({ field: "R", message: "Remaining classes must be 0 or more" });
  if (!Number.isFinite(target) || target <= 0 || target > 100) errors.push({ field: "target", message: "Target must be between 1 and 100" });
  if (Number.isFinite(A) && Number.isFinite(T) && A > T) errors.push({ field: "A", message: "Attended cannot exceed total classes" });
  if (T > 10000) errors.push({ field: "T", message: "Total classes seems too large" });
  if (R > 10000) errors.push({ field: "R", message: "Remaining classes seems too large" });

  return errors;
}

export function calcCurrentPercent(A: number, T: number): number {
  if (T === 0) return 0;
  return (A / T) * 100;
}

export function calcRequiredFuture(A: number, T: number, R: number, target: number): number {
  const targetFrac = target / 100;
  const requiredTotal = Math.ceil(targetFrac * (T + R));
  const requiredFuture = Math.max(0, requiredTotal - A);
  return requiredFuture;
}

/** Skip from future total classes while maintaining target. Formula: floor(A/(target/100)) - T */
export function calcSkippable(A: number, T: number, target: number): number {
  if (T === 0) return 0;
  const targetFrac = target / 100;
  const maxTotalAllowed = Math.floor(A / targetFrac);
  return Math.max(0, maxTotalAllowed - T);
}

export function calcRiskScore(currentPercent: number, target: number, skippable: number, R: number): number {
  if (R === 0) {
    return currentPercent >= target ? 0 : 100;
  }

  // Factor 1: how close current % is to target (weight 40%)
  const percentDiff = currentPercent - target;
  const percentRisk = percentDiff >= 10 ? 0 : percentDiff >= 5 ? 20 : percentDiff >= 0 ? 40 : Math.min(100, 60 + Math.abs(percentDiff) * 2);

  // Factor 2: ratio of skippable to remaining (weight 40%)
  const skipRatio = skippable / R;
  const skipRisk = skipRatio >= 0.5 ? 0 : skipRatio >= 0.25 ? 30 : skipRatio >= 0.1 ? 60 : skipRatio > 0 ? 80 : 100;

  // Factor 3: absolute remaining buffer (weight 20%)
  const bufferRisk = skippable >= 10 ? 0 : skippable >= 5 ? 20 : skippable >= 2 ? 50 : skippable >= 1 ? 70 : 100;

  return Math.round(percentRisk * 0.4 + skipRisk * 0.4 + bufferRisk * 0.2);
}

export function calcAttendance(A: number, T: number, R: number, target: number): AttendanceResult {
  const currentPercent = calcCurrentPercent(A, T);
  const requiredFuture = calcRequiredFuture(A, T, R, target);
  const skippable = calcSkippable(A, T, target);
  const reachable = requiredFuture <= R;
  const finalPercentIfAttendAll = T + R > 0 ? ((A + R) / (T + R)) * 100 : 0;
  const riskScore = calcRiskScore(currentPercent, target, skippable, R);

  return {
    currentPercent,
    requiredTotal: Math.ceil((target / 100) * (T + R)),
    requiredFuture,
    skippable,
    reachable,
    finalPercentIfAttendAll,
    riskScore,
  };
}

export function simulateMissN(A: number, T: number, R: number, target: number, missN: number): AttendanceResult {
  const newT = T + missN;
  const newR = Math.max(0, R - missN);
  return calcAttendance(A, newT, newR, target);
}

export function simulateAttendN(A: number, T: number, R: number, target: number, attendN: number): AttendanceResult {
  const n = Math.min(attendN, R);
  const newA = A + n;
  const newT = T + n;
  const newR = Math.max(0, R - n);
  return calcAttendance(newA, newT, newR, target);
}

export function canSkipToday(A: number, T: number, R: number, target: number): { safe: boolean; resultAfterSkip: AttendanceResult } {
  const resultAfterSkip = simulateMissN(A, T, R, target, 1);
  return {
    safe: resultAfterSkip.reachable && resultAfterSkip.skippable >= 0,
    resultAfterSkip,
  };
}

export function weeklyDistributionPlan(
  A: number,
  T: number,
  R: number,
  target: number,
  weeksRemaining: number,
  classesPerWeek: number
): WeeklyPlan {
  // Total classes in the planning window (capped by actual remaining)
  const totalInWindow = Math.min(R, weeksRemaining * classesPerWeek);

  // Required future classes based on the ACTUAL remaining (R),
  // not the window — otherwise we underestimate when R > weeks * classesPerWeek
  const requiredFuture = calcRequiredFuture(A, T, R, target);

  // Proportion of the requirement that falls in this planning window.
  // If the window covers all remaining classes, this equals requiredFuture.
  // If R > window, distribute proportionally so the pace is even.
  const requiredInWindow =
    R > 0
      ? Math.min(totalInWindow, Math.ceil(requiredFuture * (totalInWindow / R)))
      : 0;

  const minPerWeek =
    weeksRemaining > 0 ? Math.ceil(requiredInWindow / weeksRemaining) : 0;
  const skippablePerWeek = Math.max(0, classesPerWeek - minPerWeek);

  // Build distribution: spread required classes evenly across weeks
  const distribution: number[] = [];
  let remaining = requiredInWindow;
  for (let i = 0; i < weeksRemaining; i++) {
    const weeksLeft = weeksRemaining - i;
    const thisWeek = Math.min(classesPerWeek, Math.ceil(remaining / weeksLeft));
    distribution.push(thisWeek);
    remaining -= thisWeek;
  }

  return {
    weeksRemaining,
    classesPerWeek,
    minPerWeek,
    skippablePerWeek,
    distribution,
  };
}

export function getRiskLabel(riskScore: number): string {
  if (riskScore <= 20) return "Safe";
  if (riskScore <= 40) return "Low Risk";
  if (riskScore <= 60) return "Moderate";
  if (riskScore <= 80) return "High Risk";
  return "Critical";
}

export function getRiskColor(riskScore: number): string {
  if (riskScore <= 20) return "text-emerald-500";
  if (riskScore <= 40) return "text-green-500";
  if (riskScore <= 60) return "text-yellow-500";
  if (riskScore <= 80) return "text-orange-500";
  return "text-red-500";
}

export function getRiskBgColor(riskScore: number): string {
  if (riskScore <= 20) return "bg-emerald-500";
  if (riskScore <= 40) return "bg-green-500";
  if (riskScore <= 60) return "bg-yellow-500";
  if (riskScore <= 80) return "bg-orange-500";
  return "bg-red-500";
}

export const DEFAULT_DATA: AttendanceData = {
  A: 0,
  T: 0,
  R: 0,
  target: 75,
  lastUpdated: Date.now(),
};
