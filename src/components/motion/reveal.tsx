"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Scroll-reveal primitives (Motion for React).
 *
 * Content is always present in the server-rendered HTML; these only animate
 * presentation. Reduced motion is handled globally by <MotionConfig
 * reducedMotion="user"> in the site layout (transforms are skipped), and a
 * <noscript> rule in that layout un-hides [data-reveal] when JS is unavailable.
 */

const EASE = [0.16, 1, 0.3, 1] as const;
const VIEWPORT = { once: true, margin: "0px 0px -12% 0px" } as const;

type Tag = "div" | "section" | "li" | "article" | "header" | "p" | "ul" | "ol";

export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Distance in px the element travels upwards. */
  y?: number;
  as?: Tag;
}) {
  const Component = motion[as] as typeof motion.div;
  return (
    <Component
      data-reveal
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </Component>
  );
}

const groupVariants: Variants = {
  hidden: {},
  show: (stagger: number) => ({ transition: { staggerChildren: stagger, delayChildren: 0.05 } }),
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

/** Parent that staggers its <StaggerItem> children into view. */
export function Stagger({
  children,
  className,
  stagger = 0.08,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  as?: Tag;
}) {
  const Component = motion[as] as typeof motion.div;
  return (
    <Component
      className={className}
      variants={groupVariants}
      custom={stagger}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
    >
      {children}
    </Component>
  );
}

export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: Tag;
}) {
  const Component = motion[as] as typeof motion.div;
  return (
    <Component data-reveal className={className} variants={itemVariants}>
      {children}
    </Component>
  );
}

/**
 * Headline reveal: each word rises out of a clipped line.
 * Words wrapped in *asterisks* are set in the italic serif accent.
 * The full sentence stays readable by assistive tech via aria-label.
 */
export function RevealText({
  text,
  className,
  as = "h2",
  delay = 0,
  immediate = false,
}: {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p";
  delay?: number;
  /** Animate on mount instead of when scrolled into view (hero). */
  immediate?: boolean;
}) {
  const words = parseWords(text);
  const plain = words.map((w) => w.text).join(" ");
  const Component = motion[as] as typeof motion.h2;
  const trigger = immediate ? { animate: "show" } : { whileInView: "show", viewport: VIEWPORT };

  return (
    <Component
      className={className}
      aria-label={plain}
      initial="hidden"
      {...trigger}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.045, delayChildren: delay } } }}
    >
      {words.map((word, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.14em] align-bottom -mb-[0.14em]">
          <motion.span
            data-reveal
            className={cn("inline-block will-change-transform", word.accent && "accent-serif pr-[0.08em]")}
            variants={{
              hidden: { y: "112%" },
              show: { y: "0%", transition: { duration: 1, ease: EASE } },
            }}
          >
            {word.text}
          </motion.span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </Component>
  );
}

function parseWords(text: string) {
  const out: { text: string; accent: boolean }[] = [];
  let accent = false;
  for (const raw of text.split(/\s+/).filter(Boolean)) {
    let word = raw;
    if (word.startsWith("*")) {
      accent = true;
      word = word.slice(1);
    }
    const closes = /\*[.,;:!?]*$/.test(word);
    if (closes) word = word.replace(/\*([.,;:!?]*)$/, "$1");
    if (word) out.push({ text: word, accent });
    if (closes) accent = false;
  }
  return out;
}
