import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const MONTH_YEAR = new Intl.DateTimeFormat("en", { month: "short", year: "numeric", timeZone: "UTC" });

export function formatMonthYear(iso: string | null) {
  if (!iso) return "Present";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : MONTH_YEAR.format(date);
}

export function formatRange(start: string, end: string | null) {
  return `${formatMonthYear(start)} — ${formatMonthYear(end)}`;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/** Small deterministic hash, used for generative cover art. */
export function hashString(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function isExternal(href: string) {
  return /^(https?:)?\/\//.test(href) || href.startsWith("mailto:");
}

export function newId() {
  return globalThis.crypto.randomUUID();
}
