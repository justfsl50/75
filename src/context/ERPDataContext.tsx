"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getDashboard,
  getAttendance,
  getToday,
  getLastVisit,
  getSubjects,
  getTimetable,
  getProfile,
  getAllAttendance,
  SessionExpiredError,
  type DashboardData,
  type Attendance,
  type TodayResponse,
  type LastVisitResponse,
  type Subject,
  type TimetableResponse,
  type StudentProfile,
  type AllAttendanceResponse,
} from "@/lib/api";
import {
  cacheGet,
  cacheSet,
  setCacheFetchedAt,
  getCacheTimestamp,
  CACHE_KEYS,
} from "@/lib/erpCache";

// ─── Types ──────────────────────────────────────────────────────

interface ERPDataState {
  dashboard: DashboardData | null;
  profile: StudentProfile | null;
  overallAttendance: Attendance | null;
  subjectAttendance: AllAttendanceResponse | null;
  subjects: Subject[] | null;
  timetable: TimetableResponse | null;
  today: TodayResponse | null;
  lastVisit: LastVisitResponse | null;

  loading: boolean;
  /** Individual loading steps for progress display */
  loadingStep: string | null;
  error: string | null;
  sessionExpired: boolean;
  lastSynced: number | null;

  /** Fetch all ERP data sequentially and cache it. */
  fetchAllAndCache: (sessionId: string) => Promise<void>;
  /** Re-fetch everything from API. */
  refresh: () => Promise<void>;
  /** Fetch only dynamic data (attendance, today, last-visit). */
  syncDynamic: () => Promise<void>;
  /** Clear the sessionExpired flag (after re-auth). */
  clearSessionExpired: () => void;
}

const ERPDataContext = createContext<ERPDataState | null>(null);

// ─── Helpers ────────────────────────────────────────────────────

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── Provider ───────────────────────────────────────────────────

export function ERPDataProvider({ children }: { children: ReactNode }) {
  const { sessionId, isAuthenticated, handleApiError } = useAuth();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [overallAttendance, setOverallAttendance] = useState<Attendance | null>(null);
  const [subjectAttendance, setSubjectAttendance] = useState<AllAttendanceResponse | null>(null);
  const [subjects, setSubjects] = useState<Subject[] | null>(null);
  const [timetable, setTimetable] = useState<TimetableResponse | null>(null);
  const [today, setToday] = useState<TodayResponse | null>(null);
  const [lastVisit, setLastVisit] = useState<LastVisitResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [lastSynced, setLastSynced] = useState<number | null>(null);

  // Load from cache on mount when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const cached = {
      dashboard: cacheGet<DashboardData>(CACHE_KEYS.dashboard),
      profile: cacheGet<StudentProfile>(CACHE_KEYS.profile),
      attendance: cacheGet<Attendance>(CACHE_KEYS.attendance),
      allAttendance: cacheGet<AllAttendanceResponse>(CACHE_KEYS.allAttendance),
      subjects: cacheGet<Subject[]>(CACHE_KEYS.subjects),
      timetable: cacheGet<TimetableResponse>(CACHE_KEYS.timetable),
      today: cacheGet<TodayResponse>(CACHE_KEYS.today),
      lastVisit: cacheGet<LastVisitResponse>(CACHE_KEYS.lastVisit),
    };

    if (cached.dashboard) setDashboard(cached.dashboard);
    if (cached.profile) setProfile(cached.profile);
    if (cached.attendance) setOverallAttendance(cached.attendance);
    if (cached.allAttendance) setSubjectAttendance(cached.allAttendance);
    if (cached.subjects) setSubjects(cached.subjects);
    if (cached.timetable) setTimetable(cached.timetable);
    if (cached.today) setToday(cached.today);
    if (cached.lastVisit) setLastVisit(cached.lastVisit);

    setLastSynced(getCacheTimestamp());
  }, [isAuthenticated]);

  // Reset state when logged out
  useEffect(() => {
    if (!isAuthenticated) {
      setDashboard(null);
      setProfile(null);
      setOverallAttendance(null);
      setSubjectAttendance(null);
      setSubjects(null);
      setTimetable(null);
      setToday(null);
      setLastVisit(null);
      setSessionExpired(false);
      setLastSynced(null);
      setError(null);
    }
  }, [isAuthenticated]);

  /**
   * Fetch all ERP data sequentially (rate-limit safe) and cache each step.
   * Called after login or full refresh.
   */
  const fetchAllAndCache = useCallback(async (sid: string) => {
    setLoading(true);
    setError(null);
    setSessionExpired(false);

    try {
      // 1. Dashboard (fast)
      setLoadingStep("Syncing student info...");
      const dashRes = await getDashboard(sid);
      setDashboard(dashRes.dashboard);
      cacheSet(CACHE_KEYS.dashboard, dashRes.dashboard);
      await delay(200);

      // 2. Overall attendance (fast)
      setLoadingStep("Syncing attendance...");
      const attRes = await getAttendance(sid);
      setOverallAttendance(attRes.attendance);
      cacheSet(CACHE_KEYS.attendance, attRes.attendance);
      await delay(200);

      // 3. Today's schedule (fast)
      setLoadingStep("Syncing today's schedule...");
      const todayRes = await getToday(sid);
      setToday(todayRes);
      cacheSet(CACHE_KEYS.today, todayRes);
      await delay(200);

      // 4. Last visit (fast)
      setLoadingStep("Syncing last visit...");
      const lastVisitRes = await getLastVisit(sid);
      setLastVisit(lastVisitRes);
      cacheSet(CACHE_KEYS.lastVisit, lastVisitRes);
      await delay(200);

      // 5. Subjects (fast)
      setLoadingStep("Syncing subjects...");
      const subRes = await getSubjects(sid);
      setSubjects(subRes.subjects);
      cacheSet(CACHE_KEYS.subjects, subRes.subjects);
      await delay(200);

      // 6. Timetable (moderate)
      setLoadingStep("Syncing timetable...");
      const ttRes = await getTimetable(sid);
      setTimetable(ttRes);
      cacheSet(CACHE_KEYS.timetable, ttRes);
      await delay(200);

      // 7. Profile (moderate)
      setLoadingStep("Syncing profile...");
      const profRes = await getProfile(sid);
      setProfile(profRes.profile);
      cacheSet(CACHE_KEYS.profile, profRes.profile);
      await delay(200);

      // 8. All subject attendance (SLOW)
      setLoadingStep("Syncing subject attendance...");
      const allAttRes = await getAllAttendance(sid);
      setSubjectAttendance(allAttRes);
      cacheSet(CACHE_KEYS.allAttendance, allAttRes);

      // Done
      setCacheFetchedAt();
      setLastSynced(Date.now());
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        setSessionExpired(true);
        handleApiError(err);
      } else {
        setError(err instanceof Error ? err.message : "Failed to sync data");
      }
    } finally {
      setLoading(false);
      setLoadingStep(null);
    }
  }, [handleApiError]);

  /** Refresh all data using current session. */
  const refresh = useCallback(async () => {
    if (!sessionId) return;
    await fetchAllAndCache(sessionId);
  }, [sessionId, fetchAllAndCache]);

  /** Sync only dynamic endpoints (fast). */
  const syncDynamic = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);

    try {
      // Attendance
      setLoadingStep("Syncing attendance...");
      const attRes = await getAttendance(sessionId);
      setOverallAttendance(attRes.attendance);
      cacheSet(CACHE_KEYS.attendance, attRes.attendance);
      await delay(200);

      // Today
      setLoadingStep("Syncing today...");
      const todayRes = await getToday(sessionId);
      setToday(todayRes);
      cacheSet(CACHE_KEYS.today, todayRes);
      await delay(200);

      // Last visit
      setLoadingStep("Syncing last visit...");
      const lvRes = await getLastVisit(sessionId);
      setLastVisit(lvRes);
      cacheSet(CACHE_KEYS.lastVisit, lvRes);
      await delay(200);

      // All subject attendance (slow)
      setLoadingStep("Syncing subject attendance...");
      const allAttRes = await getAllAttendance(sessionId);
      setSubjectAttendance(allAttRes);
      cacheSet(CACHE_KEYS.allAttendance, allAttRes);

      setCacheFetchedAt();
      setLastSynced(Date.now());
    } catch (err) {
      if (err instanceof SessionExpiredError) {
        setSessionExpired(true);
      } else {
        setError(err instanceof Error ? err.message : "Failed to sync");
      }
    } finally {
      setLoading(false);
      setLoadingStep(null);
    }
  }, [sessionId]);

  const clearSessionExpired = useCallback(() => {
    setSessionExpired(false);
  }, []);

  const value = useMemo<ERPDataState>(
    () => ({
      dashboard,
      profile,
      overallAttendance,
      subjectAttendance,
      subjects,
      timetable,
      today,
      lastVisit,
      loading,
      loadingStep,
      error,
      sessionExpired,
      lastSynced,
      fetchAllAndCache,
      refresh,
      syncDynamic,
      clearSessionExpired,
    }),
    [
      dashboard, profile, overallAttendance, subjectAttendance,
      subjects, timetable, today, lastVisit,
      loading, loadingStep, error, sessionExpired, lastSynced,
      fetchAllAndCache, refresh, syncDynamic, clearSessionExpired,
    ],
  );

  return (
    <ERPDataContext.Provider value={value}>
      {children}
    </ERPDataContext.Provider>
  );
}

export function useERPData(): ERPDataState {
  const ctx = useContext(ERPDataContext);
  if (!ctx) throw new Error("useERPData must be used within <ERPDataProvider>");
  return ctx;
}
