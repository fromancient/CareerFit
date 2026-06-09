export interface GoldenTestCase {
  id: string;
  question: string;
  expectations: string[];
  requiredDocumentTypes?: ("RESUME" | "JOB_DESCRIPTION")[];
  mustNotHallucinate?: boolean;
}

export const goldenSet: GoldenTestCase[] = [
  {
    id: "best-fit-comparison",
    question: "Which job is the strongest fit?",
    expectations: [
      "Must compare all uploaded job descriptions",
      "Must cite resume evidence",
      "Must cite job description evidence",
      "Must include a clear recommendation",
    ],
  },
  {
    id: "skill-gap-job-2",
    question: "What skills am I missing for Job #2?",
    expectations: [
      "Must list missing required skills only from the target job",
      "Must not invent skills on the resume",
      "Must separate required vs preferred gaps when possible",
    ],
  },
  {
    id: "kubernetes-mention",
    question: "Does my resume mention Kubernetes?",
    expectations: [
      "Must answer yes or no",
      "Must include citation from resume chunks",
      "Must not guess if evidence is absent",
    ],
    mustNotHallucinate: true,
  },
  {
    id: "interview-prep",
    question: "What interview questions should I prepare for?",
    expectations: [
      "Must ground questions in JD requirements",
      "Must reference resume strengths and gaps",
      "Must provide actionable preparation steps",
    ],
  },
  {
    id: "profile-rewrite",
    question: "Rewrite my profile summary for the strongest role.",
    expectations: [
      "Must use only verified resume facts",
      "Must align with top-fit job requirements",
      "Must not fabricate employers or dates",
    ],
    mustNotHallucinate: true,
  },
];

export const evalMetrics = [
  "retrieval_precision",
  "citation_correctness",
  "hallucinated_skills",
  "answer_relevance",
  "latency_ms",
  "token_cost",
] as const;

export type EvalMetric = (typeof evalMetrics)[number];
