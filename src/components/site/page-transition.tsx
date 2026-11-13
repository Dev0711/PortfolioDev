"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

const EASE = [0.76, 0, 0.24, 1] as const;

/**
 * Quick page transition: a two-layer curtain wipes upward off the new page
 * while the content settles in. About 0.6s in total and it never blocks
 * interaction. The site layout hides [data-curtain] when JS is unavailable.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <>
      <motion.div
        aria-hidden
        data-curtain
        className="pointer-events-none fixed inset-0 z-[65] origin-top bg-signal"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 0.55, ease: EASE }}
      />
      <motion.div
        aria-hidden
        data-curtain
        className="pointer-events-none fixed inset-0 z-[64] origin-top bg-base"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 0.55, delay: 0.08, ease: EASE }}
      />
      {children}
    </>
  );
}
