import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-sm">
              CF
            </div>
            <span className="font-semibold text-lg">CareerFit AI</span>
          </div>
          <Link
            href="/upload"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
          >
            Get Started
          </Link>
        </div>
      </header>

      <section className="flex-1 flex items-center">
        <div className="max-w-6xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight leading-tight">
              Your career intelligence{" "}
              <span className="text-accent">decision workspace</span>
            </h1>
            <p className="mt-4 text-lg text-muted leading-relaxed">
              Upload your resume and multiple job descriptions. Get grounded fit
              scores, skill gap analysis, interview prep, and cited answers — not
              generic chatbot guesses.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/upload"
                className="rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
              >
                Upload Documents
              </Link>
              <Link
                href="/dashboard"
                className="rounded-lg border border-border px-6 py-3 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Open Dashboard
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            {[
              {
                title: "Multi-job fit scoring",
                desc: "Compare 2–5 roles side by side with structured evidence.",
              },
              {
                title: "Skill gap extraction",
                desc: "See required vs. demonstrated skills with resume citations.",
              },
              {
                title: "Grounded chat",
                desc: "Ask questions with retrieved evidence and confidence signals.",
              },
              {
                title: "Interview prep",
                desc: "Generate targeted questions based on gaps and JD requirements.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-border bg-card p-5 shadow-sm"
              >
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-muted mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
