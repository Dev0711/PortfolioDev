"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Generative backdrop drawn on a 2D canvas: a live "system topology" where
 * packets travel between service nodes. It is the default hero background
 * when no image or video has been uploaded in the admin.
 *
 * Performance guards:
 *  - pauses when off-screen or when the tab is hidden
 *  - device-pixel-ratio capped at 2, fewer nodes on small screens
 *  - renders a single static frame under prefers-reduced-motion
 */

type Node = { x: number; y: number; vx: number; vy: number; r: number; hub: boolean };
type Packet = { from: number; to: number; t: number; speed: number };

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function AmbientCanvas({ className, seed = 7 }: { className?: string; seed?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const styles = getComputedStyle(canvas);
    const signal = styles.getPropertyValue("--signal").trim() || "#ff6a3d";
    const signalAlt = styles.getPropertyValue("--signal-alt").trim() || "#8b9cff";
    const ink = "236, 232, 223";

    const rand = mulberry32(seed);
    let width = 0;
    let height = 0;
    let nodes: Node[] = [];
    let edges: [number, number][] = [];
    let packets: Packet[] = [];
    let frame = 0;
    let running = false;
    let visible = true;
    const pointer = { x: -9999, y: -9999 };

    function build() {
      const rect = canvas!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.round(Math.min(64, Math.max(18, (width * height) / 26000)));
      nodes = Array.from({ length: count }, (_, i) => ({
        x: rand() * width,
        y: rand() * height,
        vx: (rand() - 0.5) * 0.16,
        vy: (rand() - 0.5) * 0.16,
        r: i % 7 === 0 ? 3 : 1.4,
        hub: i % 7 === 0,
      }));
      link();
      packets = Array.from({ length: Math.round(count / 3) }, () => spawn());
    }

    function link() {
      const max = Math.min(width, height) * 0.32;
      edges = [];
      for (let i = 0; i < nodes.length; i++) {
        const near: { j: number; d: number }[] = [];
        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue;
          const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
          if (d < max) near.push({ j, d });
        }
        near.sort((a, b) => a.d - b.d);
        for (const { j } of near.slice(0, nodes[i].hub ? 4 : 2)) {
          if (i < j || !edges.some(([a, b]) => a === j && b === i)) edges.push([i, j]);
        }
      }
    }

    function spawn(): Packet {
      const edge = edges[Math.floor(rand() * edges.length)] ?? [0, 0];
      const flip = rand() > 0.5;
      return { from: flip ? edge[0] : edge[1], to: flip ? edge[1] : edge[0], t: rand(), speed: 0.0025 + rand() * 0.004 };
    }

    function draw(step: boolean) {
      ctx!.clearRect(0, 0, width, height);

      if (step) {
        for (const n of nodes) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < -20 || n.x > width + 20) n.vx *= -1;
          if (n.y < -20 || n.y > height + 20) n.vy *= -1;
        }
      }

      ctx!.lineWidth = 1;
      for (const [a, b] of edges) {
        const na = nodes[a];
        const nb = nodes[b];
        const mx = (na.x + nb.x) / 2;
        const my = (na.y + nb.y) / 2;
        const near = Math.max(0, 1 - Math.hypot(mx - pointer.x, my - pointer.y) / 260);
        ctx!.strokeStyle = `rgba(${ink}, ${0.05 + near * 0.22})`;
        ctx!.beginPath();
        ctx!.moveTo(na.x, na.y);
        ctx!.lineTo(nb.x, nb.y);
        ctx!.stroke();
      }

      for (const n of nodes) {
        ctx!.fillStyle = n.hub ? signal : `rgba(${ink}, 0.45)`;
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx!.fill();
        if (n.hub) {
          ctx!.strokeStyle = `rgba(${ink}, 0.14)`;
          ctx!.beginPath();
          ctx!.arc(n.x, n.y, 9, 0, Math.PI * 2);
          ctx!.stroke();
        }
      }

      packets.forEach((p, i) => {
        if (step) p.t += p.speed;
        if (p.t >= 1) {
          packets[i] = { ...spawn(), t: 0 };
          return;
        }
        const a = nodes[p.from];
        const b = nodes[p.to];
        if (!a || !b) return;
        const x = a.x + (b.x - a.x) * p.t;
        const y = a.y + (b.y - a.y) * p.t;
        ctx!.fillStyle = i % 3 === 0 ? signalAlt : signal;
        ctx!.globalAlpha = Math.sin(p.t * Math.PI);
        ctx!.beginPath();
        ctx!.arc(x, y, 1.8, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.globalAlpha = 1;
      });
    }

    let ticks = 0;
    function loop() {
      if (!running) return;
      ticks++;
      if (ticks % 240 === 0) link(); // topology slowly re-forms as nodes drift
      draw(true);
      frame = requestAnimationFrame(loop);
    }

    function start() {
      if (running || reduce || !visible || document.hidden) return;
      running = true;
      frame = requestAnimationFrame(loop);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(frame);
    }

    build();
    draw(false);
    start();

    const resize = new ResizeObserver(() => {
      build();
      draw(false);
    });
    resize.observe(canvas);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);

    const onVisibility = () => (document.hidden ? stop() : start());
    const onPointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pointermove", onPointer, { passive: true });

    return () => {
      stop();
      resize.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointer);
    };
  }, [seed]);

  return <canvas ref={ref} aria-hidden className={cn("h-full w-full", className)} />;
}
