import { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { EmbeddedCalculator } from "@/components/EmbeddedCalculator";
import { AdSlot } from "@/components/AdSlot";

export const metadata: Metadata = {
  title: "75% Attendance Planner - Plan Your College Attendance Strategy",
  description:
    "Plan how to maintain 75% attendance in college. Calculate minimum classes needed, safe skips, and weekly attendance strategy with our free planner.",
  alternates: { canonical: "/75-percent-attendance-planner" },
  openGraph: {
    title: "75% Attendance Planner for College Students",
    description: "Free tool to plan and maintain 75% attendance throughout the semester.",
  },
};

const faqData = [
  {
    question: "Why is 75% the standard minimum attendance requirement?",
    answer:
      "Most universities, especially those under UGC and AICTE guidelines, have adopted 75% as the minimum attendance requirement. This threshold ensures students attend at least three-quarters of all classes, balancing flexibility with academic rigor.",
  },
  {
    question: "How do I plan my attendance for the entire semester?",
    answer:
      "Enter your current classes attended, total classes held, and remaining classes in the planner above. It will calculate exactly how many classes you need to attend each week to maintain 75% by the end of the semester.",
  },
  {
    question: "Can I recover from low attendance?",
    answer:
      "It depends on how many classes remain. Use the planner to check if 75% is still reachable. If you need to attend more classes than remaining, you may need to talk to your college administration about alternatives.",
  },
  {
    question: "What if my college requires 80% instead of 75%?",
    answer:
      "Simply change the target percentage in the calculator settings. The planner works with any target percentage from 1% to 100%.",
  },
  {
    question: "How many classes can I miss with 75% attendance requirement?",
    answer:
      "For every 4 classes held, you can miss 1. So if your semester has 100 classes, you can miss up to 25. However, the exact number depends on your current attendance - use the calculator for precision.",
  },
];

export default function SeventyFivePercentPage() {
  return (
    <>
      <Header />
      <main className="mx-auto min-h-screen max-w-3xl px-4 pb-24 pt-4">
        <AdSlot id="ad-slot-top" maxHeight={100} />

        <article className="prose prose-slate dark:prose-invert mx-auto mt-6">
          <h1 className="text-2xl font-bold sm:text-3xl">75% Attendance Planner for College Students</h1>

          <p>
            The 75% attendance rule is the most common requirement across colleges and universities worldwide. Whether you
            are studying engineering, medicine, arts, or commerce, chances are your institution requires you to attend at
            least 75% of all scheduled classes to be eligible for final examinations.
          </p>

          <p>
            This planner is designed specifically to help you strategize your attendance around the 75% threshold. It does
            not just tell you where you stand today — it helps you plan ahead so you never fall short when it matters most.
          </p>

          <h2 className="text-xl font-bold">How the 75% Rule Works</h2>

          <p>
            The rule is simple: you must attend at least 75 out of every 100 classes. But in practice, managing this across
            an entire semester with varying class schedules, sick days, events, and personal commitments requires careful
            planning.
          </p>

          <p>
            Consider a typical semester with 120 total classes. To meet 75%, you need to attend at least 90 classes. That
            means you have a budget of 30 absences for the entire semester. Spread across 16 weeks, that is roughly 1-2
            skippable classes per week — but only if you plan from the start.
          </p>
        </article>

        <div className="my-8">
          <EmbeddedCalculator />
        </div>

        <AdSlot id="ad-slot-mid" maxHeight={250} />

        <article className="prose prose-slate dark:prose-invert mx-auto mt-8">
          <h2 className="text-xl font-bold">Planning Your Weekly Attendance</h2>

          <p>
            The key to maintaining 75% attendance is not to skip classes randomly. Instead, plan your absences. Use our
            weekly planner feature to distribute your allowed absences evenly across the remaining weeks. This ensures you
            always have a safety margin for unexpected situations like illness or emergencies.
          </p>

          <h3>The Early Advantage</h3>
          <p>
            Students who attend most classes early in the semester build an attendance buffer. If you attend 90% of classes
            in the first half, you will have more flexibility in the second half when exam preparation becomes demanding.
            The planner helps you visualize this strategy.
          </p>

          <h2 className="text-xl font-bold">Common Mistakes Students Make</h2>

          <ol>
            <li><strong>Not tracking attendance</strong> — Many students only check their attendance when it is too late.</li>
            <li><strong>Assuming the buffer is larger than it is</strong> — Missing &quot;just one more class&quot; can quickly add up.</li>
            <li><strong>Ignoring proxy counting</strong> — Some colleges cancel proxy attendance and retroactively lower your count.</li>
            <li><strong>Not accounting for cancelled classes</strong> — When a class gets cancelled, your total reduces but so does your attended count.</li>
          </ol>

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
