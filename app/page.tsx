import Link from "next/link";
import { AppHeader } from "@/components/ui/AppHeader";

const FEATURES = [
  {
    title: "Multi-job fit scoring",
    desc: "Compare 2–5 roles side by side with structured evidence.",
    icon: "◈",
  },
  {
    title: "Skill gap extraction",
    desc: "See required vs. demonstrated skills with resume citations.",
    icon: "△",
  },
  {
    title: "Grounded chat",
    desc: "Ask questions with retrieved evidence and confidence signals.",
    icon: "◎",
  },
  {
    title: "Interview prep",
    desc: "Generate targeted questions based on gaps and JD requirements.",
    icon: "✦",
  },
];

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col relative overflow-hidden">
      <div className="orb w-72 h-72 bg-cyan-400/20 top-20 -left-20" />
      <div
        className="orb w-96 h-96 bg-violet-500/15 top-40 right-0"
        style={{ animationDelay: "-4s" }}
      />

      <AppHeader
        right={
          <Link href="/upload" className="btn-primary">
            Get Started
          </Link>
        }
      />

      <section className="flex-1 flex items-center relative">
        <div className="max-w-6xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-12 items-center w-full">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-cyan-300/80 mb-4">
              Career Intelligence · RAG-Powered
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
              Your career{" "}
              <span className="text-gradient">decision workspace</span>
            </h1>
            <p className="mt-5 text-lg text-muted leading-relaxed max-w-lg">
              Upload your resume and multiple job descriptions. Get grounded fit
              scores, skill gaps, interview prep, and cited answers — not generic
              chatbot guesses.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/upload" className="btn-primary px-6 py-3">
                Upload Documents
              </Link>
              <Link href="/dashboard" className="btn-secondary px-6 py-3">
                Open Career Assistant
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="glass-panel holo-border rounded-2xl p-5 transition-transform hover:-translate-y-0.5"
              >
                <span className="text-xl text-cyan-300/90">{f.icon}</span>
                <h3 className="font-semibold mt-2">{f.title}</h3>
                <p className="text-sm text-muted mt-1.5 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
