import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Reveal, RevealText } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

/** Shared section header: numbered mono eyebrow, large headline, optional body + CTA. */
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
  return (
    <div className={cn("grid gap-8 md:grid-cols-12 md:gap-6", className)}>
      <Reveal className="md:col-span-3">
        <p className="label flex items-center gap-3">
          {index ? <span className="text-signal">{index}</span> : null}
          <span className="h-px w-8 bg-line-strong" aria-hidden />
          {eyebrow}
        </p>
      </Reveal>
      <div className="md:col-span-9">
        {heading ? (
          <RevealText as={as} text={heading} className={as === "h1" ? "display" : "headline max-w-4xl"} />
        ) : null}
        {body || (ctaLabel && ctaHref) ? (
          <Reveal delay={0.1} className="mt-8 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            {body ? <p className="lede">{body}</p> : <span />}
            {ctaLabel && ctaHref ? (
              <Link href={ctaHref} className="btn btn-ghost shrink-0 self-start md:self-auto">
                {ctaLabel}
                <ArrowUpRight className="arrow size-4" aria-hidden />
              </Link>
            ) : null}
          </Reveal>
        ) : null}
      </div>
    </div>
  );
}
