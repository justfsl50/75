"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle: Record<string, unknown>[];
  }
}

interface AdSlotProps {
  id: string;
  className?: string;
}

export function AdSlot({ id, className = "" }: AdSlotProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense not loaded (e.g. ad blocker) — ad stays hidden
    }
  }, []);

  return (
    <div id={id} className={className} aria-label="Advertisement" role="complementary">
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-3359889042531313"
        data-ad-slot="" 
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
