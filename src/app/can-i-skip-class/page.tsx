import { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { EmbeddedCalculator } from "@/components/EmbeddedCalculator";
import { AdSlot } from "@/components/AdSlot";

export const metadata: Metadata = {
  title: "Can I Skip Class Today? - Attendance Skip Checker",
  description:
    "Check if you can safely skip class today without falling below your attendance target. Instant calculation based on your current attendance data.",
  alternates: { canonical: "/can-i-skip-class" },
  openGraph: {
    title: "Can I Skip Class Today? - Attendance Checker",
    description: "Find out instantly if skipping class today is safe for your attendance percentage.",
  },
};

const faqData = [
  {
    question: "How does the skip checker work?",
    answer:
      "It simulates adding one more absent class to your record and recalculates whether your attendance would still meet the target. If skipping keeps you above the threshold, it shows green (safe). If it would drop you below, it shows red (unsafe).",
  },
  {
    question: "Is it safe to skip if the checker says green?",
    answer:
      "Mathematically yes — your attendance will remain above the target. However, consider that each skip reduces your buffer for future emergencies. Use the what-if simulator to check the impact of multiple skips.",
  },
  {
    question: "What if I have already skipped too many classes?",
    answer:
      "If the checker shows red, you cannot afford to miss today. Check how many consecutive classes you need to attend to rebuild your buffer using the main calculator.",
  },
  {
    question: "Does the checker account for future classes?",
    answer:
      "Yes. It considers your remaining scheduled classes when determining if a skip is safe. The calculation ensures you can still reach the target by attending the required number of future classes.",
  },
  {
    question: "Should I always skip when the checker says I can?",
    answer:
      "No. Just because you can skip does not mean you should. Regular attendance improves learning, helps with exam preparation, and builds relationships with professors. Only skip when you genuinely need to.",
  },
];

export default function CanISkipClassPage() {
  return (
    <>
      <Header />
      <main className="mx-auto min-h-screen max-w-3xl px-4 pb-24 pt-4">
        <AdSlot id="ad-slot-top" maxHeight={100} />

        <article className="prose prose-slate dark:prose-invert mx-auto mt-6">
          <h1 className="text-2xl font-bold sm:text-3xl">Can I Skip Class Today?</h1>

          <p>
            Every student has faced this question: &quot;Can I skip class today without hurting my attendance?&quot; The answer
            depends on your current attendance percentage, how many classes remain in the semester, and your target attendance
            requirement.
          </p>

          <p>
            Our skip checker gives you an instant answer. Instead of doing mental math or guessing, enter your attendance
            data below and get a clear green or red signal. Green means you are safe to skip. Red means you should attend
            today.
          </p>

          <h2 className="text-xl font-bold">The Mathematics Behind Skipping</h2>

          <p>
            When you skip a class, your total classes held increases by one but your attended count stays the same. This
            causes your percentage to drop. The question is whether this drop keeps you above your target or pushes you below.
          </p>

          <p>
            The formula is: <strong>New % = A / (T + 1) × 100</strong> where A is your current attended classes and T is
            current total. If this new percentage still allows you to reach your target by attending enough future classes,
            skipping is safe.
          </p>
        </article>

        <div className="my-8">
          <EmbeddedCalculator />
        </div>

        <AdSlot id="ad-slot-mid" maxHeight={250} />

        <article className="prose prose-slate dark:prose-invert mx-auto mt-8">
          <h2 className="text-xl font-bold">Smart Skipping Strategy</h2>

          <p>
            Skipping classes strategically is different from skipping randomly. Here is a framework for making smart decisions
            about which classes to skip:
          </p>

          <ol>
            <li><strong>Check first, decide second</strong> — Always use the skip checker before making a decision. Never rely on gut feeling.</li>
            <li><strong>Keep a buffer</strong> — Try to maintain at least 3-5 skippable classes as emergency reserves for illness or personal emergencies.</li>
            <li><strong>Prioritize important classes</strong> — If you must skip, skip less critical classes or ones where notes are easily available.</li>
            <li><strong>Front-load attendance</strong> — Attend consistently early in the semester to build a skip buffer for later weeks.</li>
            <li><strong>Track the trend</strong> — If your attendance has been declining, attend even when the checker says you can skip.</li>
          </ol>

          <h2 className="text-xl font-bold">What Happens When You Skip Too Much</h2>

          <p>
            Falling below the minimum attendance threshold has real consequences. These vary by institution but commonly
            include: being debarred from final exams, losing internal assessment marks, academic warnings or probation,
            having to repeat the course or semester, and loss of scholarship eligibility.
          </p>

          <p>
            The most painful scenario is discovering you cannot sit for exams after an entire semester of studying. This is
            entirely preventable with regular attendance tracking.
          </p>

          <h2 className="text-xl font-bold">Frequently Asked Questions</h2>

          {faqData.map((faq, i) => (
            <div key={i} className="mb-4">
              <h3 className="text-lg font-semibold">{faq.question}</h3>
              <p>{faq.answer}</p>
            </div>
          ))}
        </article>

        <AdSlot id="ad-slot-bottom" maxHeight={100} />
      </main>
      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqData.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          }),
        }}
      />
    </>
  );
}
