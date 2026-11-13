"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { AmbientCanvas } from "@/components/site/ambient-canvas";
import { cn } from "@/lib/utils";

/**
 * Full-bleed section background. Shows the uploaded image or looping video
 * when one is set in the admin, and falls back to the generative canvas.
 * Videos are muted, inline, paused off-screen and never autoplay under
 * prefers-reduced-motion.
 */
export function MediaBackdrop({
  url,
  type,
  className,
  seed,
  priority = false,
}: {
  url: string | null;
  type: "image" | "video" | null;
  className?: string;
  seed?: number;
  priority?: boolean;
}) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {url && type === "video" ? (
        <BackgroundVideo src={url} />
      ) : url && type === "image" ? (
        <Image src={url} alt="" fill priority={priority} sizes="100vw" className="object-cover opacity-60" />
      ) : (
        <>
          <div className="blueprint absolute inset-0" />
          <AmbientCanvas className="absolute inset-0" seed={seed} />
        </>
      )}
      {/* Legibility scrims */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_25%_45%,rgb(10_11_13/0.82),transparent_70%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-base to-transparent" />
    </div>
  );
}

export function BackgroundVideo({ src, className, poster }: { src: string; className?: string; poster?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => undefined);
      else video.pause();
    });
    io.observe(video);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className={cn("h-full w-full object-cover opacity-60", className)}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      tabIndex={-1}
    />
  );
}
