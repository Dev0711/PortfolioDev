"use client";

import { MotionConfig, motion, useMotionValue, useScroll, useSpring } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { useFinePointer } from "@/components/motion/use-fine-pointer";

/** Site-wide motion settings: honours the OS "reduce motion" preference. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/** Thin scroll-linked progress bar pinned to the top of the viewport. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[70] h-px origin-left bg-signal"
      style={{ scaleX }}
    />
  );
}

/**
 * Custom cursor: a small dot plus a trailing ring that grows over interactive
 * elements and shows a label for elements with data-cursor="View".
 * Mouse/trackpad only — touch devices keep the native behaviour.
 */
export function Cursor() {
  const fine = useFinePointer();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 320, damping: 30, mass: 0.5 });
  const ringY = useSpring(y, { stiffness: 320, damping: 30, mass: 0.5 });
  const [state, setState] = useState<{ active: boolean; label: string; visible: boolean }>({
    active: false,
    label: "",
    visible: false,
  });

  useEffect(() => {
    if (!fine) return;

    const onMove = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      const target = event.target instanceof Element ? event.target : null;
      const labelled = target?.closest<HTMLElement>("[data-cursor]");
      const interactive = target?.closest("a, button, [role='button'], input, textarea, select, label");
      const label = labelled?.dataset.cursor ?? "";
      const active = Boolean(interactive || labelled);
      setState((prev) =>
        prev.active === active && prev.label === label && prev.visible ? prev : { active, label, visible: true },
      );
    };
    const onLeave = () => setState((prev) => ({ ...prev, visible: false }));

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [fine, x, y]);

  if (!fine) return null;

  const size = state.label ? 84 : state.active ? 44 : 28;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[80]" style={{ opacity: state.visible ? 1 : 0 }}>
      <motion.div
        className="absolute left-0 top-0 flex items-center justify-center rounded-full border border-ink/40"
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: size,
          height: size,
          backgroundColor: state.label ? "var(--signal)" : "rgba(236,232,223,0)",
          borderColor: state.label ? "var(--signal)" : "rgba(236,232,223,0.4)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
      >
        {state.label ? (
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-background">{state.label}</span>
        ) : null}
      </motion.div>
      <motion.div
        className="absolute left-0 top-0 h-1 w-1 rounded-full bg-signal"
        style={{ x, y, translateX: "-50%", translateY: "-50%", opacity: state.label ? 0 : 1 }}
      />
    </div>
  );
}
