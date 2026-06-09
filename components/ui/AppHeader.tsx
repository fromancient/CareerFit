import Link from "next/link";
import type { ReactNode } from "react";
import { BrandMark } from "./BrandMark";

interface AppHeaderProps {
  right?: ReactNode;
  subtitle?: string;
}

export function AppHeader({ right, subtitle }: AppHeaderProps) {
  return (
    <header className="glass-header shrink-0 z-10">
      <div className="px-4 py-3 flex items-center justify-between max-w-[1600px] mx-auto w-full">
        <Link href="/" className="flex items-center gap-2.5 group">
          <BrandMark size="sm" />
          <div>
            <span className="font-semibold tracking-tight">CareerFit AI</span>
            {subtitle && (
              <p className="text-[10px] text-muted hidden sm:block">{subtitle}</p>
            )}
          </div>
        </Link>
        {right}
      </div>
    </header>
  );
}
