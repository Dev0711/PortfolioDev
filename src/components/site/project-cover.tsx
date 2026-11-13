import Image from "next/image";
import { BackgroundVideo } from "@/components/site/media-backdrop";
import type { Project } from "@/lib/types";
import { cn, hashString } from "@/lib/utils";

type CoverProject = Pick<Project, "slug" | "title" | "cover_url" | "cover_video_url" | "category">;

/**
 * Project visual. Order of preference: uploaded video loop, uploaded image,
 * then a deterministic generative diagram — never stock imagery standing in
 * for a real screenshot.
 */
export function ProjectCover({
  project,
  className,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  priority = false,
}: {
  project: CoverProject;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-surface", className)}>
      {project.cover_video_url ? (
        <BackgroundVideo
          src={project.cover_video_url}
          poster={project.cover_url ?? undefined}
          className="!opacity-100"
        />
      ) : project.cover_url ? (
        <Image
          src={project.cover_url}
          alt={`${project.title} — project visual`}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <GenerativeCover seed={project.slug} label={project.category} />
      )}
    </div>
  );
}

function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Abstract architecture diagram, unique per slug. */
export function GenerativeCover({ seed, label }: { seed: string; label?: string }) {
  const random = rng(hashString(seed));
  const W = 800;
  const H = 600;
  const cols = 4;
  const rows = 3;

  const nodes = Array.from({ length: cols * rows }, (_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return {
      x: 130 + col * 180 + (random() - 0.5) * 60,
      y: 130 + row * 170 + (random() - 0.5) * 50,
      w: 70 + random() * 60,
      h: 34 + random() * 22,
      on: random() > 0.35,
      hot: false,
    };
  }).filter((n) => n.on);

  if (nodes.length > 0) nodes[Math.floor(random() * nodes.length)].hot = true;

  const links = nodes.flatMap((a, i) =>
    nodes
      .slice(i + 1)
      .filter((b) => Math.hypot(a.x - b.x, a.y - b.y) < 260 && random() > 0.3)
      .map((b) => ({ a, b })),
  );

  const rings = 3 + Math.floor(random() * 3);
  const cx = 200 + random() * 400;
  const cy = 150 + random() * 300;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      role="img"
      aria-label="Abstract system diagram"
    >
      <defs>
        <pattern id={`grid-${seed}`} width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="var(--line)" strokeWidth="1" />
        </pattern>
        <radialGradient id={`glow-${seed}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--signal)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width={W} height={H} fill="var(--surface)" />
      <rect width={W} height={H} fill={`url(#grid-${seed})`} />
      <circle cx={cx} cy={cy} r="280" fill={`url(#glow-${seed})`} />

      {Array.from({ length: rings }, (_, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={60 + i * 55}
          fill="none"
          stroke="var(--line-strong)"
          strokeWidth="1"
          strokeDasharray={i % 2 ? "2 8" : undefined}
        />
      ))}

      {links.map(({ a, b }, i) => (
        <path
          key={i}
          d={`M${a.x} ${a.y} H${(a.x + b.x) / 2} V${b.y} H${b.x}`}
          fill="none"
          stroke="var(--line-strong)"
          strokeWidth="1"
        />
      ))}

      {nodes.map((n, i) => (
        <g key={i}>
          <rect
            x={n.x - n.w / 2}
            y={n.y - n.h / 2}
            width={n.w}
            height={n.h}
            rx="6"
            fill={n.hot ? "var(--signal)" : "var(--surface-2)"}
            stroke={n.hot ? "var(--signal)" : "var(--line-strong)"}
            strokeWidth="1"
          />
          <rect
            x={n.x - n.w / 2 + 10}
            y={n.y - 2}
            width={n.w * 0.45}
            height="4"
            rx="2"
            fill={n.hot ? "#0a0b0d" : "var(--ink-faint)"}
            opacity={n.hot ? 0.7 : 0.6}
          />
        </g>
      ))}

      {label ? (
        <text
          x="32"
          y={H - 32}
          fill="var(--ink-faint)"
          fontFamily="var(--font-mono)"
          fontSize="13"
          letterSpacing="2"
        >
          {label.toUpperCase()}
        </text>
      ) : null}
    </svg>
  );
}
