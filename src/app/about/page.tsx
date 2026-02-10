import { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "About - Attendance Planner",
  description: "Learn about Attendance Planner, the free PWA that helps college students track and plan their attendance.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="mx-auto min-h-screen max-w-3xl px-4 pb-24 pt-4">
        <article className="prose prose-slate dark:prose-invert mx-auto mt-6">
          <h1 className="text-2xl font-bold">About Attendance Planner</h1>

          <h2>Our Mission</h2>
          <p>
            Attendance Planner was built with a simple mission: help college students never fall short of their attendance
            requirements. Every year, thousands of students are caught off guard by low attendance, leading to exam
            debarment and academic setbacks that could have been easily avoided with proper tracking.
          </p>

          <h2>What We Offer</h2>
          <p>
            Attendance Planner is a completely free, no-login-required progressive web app that works offline and can be
            installed on any device. Our tool provides:
          </p>
          <ul>
            <li><strong>Attendance Calculator</strong> — Instantly calculate your current attendance percentage and see where you stand.</li>
            <li><strong>Skip Checker</strong> — Find out if you can safely skip class today.</li>
            <li><strong>What-If Simulator</strong> — Simulate the impact of missing or attending multiple classes.</li>
            <li><strong>Weekly Planner</strong> — Plan your attendance distribution across remaining weeks.</li>
            <li><strong>Quick Updates</strong> — One-tap buttons to mark yourself present or absent each day.</li>
            <li><strong>Push Reminders</strong> — Get daily reminders so you never lose track.</li>
          </ul>

          <h2>Privacy First</h2>
          <p>
            All your data stays on your device. We use browser Local Storage exclusively — no accounts, no servers,
            no data collection. Your attendance information is your business alone.
          </p>

          <h2>How It Works</h2>
          <p>
            The app uses straightforward mathematics to calculate attendance metrics. Enter your total classes held,
            classes attended, and remaining scheduled classes. The algorithm calculates your current percentage, required
            future attendance, safe skip count, and risk level — all in real time.
          </p>

          <h2>Built for Students</h2>
          <p>
            Attendance Planner was designed by students who experienced the attendance struggle firsthand. Every feature
            was built to answer a real question students face daily: Can I skip today? How many more classes do I need?
            What happens if I miss this week?
          </p>

          <h2>Technology</h2>
          <p>
            The app is built with modern web technologies including Next.js, React, TypeScript, and Tailwind CSS. It is
            a Progressive Web App (PWA) that works offline, loads fast, and can be installed directly from the browser
            without any app store.
          </p>

          <h2>Support the Project</h2>
          <p>
            Attendance Planner is supported by non-intrusive advertisements. If you find the tool useful, simply using
            it helps us keep it free for everyone. You can also share it with classmates who might benefit from it.
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
