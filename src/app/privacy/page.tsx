import { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy - Attendance75",
  description: "Privacy policy for the Attendance75 PWA. Learn how we handle your data.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="mx-auto min-h-screen max-w-3xl px-4 pb-24 pt-4">
        <article className="prose prose-slate dark:prose-invert mx-auto mt-6">
          <h1 className="text-2xl font-bold">Privacy Policy</h1>
          <p className="text-sm text-gray-500">Last updated: February 10, 2026</p>

          <h2>Introduction</h2>
          <p>
            Attendance75 (&quot;we,&quot; &quot;our,&quot; or &quot;the app&quot;) is committed to protecting your privacy. This Privacy Policy
            explains how our web application handles information when you use our attendance planning tool.
          </p>

          <h2>Information We Do Not Collect</h2>
          <p>
            We do not collect, store, or transmit any personal information to external servers. Our app operates entirely
            within your web browser. Specifically:
          </p>
          <ul>
            <li>We do not collect your name, email address, or any personal identifiers.</li>
            <li>We do not require account creation or login.</li>
            <li>We do not track your location.</li>
            <li>We do not access your contacts, camera, or other device features.</li>
          </ul>

          <h2>Local Storage</h2>
          <p>
            The app uses your browser&apos;s Local Storage to save your attendance data (classes attended, total classes,
            remaining classes, and target percentage) directly on your device. This data never leaves your device and is
            not accessible to us or any third party. You can clear this data at any time by clearing your browser data.
          </p>

          <h2>Push Notifications</h2>
          <p>
            If you enable push notifications, the app uses the browser&apos;s built-in notification system to send you
            attendance reminders. Notification preferences are stored locally on your device. We do not operate a
            push notification server — all reminders are scheduled locally through the service worker.
          </p>

          <h2>Cookies and Tracking</h2>
          <p>
            The app itself does not use cookies for tracking. However, third-party advertising services (Google AdSense)
            may use cookies to serve relevant advertisements. These cookies are governed by Google&apos;s privacy policy.
            You can manage cookie preferences through your browser settings.
          </p>

          <h2>Third-Party Advertising</h2>
          <p>
            We use Google AdSense to display advertisements. Google may use cookies and web beacons to serve ads based on
            your prior visits to this and other websites. You can opt out of personalized advertising by visiting{" "}
            <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
              Google Ads Settings
            </a>.
          </p>

          <h2>Children&apos;s Privacy</h2>
          <p>
            Our app is designed for college students. We do not knowingly collect information from children under 13.
            Since we collect no personal information at all, this concern is inherently addressed.
          </p>

          <h2>Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. Any changes will be reflected on this page with an
            updated revision date.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have questions about this privacy policy, please visit our{" "}
            <a href="/contact">contact page</a>.
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
