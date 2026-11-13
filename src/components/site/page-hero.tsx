import { Reveal, RevealText } from "@/components/motion/reveal";
import { AmbientCanvas } from "@/components/site/ambient-canvas";

/** Shared header for inner pages (Work, About, Contact). */
export function PageHero({
  index,
  eyebrow,
  heading,
  body,
  seed = 11,
}: {
  index: string;
  eyebrow: string;
  heading: string;
  body?: string;
  seed?: number;
}) {
  return (
    <header className="relative overflow-hidden border-b border-line pb-16 pt-36 md:pb-24 md:pt-48">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="blueprint absolute inset-0" />
        <AmbientCanvas className="absolute inset-0 opacity-50" seed={seed} />
        <div className="absolute inset-0 bg-gradient-to-t from-base via-base/40 to-transparent" />
      </div>
      <div className="shell relative">
        <Reveal y={12}>
          <p className="label mb-8 flex items-center gap-3">
            <span className="text-signal">{index}</span>
            <span className="h-px w-8 bg-line-strong" aria-hidden />
            {eyebrow}
          </p>
        </Reveal>
        <RevealText as="h1" immediate delay={0.1} text={heading} className="display max-w-[18ch]" />
        {body ? (
          <Reveal delay={0.4} className="mt-10">
            <p className="lede">{body}</p>
          </Reveal>
        ) : null}
      </div>
    </header>
  );
}
