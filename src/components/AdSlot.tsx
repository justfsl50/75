"use client";

interface AdSlotProps {
  id: string;
  className?: string;
}

export function AdSlot({ id, className = "" }: AdSlotProps) {
  return (
    <div
      id={id}
      className={`flex min-h-[90px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-xs text-muted-foreground ${className}`}
      aria-label="Advertisement"
      role="complementary"
    >
      <span>Ad Space</span>
    </div>
  );
}
