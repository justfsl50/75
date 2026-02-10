"use client";

import { useState, useEffect, useCallback } from "react";
import type { AttendanceData } from "@/lib/attendanceMath";
import { DEFAULT_DATA } from "@/lib/attendanceMath";

const STORAGE_KEY = "attendanceData";

function loadData(): AttendanceData {
  if (typeof window === "undefined") return DEFAULT_DATA;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;
    const parsed = JSON.parse(raw);
    return {
      A: Number(parsed.A) || 0,
      T: Number(parsed.T) || 0,
      R: Number(parsed.R) || 0,
      target: Number(parsed.target) || 75,
      lastUpdated: Number(parsed.lastUpdated) || Date.now(),
    };
  } catch {
    return DEFAULT_DATA;
  }
}

function saveData(data: AttendanceData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // quota exceeded - ignore
  }
}

export function useAttendanceData() {
  const [data, setDataRaw] = useState<AttendanceData>(DEFAULT_DATA);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setDataRaw(loadData());
    setLoaded(true);
  }, []);

  const setData = useCallback((updater: AttendanceData | ((prev: AttendanceData) => AttendanceData)) => {
    setDataRaw((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      const withTimestamp = { ...next, lastUpdated: Date.now() };
      saveData(withTimestamp);
      return withTimestamp;
    });
  }, []);

  const markPresent = useCallback(() => {
    setData((prev) => ({ ...prev, A: prev.A + 1, T: prev.T + 1, R: Math.max(0, prev.R - 1) }));
  }, [setData]);

  const markAbsent = useCallback(() => {
    setData((prev) => ({ ...prev, T: prev.T + 1, R: Math.max(0, prev.R - 1) }));
  }, [setData]);

  const reset = useCallback(() => {
    setData(DEFAULT_DATA);
  }, [setData]);

  return { data, setData, loaded, markPresent, markAbsent, reset };
}
