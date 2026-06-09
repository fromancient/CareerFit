import { describe, expect, it } from "vitest";
import { chunkJobDescription, chunkResume } from "@/lib/documents/chunk";

const SAMPLE_RESUME = `
Summary
Experienced backend engineer with 8 years building distributed systems.

Experience
Senior Engineer — Acme Corp (2020–Present)
- Led migration to Kubernetes on AWS
- Built event-driven pipelines with Kafka

Skills
Python, Go, PostgreSQL, Kubernetes, AWS

Education
BS Computer Science, State University
`;

const SAMPLE_JD = `
About the Company
We are a fast-growing fintech startup.

Responsibilities
- Design scalable backend services
- Mentor junior engineers

Requirements
- 5+ years backend experience
- Strong Python and Kubernetes skills
- Experience with AWS

Preferred
- GraphQL experience
- SOC2 compliance knowledge
`;

describe("chunkResume", () => {
  it("splits resume into section-aware chunks", () => {
    const chunks = chunkResume(SAMPLE_RESUME);
    expect(chunks.length).toBeGreaterThan(0);

    const sections = new Set(chunks.map((c) => c.section));
    expect(sections.has("Experience")).toBe(true);
    expect(sections.has("Skills")).toBe(true);

    const experienceChunk = chunks.find((c) => c.section === "Experience");
    expect(experienceChunk?.content).toContain("Acme Corp");
    expect(experienceChunk?.content).toContain("Kubernetes");
  });

  it("keeps bullet groups with company context", () => {
    const chunks = chunkResume(SAMPLE_RESUME);
    const exp = chunks.find((c) => c.content.includes("Acme Corp"));
    expect(exp?.content).toContain("Kafka");
  });
});

describe("chunkJobDescription", () => {
  it("identifies JD sections", () => {
    const chunks = chunkJobDescription(SAMPLE_JD);
    const sections = new Set(chunks.map((c) => c.section));
    expect(sections.has("Responsibilities")).toBe(true);
    expect(sections.has("Required Skills")).toBe(true);
  });

  it("preserves required skills in chunks", () => {
    const chunks = chunkJobDescription(SAMPLE_JD);
    const required = chunks.find((c) => c.section === "Required Skills");
    expect(required?.content.toLowerCase()).toContain("kubernetes");
  });
});
