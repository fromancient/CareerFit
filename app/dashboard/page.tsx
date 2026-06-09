import { Suspense } from "react";
import { DashboardPageContent } from "./DashboardPageContent";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center text-sm text-muted">
          Loading workspace…
        </div>
      }
    >
      <DashboardPageContent />
    </Suspense>
  );
}
