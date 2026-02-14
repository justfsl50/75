/**
 * ERP data cache layer using localStorage.
 * Stores all ERP API responses locally on the device.
 * Only cleared on explicit logout or factory reset.
 */

import type { StudentInfo } from "@/lib/api";

export const CACHE_KEYS = {
  profile: "erp_profile",
  dashboard: "erp_dashboard",
  attendance: "erp_attendance",
  allAttendance: "erp_attendance_all",
  subjects: "erp_subjects",
  timetable: "erp_timetable",
  today: "erp_today",
  lastVisit: "erp_last_visit",
  fetchedAt: "erp_fetched_at",
  credentials: "erp_credentials",
  session: "erp_session",
} as const;

export type CacheKey = (typeof CACHE_KEYS)[keyof typeof CACHE_KEYS];

/** Store a value in the cache. */
export function cacheSet<T>(key: CacheKey, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // quota exceeded — ignore
  }
}

/** Retrieve a value from the cache. Returns null if missing or corrupt. */
export function cacheGet<T>(key: CacheKey): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Remove a single cache key. */
export function cacheRemove(key: CacheKey): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}

/** Clear all ERP cache keys (called on logout). */
export function clearERPCache(): void {
  if (typeof window === "undefined") return;
  for (const key of Object.values(CACHE_KEYS)) {
    localStorage.removeItem(key);
  }
}

/** Set the "last fetched" timestamp to now. */
export function setCacheFetchedAt(): void {
  cacheSet(CACHE_KEYS.fetchedAt, Date.now());
}

/** Get the timestamp of the last full data fetch, or null. */
export function getCacheTimestamp(): number | null {
  return cacheGet<number>(CACHE_KEYS.fetchedAt);
}

/** Get cache age in milliseconds, or null if no cache. */
export function getCacheAge(): number | null {
  const ts = getCacheTimestamp();
  if (ts === null) return null;
  return Date.now() - ts;
}

/** Store ERP credentials for quick re-login (CAPTCHA-only). */
export function storeCredentials(username: string, password: string): void {
  cacheSet(CACHE_KEYS.credentials, { username, password });
}

/** Get stored credentials, or null. */
export function getStoredCredentials(): { username: string; password: string } | null {
  return cacheGet<{ username: string; password: string }>(CACHE_KEYS.credentials);
}

/** Clear stored credentials. */
export function clearCredentials(): void {
  cacheRemove(CACHE_KEYS.credentials);
}

/** Store auth session (sessionId + student) for persistence across refresh. */
export function storeSession(sessionId: string, student: StudentInfo): void {
  cacheSet(CACHE_KEYS.session, { sessionId, student });
}

/** Get stored session, or null. */
export function getStoredSession(): { sessionId: string; student: StudentInfo } | null {
  return cacheGet<{ sessionId: string; student: StudentInfo }>(CACHE_KEYS.session);
}

/**
 * Factory reset — clears EVERYTHING from localStorage.
 * ERP cache, credentials, manual attendance data, reminder settings.
 */
export function factoryReset(): void {
  if (typeof window === "undefined") return;
  // Clear all ERP keys
  clearERPCache();
  // Clear manual calculator data
  localStorage.removeItem("attendanceData");
  // Clear reminder settings
  localStorage.removeItem("reminderSettings");
}
