"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { useIsDesktop } from "@/components/motion/use-fine-pointer";

/** Subtle scroll-linked vertical drift. Disabled on small screens and reduced motion. */
export function Parallax({
  children,
  className,
  amount = 60,
}: {
  children: ReactNode;
  className?: string;
  /** Total travel in px across the element's pass through the viewport. */
  amount?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const desktop = useIsDesktop();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [amount / 2, -amount / 2]);

  return (
    <div ref={ref} className={className}>
      <motion.div className="h-full w-full will-change-transform" style={reduce || !desktop ? undefined : { y }}>
        {children}
      </motion.div>
    </div>
  );
}
