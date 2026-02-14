"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { closeSession, SessionExpiredError, type StudentInfo } from "@/lib/api";
import {
  clearERPCache,
  clearCredentials,
  storeCredentials,
  storeSession,
  getStoredCredentials,
  getStoredSession,
  factoryReset,
} from "@/lib/erpCache";

interface AuthState {
  sessionId: string | null;
  student: StudentInfo | null;
  isAuthenticated: boolean;
  login: (sessionId: string, student: StudentInfo, username?: string, password?: string) => void;
  logout: () => void;
  /** Re-authenticate with a new session (used after CAPTCHA-only re-login). */
  reAuthenticate: (sessionId: string, student: StudentInfo) => void;
  /** Get stored credentials for quick re-login (reads from localStorage each call). */
  getStoredCreds: () => { username: string; password: string } | null;
  /** Factory reset — clear everything. */
  resetAll: () => void;
  /** Call this from any data-fetching hook to handle session expiry */
  handleApiError: (err: unknown) => boolean;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const router = useRouter();

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = getStoredSession();
    if (stored?.sessionId && stored?.student) {
      setSessionId(stored.sessionId);
      setStudent(stored.student);
    }
  }, []);

  const login = useCallback((sid: string, stu: StudentInfo, username?: string, password?: string) => {
    setSessionId(sid);
    setStudent(stu);
    storeSession(sid, stu);
    if (username && password) {
      storeCredentials(username, password);
    }
  }, []);

  const reAuthenticate = useCallback((sid: string, stu: StudentInfo) => {
    setSessionId(sid);
    setStudent(stu);
    storeSession(sid, stu);
  }, []);

  const logout = useCallback(async () => {
    const sid = sessionId;
    setSessionId(null);
    setStudent(null);
    // Clear ERP cache + credentials
    clearERPCache();
    clearCredentials();
    if (sid) {
      try {
        await closeSession(sid);
      } catch {
        // ignore — session may already be gone
      }
    }
    router.push("/");
  }, [sessionId, router]);

  const resetAll = useCallback(() => {
    const sid = sessionId;
    setSessionId(null);
    setStudent(null);
    factoryReset();
    if (sid) {
      closeSession(sid).catch(() => {});
    }
    router.push("/");
  }, [sessionId, router]);

  const handleApiError = useCallback(
    (err: unknown): boolean => {
      if (err instanceof SessionExpiredError) {
        // Don't clear session/student — keep cached data visible
        // The ERPDataContext will set sessionExpired flag
        return true;
      }
      return false;
    },
    [],
  );

  const getStoredCreds = useCallback(() => getStoredCredentials(), []);

  const value = useMemo<AuthState>(
    () => ({
      sessionId,
      student,
      isAuthenticated: sessionId !== null && student !== null,
      login,
      logout,
      reAuthenticate,
      getStoredCreds,
      resetAll,
      handleApiError,
    }),
    [sessionId, student, login, logout, reAuthenticate, getStoredCreds, resetAll, handleApiError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
