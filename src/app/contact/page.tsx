import { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Contact Us - Attendance Planner",
  description: "Get in touch with the Attendance Planner team for questions, feedback, or support.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="mx-auto min-h-screen max-w-3xl px-4 pb-24 pt-4">
        <article className="prose prose-slate dark:prose-invert mx-auto mt-6">
          <h1 className="text-2xl font-bold">Contact Us</h1>

          <p>
            We would love to hear from you. Whether you have a question about how the tool works, a suggestion for
            improvement, or found a bug, feel free to reach out.
          </p>

          <h2>How to Reach Us</h2>
          <p>
            You can contact us through the following methods:
          </p>
          <ul>
            <li><strong>Email:</strong> support@attendanceplanner.app</li>
            <li><strong>Feedback:</strong> Use the feedback form below to send us a message directly.</li>
          </ul>

          <h2>Frequently Asked Support Questions</h2>

          <h3>My data disappeared after clearing browser data</h3>
          <p>
            Attendance Planner stores all data in your browser&apos;s Local Storage. Clearing browser data, cookies, or
            cache will remove your saved attendance information. Unfortunately, this data cannot be recovered. We
            recommend noting down your attendance numbers periodically.
          </p>

          <h3>The calculations seem wrong</h3>
          <p>
            Please double-check that your input values are correct. Total classes should be the number of classes held
            so far, not the total for the semester. Attended classes cannot exceed total classes. If you believe there
            is a genuine calculation error, please email us with your exact input values and the expected result.
          </p>

          <h3>Notifications are not working</h3>
          <p>
            Push notifications require your browser&apos;s permission. Check that you have allowed notifications for
            this site in your browser settings. On mobile, you may need to install the app (Add to Home Screen) for
            notifications to work reliably.
          </p>

          <h3>I want to suggest a feature</h3>
          <p>
            We welcome feature suggestions. Email us with a description of what you would like to see, and we will
            consider it for future updates.
          </p>

          <h2>Response Time</h2>
          <p>
            We aim to respond to all inquiries within 48 hours. For urgent matters, please indicate so in your email
            subject line.
          </p>

          <h2>Legal Inquiries</h2>
          <p>
            For legal matters including DMCA notices, data requests, or advertising inquiries, please email
            legal@attendanceplanner.app.
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
