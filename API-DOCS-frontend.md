# ERP Backend API Documentation

> Complete API reference for the ERP attendance backend.
> Use this as the contract when building the student frontend (React, Next.js, etc.)

---

## Base URL

```
https://erptestbackend-production.up.railway.app
```

## General Notes

| Property | Value |
|---|---|
| **Protocol** | HTTPS |
| **Content-Type** | `application/json` |
| **CORS** | Enabled for all origins (`*`) |
| **Auth** | Session-based via `sessionId` token |
| **Session TTL** | ~25 minutes (auto-cleanup) |
| **All data endpoints** | Use `POST` method |

Every response includes a `success: boolean` field. On error, responses include `error` and `details` strings.

---

## Table of Contents

1. [Authentication Flow](#1-authentication-flow)
2. [Auth Endpoints](#2-auth-endpoints)
   - 2.1 [Get CAPTCHA](#21-get-captcha)
   - 2.2 [Submit CAPTCHA](#22-submit-captcha)
   - 2.3 [Refresh CAPTCHA](#23-refresh-captcha)
   - 2.4 [Close Session](#24-close-session)
3. [Data Endpoints](#3-data-endpoints)
   - 3.1 [Profile](#31-profile)
   - 3.2 [Dashboard](#32-dashboard)
   - 3.3 [Overall Attendance](#33-overall-attendance)
   - 3.4 [Subjects List](#34-subjects-list)
   - 3.5 [Subject Attendance](#35-subject-attendance)
   - 3.6 [All Subjects Attendance](#36-all-subjects-attendance)
   - 3.7 [Weekly Timetable](#37-weekly-timetable)
   - 3.8 [Today's Timetable](#38-todays-timetable)
   - 3.9 [Last Visit](#39-last-visit)
4. [Utility Endpoints](#4-utility-endpoints)
5. [Error Handling](#5-error-handling)
6. [TypeScript Interfaces](#6-typescript-interfaces)
7. [Frontend Integration Guide](#7-frontend-integration-guide)

---

## 1. Authentication Flow

The backend uses a 2-step human-in-the-loop CAPTCHA flow. The browser session is managed server-side — the frontend only needs to store a `sessionId` string.

```
Step 1: POST /api/get-captcha     → Get CAPTCHA image + sessionId
Step 2: POST /api/submit-captcha  → Submit solved CAPTCHA → Get student info + authenticated sessionId
Step 3: Use sessionId for all data endpoints
```

**Flow diagram:**

```
Frontend                          Backend                         ERP Server
   |                                |                                |
   |-- POST /api/get-captcha ------>|                                |
   |   { username, password }       |-- Launch Puppeteer ----------->|
   |                                |<-- CAPTCHA page ---------------|
   |<-- { sessionId, captchaImage } |                                |
   |                                |                                |
   |   [User solves CAPTCHA]        |                                |
   |                                |                                |
   |-- POST /api/submit-captcha -->|                                |
   |   { sessionId, captcha }       |-- Fill form, login ----------->|
   |                                |<-- Cookies + dashboard --------|
   |                                |-- Close browser                |
   |<-- { sessionId, student }      |                                |
   |                                |                                |
   |-- POST /api/profile --------->|                                |
   |   { sessionId }                |-- HTTP with cookies ---------->|
   |<-- { profile }                 |<-- JSON ----------------------|
   |                                |                                |
   |   [Session expires ~25 min]    |                                |
```

**Important:**
- After `submit-captcha` succeeds, the `sessionId` stays the same — use it for all data calls
- The browser is closed after login — only cookies are stored (lightweight)
- Sessions auto-expire after ~25 minutes of inactivity
- Each data endpoint call refreshes the session timer
- If a CAPTCHA attempt fails, call `/api/refresh-captcha` to get a new CAPTCHA (same session)

---

## 2. Auth Endpoints

### 2.1 Get CAPTCHA

Launches a browser, navigates to the ERP login page, and returns the CAPTCHA image for the user to solve.

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/api/get-captcha` |
| **Auth** | None |

**Request Body:**

```json
{
  "username": "2023bcs084",
  "password": "your_password"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `username` | string | Yes | Student roll number / CRN |
| `password` | string | Yes | ERP password |

**Success Response (200):**

```json
{
  "success": true,
  "sessionId": "bccb76ca-2ac5-4af9-906a-ab79375fd516",
  "captchaImage": "data:image/png;base64,iVBORw0KGgo...",
  "message": "Solve the CAPTCHA and send it to /api/submit-captcha"
}
```

| Field | Type | Description |
|---|---|---|
| `sessionId` | string | UUID — save this, you'll need it for all subsequent calls |
| `captchaImage` | string | Base64 data URL — display directly in an `<img>` tag |

**Frontend usage:**

```jsx
<img src={response.captchaImage} alt="CAPTCHA" />
```

**Error Response (500):**

```json
{
  "error": "Failed to load CAPTCHA",
  "details": "Navigation timeout of 60000 ms exceeded"
}
```

---

### 2.2 Submit CAPTCHA

Submits the human-solved CAPTCHA, logs into the ERP, and returns student info. After this call succeeds, the `sessionId` is authenticated and can be used for all data endpoints.

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/api/submit-captcha` |
| **Auth** | `sessionId` from get-captcha |

**Request Body:**

```json
{
  "sessionId": "bccb76ca-2ac5-4af9-906a-ab79375fd516",
  "captcha": "a3f21b"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `sessionId` | string | Yes | From `/api/get-captcha` response |
| `captcha` | string | Yes | The CAPTCHA text the user typed |

**Success Response (200):**

```json
{
  "success": true,
  "sessionId": "bccb76ca-2ac5-4af9-906a-ab79375fd516",
  "student": {
    "name": "FAISAL ANSARI",
    "crn": "2023BCS084",
    "studentId": "10256",
    "rollNo": "2307190100042",
    "program": "B.Tech",
    "programId": "1",
    "branch": "Computer Science and Engineering",
    "branchId": "3",
    "section": "A",
    "semester": "6",
    "photo": "https://erp.axiscolleges.net/clientdata/usersdata/students/.../photo.jpg"
  },
  "message": "Login successful! Use sessionId to call /api/profile, /api/attendance, /api/subjects, /api/timetable, etc."
}
```

**Failure Response (401) — Wrong CAPTCHA or credentials:**

```json
{
  "success": false,
  "error": "Login failed",
  "details": "Invalid Captcha !",
  "hint": "Call /api/refresh-captcha with the same sessionId to try again"
}
```

> On 401, the session is **still alive**. Call `/api/refresh-captcha` to get a new CAPTCHA image and try again without starting over.

---

### 2.3 Refresh CAPTCHA

Reloads the login page and returns a fresh CAPTCHA. Use this when the previous CAPTCHA attempt failed.

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/api/refresh-captcha` |
| **Auth** | `sessionId` (pre-login phase) |

**Request Body:**

```json
{
  "sessionId": "bccb76ca-2ac5-4af9-906a-ab79375fd516"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "sessionId": "bccb76ca-2ac5-4af9-906a-ab79375fd516",
  "captchaImage": "data:image/png;base64,iVBORw0KGgo...",
  "message": "New CAPTCHA ready. Solve it and send to /api/submit-captcha"
}
```

---

### 2.4 Close Session

Manually closes a session and frees server resources. Optional — sessions auto-expire after ~25 minutes.

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/api/close-session` |

**Request Body:**

```json
{
  "sessionId": "bccb76ca-2ac5-4af9-906a-ab79375fd516"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Session closed"
}
```

---

## 3. Data Endpoints

All data endpoints require an **authenticated `sessionId`** (from a successful `submit-captcha` call). All use `POST` method with `sessionId` in the request body.

### Common Error Responses

**Session not found (404):**

```json
{
  "error": "Session not found or expired",
  "hint": "Call /api/get-captcha to start a new session"
}
```

**Session not authenticated (400):**

```json
{
  "error": "Session not yet authenticated",
  "hint": "Call /api/submit-captcha first"
}
```

**ERP session expired (500):**

```json
{
  "error": "Failed to fetch ...",
  "details": "ERP session expired. Please login again."
}
```

---

### 3.1 Profile

Returns the complete student profile including personal info, address, bank details, and documents.

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/api/profile` |

**Request Body:**

```json
{
  "sessionId": "bccb76ca-2ac5-4af9-906a-ab79375fd516"
}
```

**Response (200):**

```json
{
  "success": true,
  "profile": {
    "id": "10256",
    "crn": "2023BCS084",
    "name": "Mr. FAISAL Ansari",
    "firstName": "FAISAL",
    "middleName": "",
    "lastName": "Ansari",
    "initials": "Mr.",
    "fatherName": "HAIDAR ALI ANSARI",
    "motherName": "HAJARA KHATUN",
    "dob": "18-Oct-2005",
    "gender": "M",
    "email": "2023BCS084@AXISCOLLEGES.IN",
    "personalEmail": "faisalansari7278@gmail.com",
    "phone": "8887505692",
    "phone2": "7881165985",
    "fatherPhone": "7881165985",
    "motherPhone": "9838814247",
    "photo": "https://erp.axiscolleges.net/clientdata/.../photo.jpg",
    "signature": "https://erp.axiscolleges.net/clientdata/.../signature.jpg",
    "address": {
      "current": {
        "line1": "DHANRAJ CHHAPAR",
        "line2": "BHINGARI BAZAR",
        "line3": "BHATPAR RANI",
        "pincode": "274702"
      },
      "permanent": {
        "line1": "DHANRAJ CHHAPAR",
        "line2": "BHINGARI BAZAR",
        "line3": "BHATPAR RANI",
        "pincode": "274702"
      }
    },
    "bank": {
      "accountNo": "056210106934",
      "bankName": "INDIA POST PAYMENT BANK",
      "branch": "CORPORATE OFFICE",
      "ifsc": "IPOS0000001"
    },
    "documents": {
      "aadhar": "810943709182",
      "casteCertificate": "605233005642",
      "domicileCertificate": "605232007233",
      "incomeCertificate": "605231009005",
      "transferCertificate": "858"
    },
    "emergency": {
      "contactName": "HAJARA KHATUN",
      "contactNo": "9838814247",
      "relationship": "MOTHER"
    },
    "admission": "Direct",
    "bloodGroup": 1
  }
}
```

---

### 3.2 Dashboard

Returns the student's dashboard summary — lighter than the full profile.

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/api/dashboard` |

**Request Body:**

```json
{
  "sessionId": "..."
}
```

**Response (200):**

```json
{
  "success": true,
  "dashboard": {
    "name": "FAISAL ANSARI",
    "crn": "2023BCS084",
    "studentId": "10256",
    "rollNo": "2307190100042",
    "program": "B.Tech",
    "programId": "1",
    "branch": "Computer Science and Engineering",
    "branchId": "3",
    "section": "A",
    "semester": 6,
    "photo": "https://erp.axiscolleges.net/clientdata/.../photo.jpg"
  }
}
```

---

### 3.3 Overall Attendance

Returns attendance across all subjects, or optionally filtered by subject and/or month.

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/api/attendance` |

**Request Body:**

```json
{
  "sessionId": "...",
  "subject": "0",
  "month": "0"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `sessionId` | string | Yes | Authenticated session ID |
| `subject` | string | No | `"0"` for all subjects (default), or a specific subject ID |
| `month` | string | No | `"0"` for all months (default), or `"1"`-`"12"` for a specific month |

**Response (200):**

```json
{
  "success": true,
  "attendance": {
    "totalClasses": 104,
    "classesAttended": 104,
    "classesAbsent": 0,
    "percentage": 100
  }
}
```

---

### 3.4 Subjects List

Returns all enrolled subjects with their IDs. Use these IDs for subject-specific attendance queries.

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/api/subjects` |

**Request Body:**

```json
{
  "sessionId": "..."
}
```

**Response (200):**

```json
{
  "success": true,
  "subjects": [
    { "id": "2436", "name": "APTITUDE", "code": "APT601" },
    { "id": "2069", "name": "COMPILER DESIGN", "code": "BCS602" },
    { "id": "2071", "name": "COMPILER DESIGN LAB", "code": "BCS652" },
    { "id": "2065", "name": "COMPUTER NETWORKS", "code": "BCS603" },
    { "id": "2066", "name": "COMPUTER NETWORKS LAB", "code": "BCS653" },
    { "id": "2064", "name": "DATA COMPRESSION", "code": "BCS-064" },
    { "id": "2438", "name": "DEEP LEARNING TRAINING", "code": "TTDL601" },
    { "id": "2060", "name": "INDIAN TRADITION, CULTURE AND SOCIETY", "code": "BNC602" },
    { "id": "2451", "name": "ORACLE TRAINING", "code": "TTORA601" },
    { "id": "2433", "name": "PDP + VERBAL ABILITY", "code": "ET601" },
    { "id": "2067", "name": "SOFTWARE ENGINEERING", "code": "BCS601" },
    { "id": "2068", "name": "SOFTWARE ENGINEERING LAB", "code": "BCS651" },
    { "id": "2091", "name": "SOFTWARE PROJECT MANAGEMENT", "code": "BOE 068" },
    { "id": "2441", "name": "TECHNICAL TRAINING", "code": "TT601" }
  ]
}
```

---

### 3.5 Subject Attendance

Returns attendance for a single specific subject.

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/api/attendance/subject` |

**Request Body:**

```json
{
  "sessionId": "...",
  "subjectId": "2069",
  "month": "0"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `sessionId` | string | Yes | Authenticated session ID |
| `subjectId` | string | Yes | Subject ID from `/api/subjects` |
| `month` | string | No | `"0"` for all months (default), or `"1"`-`"12"` |

**Response (200):**

```json
{
  "success": true,
  "subjectId": "2069",
  "attendance": {
    "totalClasses": 13,
    "classesAttended": 13,
    "classesAbsent": 0,
    "percentage": 100
  }
}
```

---

### 3.6 All Subjects Attendance

Returns attendance for every enrolled subject in a single call, plus the overall attendance. This is the most useful endpoint for an attendance dashboard.

**Note:** This endpoint takes a few seconds as it fetches attendance for each subject sequentially.

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/api/attendance/all` |

**Request Body:**

```json
{
  "sessionId": "...",
  "month": "0"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `sessionId` | string | Yes | Authenticated session ID |
| `month` | string | No | `"0"` for all months (default), or `"1"`-`"12"` |

**Response (200):**

```json
{
  "success": true,
  "overall": {
    "totalClasses": 104,
    "classesAttended": 104,
    "classesAbsent": 0,
    "percentage": 100
  },
  "subjects": [
    {
      "id": "2436",
      "name": "APTITUDE",
      "code": "APT601",
      "totalClasses": 4,
      "classesAttended": 4,
      "classesAbsent": 0,
      "percentage": 100
    },
    {
      "id": "2069",
      "name": "COMPILER DESIGN",
      "code": "BCS602",
      "totalClasses": 13,
      "classesAttended": 13,
      "classesAbsent": 0,
      "percentage": 100
    }
  ]
}
```

> The `subjects` array contains one entry per enrolled subject, each with `id`, `name`, `code`, and attendance fields.

---

### 3.7 Weekly Timetable

Returns the full weekly timetable (Monday-Friday) with class details.

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/api/timetable` |

**Request Body:**

```json
{
  "sessionId": "...",
  "date": "14-Feb-2026 9:00:00 AM"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `sessionId` | string | Yes | Authenticated session ID |
| `date` | string | No | ERP date format: `d-MMM-yyyy h:mm:ss AM/PM`. Defaults to now. |

**Response (200):**

```json
{
  "success": true,
  "timetable": [
    {
      "day": "Monday",
      "periods": [
        {
          "time": "09:00 AM - 09:50 AM",
          "type": "class",
          "subject": "Software Engineering",
          "code": "BCS601",
          "teacher": "Prof. Name",
          "room": null,
          "classType": "LECTURE",
          "isSuspended": false
        },
        {
          "time": "12:30 PM - 01:20 PM",
          "type": "lunch"
        },
        {
          "time": "04:00 PM - 04:50 PM",
          "type": "free"
        }
      ]
    },
    {
      "day": "Tuesday",
      "periods": [...]
    }
  ],
  "isSuspended": false
}
```

**Period types:**

| `type` | Description | Fields present |
|---|---|---|
| `"class"` | A scheduled class | `subject`, `code`, `teacher`, `room`, `classType`, `isSuspended` |
| `"lunch"` | Lunch break | `time` only |
| `"free"` | No class scheduled | `time` only |

**Time slots:**

| Period | Time |
|---|---|
| 1 | 09:00 AM - 09:50 AM |
| 2 | 09:50 AM - 10:40 AM |
| 3 | 10:50 AM - 11:40 AM |
| 4 | 11:40 AM - 12:30 PM |
| LUNCH | 12:30 PM - 01:20 PM |
| 5 | 01:20 PM - 02:10 PM |
| 6 | 02:10 PM - 03:00 PM |
| 7 | 03:10 PM - 04:00 PM |
| 8 | 04:00 PM - 04:50 PM |

---

### 3.8 Today's Timetable

Returns only today's classes with per-period attendance status. Best for a "today" view or notification screen.

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/api/today` |

**Request Body:**

```json
{
  "sessionId": "..."
}
```

**Response (200) — Weekday:**

```json
{
  "success": true,
  "day": "Friday",
  "date": "14-Feb-2026",
  "periods": [
    {
      "time": "09:00 AM - 09:50 AM",
      "type": "class",
      "subject": "Software Engineering",
      "code": "BCS601",
      "teacher": "Prof. Name",
      "room": null,
      "classType": "LECTURE",
      "isSuspended": false,
      "attendanceStatus": "present"
    },
    {
      "time": "12:30 PM - 01:20 PM",
      "type": "lunch"
    },
    {
      "time": "03:10 PM - 04:00 PM",
      "type": "class",
      "subject": "Computer Networks",
      "code": "BCS603",
      "teacher": null,
      "room": null,
      "classType": "LECTURE",
      "isSuspended": false,
      "attendanceStatus": "not-marked"
    }
  ],
  "summary": {
    "totalPeriods": 8,
    "present": 5,
    "absent": 0,
    "suspended": 0,
    "notMarked": 3
  },
  "isSuspended": false
}
```

**Response (200) — Weekend:**

```json
{
  "success": true,
  "day": "Saturday",
  "date": "15-Feb-2026",
  "periods": [],
  "summary": { "totalPeriods": 0, "present": 0, "absent": 0, "notMarked": 0 },
  "message": "No classes on weekends"
}
```

**`attendanceStatus` values:**

| Value | Meaning |
|---|---|
| `"present"` | Attendance marked as present |
| `"absent"` | Attendance marked as absent |
| `"not-marked"` | Class exists but attendance not yet recorded |
| `"suspended"` | Class is suspended for the day |

---

### 3.9 Last Visit

Returns the last login timestamp and greeting.

| | |
|---|---|
| **Method** | `POST` |
| **Path** | `/api/last-visit` |

**Request Body:**

```json
{
  "sessionId": "..."
}
```

**Response (200):**

```json
{
  "success": true,
  "lastVisit": {
    "greeting": "Good Morning",
    "name": "FAISAL ANSARI",
    "lastVisitTime": "14-Feb-2026 08:32 AM"
  }
}
```

---

## 4. Utility Endpoints

### Health Check

```
GET /health
```

```json
{
  "status": "healthy",
  "uptime": 245.123,
  "activeSessions": 1
}
```

### Test

```
GET /api/test
```

```json
{
  "status": "ok",
  "message": "Backend deployed successfully!",
  "timestamp": "2026-02-14T09:30:00.000Z"
}
```

---

## 5. Error Handling

All errors follow this shape:

```json
{
  "error": "Short error description",
  "details": "Detailed error message from the server",
  "hint": "Optional suggestion for the frontend"
}
```

**HTTP status codes used:**

| Code | Meaning | When |
|---|---|---|
| `200` | Success | Request completed normally |
| `400` | Bad Request | Missing required fields (`sessionId`, `captcha`, `subjectId`) |
| `401` | Unauthorized | Wrong CAPTCHA or credentials (session still alive for retry) |
| `404` | Not Found | Session expired or doesn't exist |
| `500` | Server Error | ERP unreachable, session expired on ERP side, parsing error |

**Frontend error handling pattern:**

```javascript
try {
  const res = await fetch(`${BASE_URL}/api/attendance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  });
  const data = await res.json();

  if (!res.ok) {
    if (res.status === 404) {
      // Session expired — redirect to login
      redirectToLogin();
    } else {
      showError(data.details || data.error);
    }
    return;
  }

  // Use data.attendance
} catch (err) {
  showError('Network error');
}
```

---

## 6. TypeScript Interfaces

Copy-paste these into your frontend project.

```typescript
// ============ API Response Wrapper ============

interface ApiSuccess<T> {
  success: true;
  [key: string]: T | boolean | string;
}

interface ApiError {
  success?: false;
  error: string;
  details?: string;
  hint?: string;
}

// ============ Auth Types ============

interface CaptchaResponse {
  success: true;
  sessionId: string;
  captchaImage: string; // data:image/png;base64,...
  message: string;
}

interface LoginResponse {
  success: true;
  sessionId: string;
  student: StudentInfo;
  message: string;
}

interface StudentInfo {
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

interface LoginError {
  success: false;
  error: string;
  details: string;
  hint: string;
}

// ============ Profile ============

interface ProfileResponse {
  success: true;
  profile: StudentProfile;
}

interface StudentProfile {
  id: string;
  crn: string;
  name: string;
  firstName: string;
  middleName: string;
  lastName: string;
  initials: string;
  fatherName: string;
  motherName: string;
  dob: string;          // "18-Oct-2005"
  gender: string;       // "M" or "F"
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

interface Address {
  line1: string;
  line2: string;
  line3: string;
  pincode: string;
}

interface BankDetails {
  accountNo: string;
  bankName: string;
  branch: string;
  ifsc: string;
}

interface Documents {
  aadhar: string;
  casteCertificate: string;
  domicileCertificate: string;
  incomeCertificate: string;
  transferCertificate: string;
}

interface EmergencyContact {
  contactName: string;
  contactNo: string;
  relationship: string;
}

// ============ Dashboard ============

interface DashboardResponse {
  success: true;
  dashboard: {
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
  };
}

// ============ Attendance ============

interface Attendance {
  totalClasses: number;
  classesAttended: number;
  classesAbsent: number;
  percentage: number;
}

interface AttendanceResponse {
  success: true;
  attendance: Attendance;
}

interface SubjectAttendanceResponse {
  success: true;
  subjectId: string;
  attendance: Attendance;
}

interface AllAttendanceResponse {
  success: true;
  overall: Attendance;
  subjects: SubjectWithAttendance[];
}

interface SubjectWithAttendance {
  id: string;
  name: string;
  code: string;
  totalClasses: number;
  classesAttended: number;
  classesAbsent: number;
  percentage: number;
}

// ============ Subjects ============

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface SubjectsResponse {
  success: true;
  subjects: Subject[];
}

// ============ Timetable ============

interface TimetableResponse {
  success: true;
  timetable: DaySchedule[];
  isSuspended: boolean;
}

interface DaySchedule {
  day: string;
  periods: Period[];
}

type Period = ClassPeriod | LunchPeriod | FreePeriod;

interface ClassPeriod {
  time: string;
  type: 'class';
  subject: string;
  code: string | null;
  teacher: string | null;
  room: string | null;
  classType: string | null;   // "LECTURE" | "LAB"
  isSuspended: boolean;
}

interface LunchPeriod {
  time: string;
  type: 'lunch';
}

interface FreePeriod {
  time: string;
  type: 'free';
}

// ============ Today ============

interface TodayResponse {
  success: true;
  day: string;          // "Monday" - "Friday" or "Saturday" / "Sunday"
  date: string;         // "14-Feb-2026"
  periods: TodayPeriod[];
  summary: TodaySummary;
  isSuspended?: boolean;
  message?: string;     // "No classes on weekends"
}

type TodayPeriod = TodayClassPeriod | LunchPeriod | FreePeriod;

interface TodayClassPeriod extends ClassPeriod {
  attendanceStatus: 'present' | 'absent' | 'not-marked' | 'suspended';
}

interface TodaySummary {
  totalPeriods: number;
  present: number;
  absent: number;
  suspended: number;
  notMarked: number;
}

// ============ Last Visit ============

interface LastVisitResponse {
  success: true;
  lastVisit: {
    greeting: string | null;    // "Good Morning"
    name: string | null;        // "FAISAL ANSARI"
    lastVisitTime: string | null; // "14-Feb-2026 08:32 AM"
  };
}

// ============ Utility ============

interface HealthResponse {
  status: string;
  uptime: number;
  activeSessions: number;
}
```

---

## 7. Frontend Integration Guide

### Recommended API Wrapper

Create a single API service file:

```typescript
const BASE_URL = 'https://erptestbackend-production.up.railway.app';

async function apiCall<T>(path: string, body: object = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    if (res.status === 404) {
      // Session expired
      throw new Error('SESSION_EXPIRED');
    }
    throw new Error(data.details || data.error || 'Unknown error');
  }

  return data as T;
}

// Auth
export const getCaptcha = (username: string, password: string) =>
  apiCall<CaptchaResponse>('/api/get-captcha', { username, password });

export const submitCaptcha = (sessionId: string, captcha: string) =>
  apiCall<LoginResponse>('/api/submit-captcha', { sessionId, captcha });

export const refreshCaptcha = (sessionId: string) =>
  apiCall<CaptchaResponse>('/api/refresh-captcha', { sessionId });

export const closeSession = (sessionId: string) =>
  apiCall('/api/close-session', { sessionId });

// Data (all need sessionId)
export const getProfile = (sessionId: string) =>
  apiCall<ProfileResponse>('/api/profile', { sessionId });

export const getDashboard = (sessionId: string) =>
  apiCall<DashboardResponse>('/api/dashboard', { sessionId });

export const getAttendance = (sessionId: string, subject?: string, month?: string) =>
  apiCall<AttendanceResponse>('/api/attendance', { sessionId, subject, month });

export const getSubjects = (sessionId: string) =>
  apiCall<SubjectsResponse>('/api/subjects', { sessionId });

export const getSubjectAttendance = (sessionId: string, subjectId: string, month?: string) =>
  apiCall<SubjectAttendanceResponse>('/api/attendance/subject', { sessionId, subjectId, month });

export const getAllAttendance = (sessionId: string, month?: string) =>
  apiCall<AllAttendanceResponse>('/api/attendance/all', { sessionId, month });

export const getTimetable = (sessionId: string, date?: string) =>
  apiCall<TimetableResponse>('/api/timetable', { sessionId, date });

export const getToday = (sessionId: string) =>
  apiCall<TodayResponse>('/api/today', { sessionId });

export const getLastVisit = (sessionId: string) =>
  apiCall<LastVisitResponse>('/api/last-visit', { sessionId });
```

### Session Management Tips

1. **Store `sessionId` in React state or context** — not localStorage (it expires in ~25 min anyway)
2. **Store `student` info from `submit-captcha`** response in context — use it for the header/profile display
3. **Handle `SESSION_EXPIRED` errors globally** — redirect to login page
4. **Call `/api/close-session`** on logout
5. **Don't call multiple endpoints simultaneously** right after login — the ERP may rate-limit. Use small delays or call them sequentially

### Suggested Page-to-API Mapping

| Frontend Page | API Calls |
|---|---|
| **Login** | `getCaptcha` → `submitCaptcha` (→ `refreshCaptcha` on failure) |
| **Dashboard** | `getDashboard` + `getAttendance` + `getToday` |
| **Attendance** | `getAllAttendance` |
| **Timetable** | `getTimetable` |
| **Profile** | `getProfile` |
| **Today** | `getToday` |

---

## Endpoint Summary

| # | Method | Path | Body | Description |
|---|---|---|---|---|
| 1 | `POST` | `/api/get-captcha` | `{ username, password }` | Get CAPTCHA image |
| 2 | `POST` | `/api/submit-captcha` | `{ sessionId, captcha }` | Login with CAPTCHA |
| 3 | `POST` | `/api/refresh-captcha` | `{ sessionId }` | Get new CAPTCHA |
| 4 | `POST` | `/api/close-session` | `{ sessionId }` | Close session |
| 5 | `POST` | `/api/profile` | `{ sessionId }` | Full student profile |
| 6 | `POST` | `/api/dashboard` | `{ sessionId }` | Dashboard summary |
| 7 | `POST` | `/api/attendance` | `{ sessionId, subject?, month? }` | Overall attendance |
| 8 | `POST` | `/api/subjects` | `{ sessionId }` | Enrolled subjects list |
| 9 | `POST` | `/api/attendance/subject` | `{ sessionId, subjectId, month? }` | Single subject attendance |
| 10 | `POST` | `/api/attendance/all` | `{ sessionId, month? }` | All subjects attendance |
| 11 | `POST` | `/api/timetable` | `{ sessionId, date? }` | Weekly timetable |
| 12 | `POST` | `/api/today` | `{ sessionId }` | Today's classes + attendance |
| 13 | `POST` | `/api/last-visit` | `{ sessionId }` | Last login info |
| 14 | `GET` | `/health` | — | Health check |
| 15 | `GET` | `/api/test` | — | Server test |
