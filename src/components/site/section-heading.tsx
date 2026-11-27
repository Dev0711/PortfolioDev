import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Reveal, RevealText } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

/** Shared section header: accent mono eyebrow, uppercase headline, serif lede and optional CTA alongside. */
export function SectionHeading({
  index,
  eyebrow,
  heading,
  body,
  ctaLabel,
  ctaHref,
  className,
  as = "h2",
}: {
  index?: string;
  eyebrow?: string;
  heading?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
  as?: "h1" | "h2";
}) {
  const aside = body || (ctaLabel && ctaHref);
  return (
    <div className={cn("grid gap-x-14 gap-y-5", aside && "lg:grid-cols-2 lg:items-end", className)}>
      <div>
        {eyebrow || index ? (
          <Reveal y={6}>
            <p className="eyebrow">
              {index ? <span>{index} · </span> : null}
              {eyebrow}
            </p>
          </Reveal>
        ) : null}
        {heading ? (
          <RevealText as={as} text={heading} className={cn(as === "h1" ? "display" : "headline", "mt-3 max-w-[24ch]")} />
        ) : null}
      </div>
      {aside ? (
        <Reveal delay={0.08} y={6} className="flex flex-col items-start gap-4">
          {body ? <p className="text-[1.08rem] leading-[1.6]">{body}</p> : null}
          {ctaLabel && ctaHref ? (
            <Link href={ctaHref} className="btn">
              {ctaLabel}
              <ArrowUpRight className="arrow size-4" aria-hidden />
            </Link>
          ) : null}
        </Reveal>
      ) : null}
    </div>
  );
}
