import { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { EmbeddedCalculator } from "@/components/EmbeddedCalculator";
import { AdSlot } from "@/components/AdSlot";

export const metadata: Metadata = {
  title: "Attendance Calculator - Calculate Your College Attendance Percentage",
  description:
    "Free online attendance calculator for college students. Enter total classes and classes attended to instantly calculate your attendance percentage, required classes, and skippable classes.",
  alternates: { canonical: "/attendance-calculator" },
  openGraph: {
    title: "Attendance Calculator - Calculate Your College Attendance",
    description: "Instantly calculate your college attendance percentage and plan ahead.",
  },
};

const faqData = [
  {
    question: "How do I calculate my attendance percentage?",
    answer:
      "Divide the number of classes you attended by the total number of classes held, then multiply by 100. For example, if you attended 60 out of 80 classes, your attendance is (60/80) × 100 = 75%.",
  },
  {
    question: "What is the minimum attendance required in most colleges?",
    answer:
      "Most colleges and universities require a minimum of 75% attendance. Some institutions may require 80% or higher. Check your specific college rules.",
  },
  {
    question: "How many classes can I skip and still maintain 75% attendance?",
    answer:
      "Use our calculator above. Enter your total classes, attended classes, and remaining classes. The tool will tell you exactly how many classes you can safely skip.",
  },
  {
    question: "Does this calculator work for semester and yearly attendance?",
    answer:
      "Yes. This calculator works for any time period. Just enter your total and attended classes for whatever period you want to calculate.",
  },
  {
    question: "What happens if my attendance drops below the required percentage?",
    answer:
      "Consequences vary by college but may include being barred from exams, loss of scholarships, academic probation, or having to repeat the semester.",
  },
];

export default function AttendanceCalculatorPage() {
  return (
    <>
      <Header />
      <main className="mx-auto min-h-screen max-w-3xl px-4 pb-24 pt-4">
        <AdSlot id="ad-slot-top" maxHeight={100} />

        <article className="prose prose-slate dark:prose-invert mx-auto mt-6">
          <h1 className="text-2xl font-bold sm:text-3xl">Attendance Calculator for College Students</h1>

          <p>
            Keeping track of your college attendance is essential for academic success. Most universities enforce a minimum
            attendance policy, typically requiring students to attend at least 75% of their scheduled classes. Falling below this
            threshold can lead to serious consequences including exam debarment, loss of internal marks, and even having to repeat
            a semester.
          </p>

          <p>
            Our free attendance calculator helps you stay on top of your attendance. Simply enter your total classes held, classes
            attended, and remaining scheduled classes to get an instant breakdown of your attendance status.
          </p>
        </article>

        <div className="my-8">
          <EmbeddedCalculator />
        </div>

        <AdSlot id="ad-slot-mid" maxHeight={250} />

        <article className="prose prose-slate dark:prose-invert mx-auto mt-8">
          <h2 className="text-xl font-bold">How the Attendance Calculator Works</h2>

          <p>
            The calculator uses a straightforward formula: <strong>Attendance % = (Classes Attended / Total Classes) × 100</strong>.
            But it goes beyond simple percentage calculation. It also factors in your remaining classes to determine how many
            future classes you need to attend and how many you can safely skip while still meeting your target percentage.
          </p>

          <h3>Understanding the Results</h3>
          <ul>
            <li><strong>Current Attendance %</strong> — Your attendance right now based on classes held so far.</li>
            <li><strong>Required Future Classes</strong> — The minimum number of remaining classes you must attend to reach your target.</li>
            <li><strong>Skippable Classes</strong> — How many remaining classes you can miss and still hit your target percentage.</li>
            <li><strong>Final % If Attend All</strong> — Your attendance percentage if you attend every remaining class.</li>
            <li><strong>Risk Level</strong> — A visual indicator of how close you are to falling below your target.</li>
          </ul>

          <h2 className="text-xl font-bold">Why Attendance Matters</h2>

          <p>
            Attendance is more than just a number. Regular class attendance is strongly correlated with academic performance.
            Students who attend classes regularly tend to score higher on exams, have better understanding of course material,
            and are more engaged with their studies.
          </p>

          <p>
            Beyond grades, many colleges tie attendance to eligibility for sitting in final exams. Universities like those under
            AICTE and UGC guidelines in India mandate 75% minimum attendance. Professional courses like engineering, medicine,
            and law often have even stricter requirements.
          </p>

          <h2 className="text-xl font-bold">Tips to Maintain Good Attendance</h2>

          <ol>
            <li><strong>Track daily</strong> — Use our quick update buttons to mark present or absent each day.</li>
            <li><strong>Plan ahead</strong> — Use the weekly planner to distribute your absences smartly across weeks.</li>
            <li><strong>Set reminders</strong> — Enable push notifications to get daily attendance reminders.</li>
            <li><strong>Use the &quot;Can I Skip&quot; button</strong> — Before deciding to skip a class, check if it is safe to do so.</li>
            <li><strong>Simulate scenarios</strong> — Use the what-if simulator to see the impact of missing multiple classes.</li>
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
