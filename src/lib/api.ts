/**
 * ERP Backend API client.
 * All functions are async and throw on error.
 */

const BASE_URL = "https://erptestbackend-production.up.railway.app";

// ─── Error Types ────────────────────────────────────────────────

export class SessionExpiredError extends Error {
  constructor() {
    super("SESSION_EXPIRED");
    this.name = "SessionExpiredError";
  }
}

export class ApiError extends Error {
  status: number;
  details?: string;
  hint?: string;

  constructor(status: number, message: string, details?: string, hint?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
    this.hint = hint;
  }
}

// ─── Generic Caller ─────────────────────────────────────────────

async function apiCall<T>(path: string, body: object = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    if (res.status === 404) {
      throw new SessionExpiredError();
    }
    // ERP-side session expiry also returns 500 with specific message
    if (
      res.status === 500 &&
      typeof data.details === "string" &&
      data.details.includes("ERP session expired")
    ) {
      throw new SessionExpiredError();
    }
    throw new ApiError(
      res.status,
      data.error || "Unknown error",
      data.details,
      data.hint,
    );
  }

  return data as T;
}

// ─── Auth Types ─────────────────────────────────────────────────

export interface CaptchaResponse {
  success: true;
  sessionId: string;
  captchaImage: string;
  message: string;
}

export interface StudentInfo {
  name: string;
  crn: string;
  studentId: string;
  rollNo: string;
  program: string;
  programId: string;
  branch: string;
  branchId: string;
  section: string;
  semester: string;
  photo: string | null;
}

export interface LoginResponse {
  success: true;
  sessionId: string;
  student: StudentInfo;
  message: string;
}

// ─── Profile Types ──────────────────────────────────────────────

export interface Address {
  line1: string;
  line2: string;
  line3: string;
  pincode: string;
}

export interface BankDetails {
  accountNo: string;
  bankName: string;
  branch: string;
  ifsc: string;
}

export interface Documents {
  aadhar: string;
  casteCertificate: string;
  domicileCertificate: string;
  incomeCertificate: string;
  transferCertificate: string;
}

export interface EmergencyContact {
  contactName: string;
  contactNo: string;
  relationship: string;
}

export interface StudentProfile {
  id: string;
  crn: string;
  name: string;
  firstName: string;
  middleName: string;
  lastName: string;
  initials: string;
  fatherName: string;
  motherName: string;
  dob: string;
  gender: string;
  email: string;
  personalEmail: string;
  phone: string;
  phone2: string;
  fatherPhone: string;
  motherPhone: string;
  photo: string | null;
  signature: string | null;
  address: {
    current: Address;
    permanent: Address;
  };
  bank: BankDetails;
  documents: Documents;
  emergency: EmergencyContact;
  admission: string;
  bloodGroup: number;
}

export interface ProfileResponse {
  success: true;
  profile: StudentProfile;
}

// ─── Dashboard Types ────────────────────────────────────────────

export interface DashboardData {
  name: string;
  crn: string;
  studentId: string;
  rollNo: string;
  program: string;
  programId: string;
  branch: string;
  branchId: string;
  section: string;
  semester: number;
  photo: string | null;
}

export interface DashboardResponse {
  success: true;
  dashboard: DashboardData;
}

// ─── Attendance Types ───────────────────────────────────────────

export interface Attendance {
  totalClasses: number;
  classesAttended: number;
  classesAbsent: number;
  percentage: number;
}

export interface AttendanceResponse {
  success: true;
  attendance: Attendance;
}

export interface SubjectWithAttendance {
  id: string;
  name: string;
  code: string;
  totalClasses: number;
  classesAttended: number;
  classesAbsent: number;
  percentage: number;
}

export interface AllAttendanceResponse {
  success: true;
  overall: Attendance;
  subjects: SubjectWithAttendance[];
}

export interface SubjectAttendanceResponse {
  success: true;
  subjectId: string;
  attendance: Attendance;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
}

export interface SubjectsResponse {
  success: true;
  subjects: Subject[];
}

// ─── Timetable Types ────────────────────────────────────────────

export interface ClassPeriod {
  time: string;
  type: "class";
  subject: string;
  code: string | null;
  teacher: string | null;
  room: string | null;
  classType: string | null;
  isSuspended: boolean;
}

export interface LunchPeriod {
  time: string;
  type: "lunch";
}

export interface FreePeriod {
  time: string;
  type: "free";
}

export type Period = ClassPeriod | LunchPeriod | FreePeriod;

export interface DaySchedule {
  day: string;
  periods: Period[];
}

export interface TimetableResponse {
  success: true;
  timetable: DaySchedule[];
  isSuspended: boolean;
}

// ─── Today Types ────────────────────────────────────────────────

export interface TodayClassPeriod extends ClassPeriod {
  attendanceStatus: "present" | "absent" | "not-marked" | "suspended";
}

export type TodayPeriod = TodayClassPeriod | LunchPeriod | FreePeriod;

export interface TodaySummary {
  totalPeriods: number;
  present: number;
  absent: number;
  suspended: number;
  notMarked: number;
}

export interface TodayResponse {
  success: true;
  day: string;
  date: string;
  periods: TodayPeriod[];
  summary: TodaySummary;
  isSuspended?: boolean;
  message?: string;
}

// ─── Last Visit Types ───────────────────────────────────────────

export interface LastVisitResponse {
  success: true;
  lastVisit: {
    greeting: string | null;
    name: string | null;
    lastVisitTime: string | null;
  };
}

// ─── Auth Functions ─────────────────────────────────────────────

export const getCaptcha = (username: string, password: string) =>
  apiCall<CaptchaResponse>("/api/get-captcha", { username, password });

export const submitCaptcha = (sessionId: string, captcha: string) =>
  apiCall<LoginResponse>("/api/submit-captcha", { sessionId, captcha });

export const refreshCaptcha = (sessionId: string) =>
  apiCall<CaptchaResponse>("/api/refresh-captcha", { sessionId });

export const closeSession = (sessionId: string) =>
  apiCall<{ success: true; message: string }>("/api/close-session", { sessionId });

// ─── Data Functions ─────────────────────────────────────────────

export const getProfile = (sessionId: string) =>
  apiCall<ProfileResponse>("/api/profile", { sessionId });

export const getDashboard = (sessionId: string) =>
  apiCall<DashboardResponse>("/api/dashboard", { sessionId });

export const getAttendance = (sessionId: string, subject?: string, month?: string) =>
  apiCall<AttendanceResponse>("/api/attendance", { sessionId, subject, month });

export const getSubjects = (sessionId: string) =>
  apiCall<SubjectsResponse>("/api/subjects", { sessionId });

export const getSubjectAttendance = (sessionId: string, subjectId: string, month?: string) =>
  apiCall<SubjectAttendanceResponse>("/api/attendance/subject", { sessionId, subjectId, month });

export const getAllAttendance = (sessionId: string, month?: string) =>
  apiCall<AllAttendanceResponse>("/api/attendance/all", { sessionId, month });

export const getTimetable = (sessionId: string, date?: string) =>
  apiCall<TimetableResponse>("/api/timetable", { sessionId, date });

export const getToday = (sessionId: string) =>
  apiCall<TodayResponse>("/api/today", { sessionId });

export const getLastVisit = (sessionId: string) =>
  apiCall<LastVisitResponse>("/api/last-visit", { sessionId });
