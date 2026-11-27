"use client";

import { useEffect, useRef } from "react";
import type { TextBlock } from "@/lib/types";
import { pad2 } from "@/lib/utils";

/**
 * "Principles" rail.
 *
 * Desktop: a GSAP ScrollTrigger timeline pins the section and translates the
 * card track horizontally as the page scrolls vertically (the only place GSAP
 * is used — this is a scroll-scrubbed timeline, not a component animation).
 * Native scrolling is untouched: the scrollbar, wheel and keyboard all behave
 * normally, the section is simply taller while pinned.
 *
 * Mobile / reduced motion: no GSAP is loaded; the track is a native,
 * swipeable scroll-snap list.
 */
export function PrinciplesRail({ items }: { items: TextBlock[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const enabled =
      window.matchMedia("(min-width: 1024px)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!enabled) return;

    let revert: (() => void) | undefined;
    let cancelled = false;

    // Loaded on demand so mobile visitors never download GSAP.
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      // Switch the layout to its pinned form before ScrollTrigger measures it.
      section.dataset.pinned = "true";

      const context = gsap.context(() => {
        const distance = () => Math.max(0, track.scrollWidth - section.clientWidth);

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });

        timeline.to(track, { x: () => -distance(), ease: "none" }, 0);
        if (barRef.current) {
          timeline.fromTo(barRef.current, { scaleX: 0 }, { scaleX: 1, ease: "none" }, 0);
        }
      }, section);

      revert = () => {
        context.revert();
        delete section.dataset.pinned;
      };
    });

    return () => {
      cancelled = true;
      revert?.();
    };
  }, [items.length]);

  return (
    <div
      ref={sectionRef}
      className="group/rail relative flex flex-col justify-center overflow-hidden py-4 data-[pinned=true]:h-screen data-[pinned=true]:py-0"
    >
      <ol
        ref={trackRef}
        style={{ paddingInline: "max(1rem, calc((100vw - 75rem) / 2 + 2rem))" }}
        className="flex snap-x snap-mandatory gap-3.5 overflow-x-auto pb-4 [scrollbar-width:none] group-data-[pinned=true]/rail:snap-none group-data-[pinned=true]/rail:w-max group-data-[pinned=true]/rail:overflow-visible group-data-[pinned=true]/rail:pb-0 lg:gap-4 [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, i) => (
          <li
            key={item.title + i}
            className="relative flex min-h-[18rem] w-[82vw] shrink-0 snap-start flex-col justify-between border border-line bg-surface p-6 sm:w-[24rem] lg:min-h-[22rem] lg:w-[30rem] lg:p-8"
          >
            <div className="flex items-center justify-between">
              <span className="label">Principle</span>
              <span className="font-mono text-[0.8rem] text-signal">
                {pad2(i + 1)}
                <span className="text-ink-faint"> / {pad2(items.length)}</span>
              </span>
            </div>
            <div>
              <h3 className="font-display text-[1.5rem] font-semibold uppercase leading-[1.05] tracking-[-0.02em] text-ink lg:text-[1.9rem]">
                {item.title}
              </h3>
              {item.body ? <p className="mt-4 max-w-md leading-[1.6] text-ink-dim">{item.body}</p> : null}
            </div>
          </li>
        ))}
      </ol>

      <div className="shell mt-8 hidden lg:block">
        <div className="h-px w-full bg-line">
          <span ref={barRef} className="block h-px w-full origin-left scale-x-0 bg-signal" />
        </div>
      </div>
    </div>
  );
}
