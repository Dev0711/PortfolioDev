import { Reveal, RevealText } from "@/components/motion/reveal";

/** Shared header for inner pages (Work, About, Contact). */
export function PageHero({
  index,
  eyebrow,
  heading,
  body,
}: {
  index: string;
  eyebrow: string;
  heading: string;
  body?: string;
  /** Kept for call-site compatibility; the paper theme has no generative backdrop. */
  seed?: number;
}) {
  return (
    <header className="border-b border-line">
      <div className="shell pb-11 pt-24 sm:pt-32">
        <Reveal y={6}>
          <p className="eyebrow mb-4">
            {index} · {eyebrow}
          </p>
        </Reveal>
        <RevealText as="h1" immediate delay={0.05} text={heading} className="display max-w-[22ch]" />
        {body ? (
          <Reveal delay={0.2} y={8}>
            <p className="lede mt-6">{body}</p>
          </Reveal>
        ) : null}
      </div>
    </header>
  );
}
