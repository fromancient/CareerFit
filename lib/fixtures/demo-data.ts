import { readFileSync } from "fs";
import path from "path";

export interface DemoDocument {
  name: string;
  type: "RESUME" | "JOB_DESCRIPTION";
  filename: string;
}

export const DEMO_DOCUMENTS: DemoDocument[] = [
  { name: "Alex Rivera — Resume", type: "RESUME", filename: "sample-resume.txt" },
  {
    name: "CloudScale — Senior Backend Engineer",
    type: "JOB_DESCRIPTION",
    filename: "job-backend-senior.txt",
  },
  {
    name: "Nexus AI — Staff Platform Engineer",
    type: "JOB_DESCRIPTION",
    filename: "job-platform-staff.txt",
  },
  {
    name: "BrightCart — Full Stack Engineer",
    type: "JOB_DESCRIPTION",
    filename: "job-fullstack-mid.txt",
  },
];

export function loadFixtureText(filename: string): string {
  const filePath = path.join(process.cwd(), "fixtures", filename);
  return readFileSync(filePath, "utf-8");
}
