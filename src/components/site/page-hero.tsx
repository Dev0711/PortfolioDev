import { AccentText } from "@/components/site/accent-text";

/** Inner-page header in the reference style: eyebrow, pixel title, intro, optional stats box. */
export function PageHero({
  index,
  eyebrow,
  heading,
  body,
  stats = [],
}: {
  index: string;
  eyebrow: string;
  heading: string;
  body?: string;
  stats?: { label: string; value: string | number }[];
  /** Kept for call-site compatibility. */
  seed?: number;
}) {
  return (
    <header className="border-b border-line">
      <div className="shell pb-10 pt-24 sm:pt-28">
        <div className="iv-hero">
          <p className="eyebrow">
            {index} · {eyebrow}
          </p>
          <h1 className="lesson-title !mb-0 !mt-3">
            <AccentText text={heading} />
          </h1>
          {body ? <p className="iv-intro !mt-4">{body}</p> : null}
        </div>
        {stats.length > 0 ? (
          <dl className="iv-stats">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt>{stat.label}</dt>
                <dd>{stat.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </header>
  );
}
