"use client";

import type { ElementType, PointerEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Tracks the pointer and exposes it as --mx / --my so the `.spotlight` CSS can
 * light the card from under the cursor. No React state, no re-renders.
 */
export function Spotlight({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "li";
}) {
  const Tag = as as ElementType;

  function onMove(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }

  return (
    <Tag className={cn("spotlight", className)} onPointerMove={onMove}>
      {children}
    </Tag>
  );
}
