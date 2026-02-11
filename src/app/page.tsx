import { Metadata } from "next";
import { AttendancePlanner } from "@/components/AttendancePlanner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Attendance Planner - College Attendance Calculator & Tracker",
  description:
    "Free attendance calculator for college students. Track your attendance percentage, plan classes to attend, find out if you can skip today, and maintain 75% attendance easily.",
  keywords: [
    "attendance calculator",
    "college attendance",
    "75 percent attendance",
    "can i skip class",
    "attendance tracker",
    "attendance planner",
    "class attendance percentage",
  ],
  openGraph: {
    title: "Attendance Planner - College Attendance Calculator",
    description: "Track & plan your college attendance. Know if you can skip today.",
    type: "website",
    url: "https://attendance75calc.vercel.app",
  },
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="mx-auto min-h-screen max-w-lg px-4 pb-24 pt-4">
        <AttendancePlanner />
      </main>
      <Footer />
    </>
  );
}
