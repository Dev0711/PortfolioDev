"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/** Small "copy" button that copies a value to the clipboard. */
export function CopyChip({ value, label = "Copy", className }: { value: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard can be blocked; the value is still visible to select by hand.
    }
  };

  return (
    <button type="button" className={cn("copy-chip", copied && "copied", className)} onClick={copy} aria-label={`${label}: ${value}`}>
      <span aria-live="polite">{copied ? "copied" : "copy"}</span>
    </button>
  );
}
