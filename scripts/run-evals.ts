/**
 * Lightweight RAGAS-style eval runner (offline checks on golden set).
 * Run: npx tsx scripts/run-evals.ts
 *
 * Full RAGAS metrics (faithfulness, context recall) require live LLM calls
 * against a seeded session — extend this script when OPENAI_API_KEY is set.
 */
import { goldenSet, evalMetrics } from "../lib/evals/golden-set";

function main() {
  console.log("CareerFit AI — Golden Eval Set\n");
  console.log(`Metrics tracked: ${evalMetrics.join(", ")}\n`);

  for (const testCase of goldenSet) {
    console.log(`[${testCase.id}]`);
    console.log(`  Q: ${testCase.question}`);
    console.log("  Expectations:");
    for (const exp of testCase.expectations) {
      console.log(`    - ${exp}`);
    }
    if (testCase.mustNotHallucinate) {
      console.log("  ⚠ Must not hallucinate — verify citations in manual/automated run");
    }
    console.log();
  }

  console.log(
    "To run live evals: seed demo data, then ask each question via /api/chat and check citations.",
  );
}

main();
