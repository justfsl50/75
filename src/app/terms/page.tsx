import { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms of Use - Attendance Planner",
  description: "Terms of use for the Attendance Planner PWA.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="mx-auto min-h-screen max-w-3xl px-4 pb-24 pt-4">
        <article className="prose prose-slate dark:prose-invert mx-auto mt-6">
          <h1 className="text-2xl font-bold">Terms of Use</h1>
          <p className="text-sm text-gray-500">Last updated: February 10, 2026</p>

          <h2>Acceptance of Terms</h2>
          <p>
            By accessing and using Attendance Planner (&quot;the app&quot;), you agree to be bound by these Terms of Use.
            If you do not agree with any part of these terms, please do not use the app.
          </p>

          <h2>Description of Service</h2>
          <p>
            Attendance Planner is a free web-based tool that helps college students calculate and plan their class
            attendance. The app provides attendance calculations, skip checking, what-if simulations, weekly planning,
            and reminder notifications.
          </p>

          <h2>No Warranty</h2>
          <p>
            The app is provided &quot;as is&quot; without warranty of any kind, express or implied. While we strive for
            accuracy in all calculations, we do not guarantee that the results will be error-free. Users should verify
            important attendance decisions with their institution.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            In no event shall Attendance Planner or its creators be liable for any direct, indirect, incidental,
            consequential, or special damages arising from the use of this app. This includes but is not limited to
            any academic consequences resulting from attendance decisions made based on the app&apos;s calculations.
          </p>

          <h2>User Responsibilities</h2>
          <ul>
            <li>You are responsible for entering accurate attendance data.</li>
            <li>You should verify the app&apos;s calculations against your official attendance records.</li>
            <li>Academic decisions should not be based solely on this tool.</li>
            <li>You are responsible for understanding your institution&apos;s specific attendance policies.</li>
          </ul>

          <h2>Intellectual Property</h2>
          <p>
            All content, design, and code of Attendance Planner are protected by intellectual property laws. You may
            not reproduce, distribute, or create derivative works without prior written permission.
          </p>

          <h2>Advertising</h2>
          <p>
            The app displays advertisements through Google AdSense. These ads help support the free operation of the
            tool. By using the app, you acknowledge the presence of advertisements and agree not to interfere with
            their display.
          </p>

          <h2>Modifications</h2>
          <p>
            We reserve the right to modify these terms at any time. Continued use of the app after changes constitutes
            acceptance of the revised terms.
          </p>

          <h2>Contact</h2>
          <p>
            For questions about these terms, please visit our <a href="/contact">contact page</a>.
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
