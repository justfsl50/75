import { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { EmbeddedCalculator } from "@/components/EmbeddedCalculator";
import { AdSlot } from "@/components/AdSlot";

export const metadata: Metadata = {
  title: "Attendance Shortage Tool - Fix Low Attendance in College",
  description:
    "Calculate how to recover from attendance shortage. Find out how many consecutive classes you need to attend to reach your target attendance percentage.",
  alternates: { canonical: "/attendance-shortage-tool" },
  openGraph: {
    title: "Attendance Shortage Recovery Tool",
    description: "Calculate exactly how many classes you need to fix your attendance shortage.",
  },
};

const faqData = [
  {
    question: "How do I recover from an attendance shortage?",
    answer:
      "Enter your current attendance data in the calculator above. It will tell you exactly how many of your remaining classes you need to attend. If the required number exceeds remaining classes, recovery may not be possible through attendance alone — contact your administration.",
  },
  {
    question: "What is considered an attendance shortage?",
    answer:
      "An attendance shortage occurs when your current attendance percentage is below your institution's minimum requirement, typically 75%. Even being slightly below can be problematic as you have no buffer for future absences.",
  },
  {
    question: "Can I get a medical exemption for low attendance?",
    answer:
      "Many colleges offer medical exemptions or condonation for attendance shortage due to documented illness. Check with your college administration about their specific policy and required documentation.",
  },
  {
    question: "How is attendance shortage calculated?",
    answer:
      "Shortage = Required attendance - Actual attendance. For example, if 75% of 100 classes is 75, and you attended only 65, your shortage is 10 classes. You need to make up for this deficit from remaining classes.",
  },
  {
    question: "Is there a way to fix attendance shortage without attending more classes?",
    answer:
      "Some institutions offer condonation with a fine, medical certificates, or participation in extra activities. However, these are institution-specific. The most reliable way is to attend all remaining classes.",
  },
];

export default function AttendanceShortageToolPage() {
  return (
    <>
      <Header />
      <main className="mx-auto min-h-screen max-w-3xl px-4 pb-24 pt-4">
        <AdSlot id="ad-slot-top" />

        <article className="prose prose-slate dark:prose-invert mx-auto mt-6">
          <h1 className="text-2xl font-bold sm:text-3xl">Attendance Shortage Recovery Tool</h1>

          <p>
            Falling behind on attendance is stressful. Whether it happened due to illness, personal reasons, or simply losing
            track, the first step to recovery is knowing exactly where you stand and what it takes to get back on track.
          </p>

          <p>
            This tool is designed for students who are already below or dangerously close to their attendance threshold. It
            calculates the exact number of consecutive classes you need to attend to recover, and whether recovery is still
            mathematically possible.
          </p>

          <h2 className="text-xl font-bold">Understanding Attendance Shortage</h2>

          <p>
            Attendance shortage means your attended classes are fewer than what your institution requires. For a 75% requirement
            with 80 classes held, you need at least 60 attended. If you have only attended 55, you have a shortage of 5 classes.
          </p>

          <p>
            The critical question is not just how big the shortage is, but whether you have enough remaining classes to make up
            for it. This is what makes our tool different from a simple percentage calculator — it factors in future classes to
            give you an actionable recovery plan.
          </p>
        </article>

        <div className="my-8">
          <EmbeddedCalculator />
        </div>

        <AdSlot id="ad-slot-mid" />

        <article className="prose prose-slate dark:prose-invert mx-auto mt-8">
          <h2 className="text-xl font-bold">Recovery Strategies</h2>

          <p>
            Once you know your numbers, here are proven strategies to recover from an attendance shortage:
          </p>

          <ol>
            <li><strong>Attend every single class</strong> — If your shortage is large, you may need 100% attendance for the remaining period. Mark your calendar and set daily reminders.</li>
            <li><strong>Talk to your professor</strong> — Some professors may offer additional sessions, lab hours, or workshops that count toward attendance.</li>
            <li><strong>Apply for condonation</strong> — If you have valid reasons (medical, bereavement), submit documentation to your college for attendance condonation.</li>
            <li><strong>Check for extra classes</strong> — Some departments schedule extra lectures or tutorials. Attending these may help close the gap.</li>
            <li><strong>Plan with the weekly planner</strong> — Use our weekly planner to spread your remaining mandatory classes across weeks and ensure you do not miss any.</li>
          </ol>

          <h2 className="text-xl font-bold">When Recovery Is Not Possible</h2>

          <p>
            Sometimes the numbers are not in your favor. If the required future classes exceed remaining classes, it is
            mathematically impossible to reach the target through attendance alone. In such cases:
          </p>

          <ul>
            <li>Contact your academic advisor immediately.</li>
            <li>Explore institutional policies for attendance condonation.</li>
            <li>Prepare medical or other supporting documents if applicable.</li>
            <li>Understand the consequences and plan for next steps — whether that is reappearing for exams later or repeating courses.</li>
          </ul>

          <h2 className="text-xl font-bold">Frequently Asked Questions</h2>

          {faqData.map((faq, i) => (
            <div key={i} className="mb-4">
              <h3 className="text-lg font-semibold">{faq.question}</h3>
              <p>{faq.answer}</p>
            </div>
          ))}
        </article>

        <AdSlot id="ad-slot-bottom" />
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
