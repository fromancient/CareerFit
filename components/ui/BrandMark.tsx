interface BrandMarkProps {
  size?: "sm" | "md";
}

export function BrandMark({ size = "md" }: BrandMarkProps) {
  const dim = size === "sm" ? "h-7 w-7 text-xs" : "h-8 w-8 text-sm";
  return (
    <div
      className={`${dim} rounded-lg brand-mark flex items-center justify-center text-[#06060f] font-bold shrink-0`}
    >
      CF
    </div>
  );
}
