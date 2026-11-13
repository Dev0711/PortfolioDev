"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

function format(timezone: string) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: timezone,
    }).format(new Date());
  } catch {
    return "";
  }
}

/** Live local time for the profile's timezone. Renders after hydration only. */
export function LocalClock({ timezone, className }: { timezone: string; className?: string }) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => setTime(format(timezone));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [timezone]);

  return (
    <span className={className} suppressHydrationWarning>
      <span className="tabular-nums">{time || "--:--:--"}</span>
    </span>
  );
}

export function CurrentYear() {
  // Client-only value: empty on the server, the real year after hydration.
  const year = useSyncExternalStore(
    () => () => {},
    () => new Date().getFullYear(),
    () => null,
  );
  return <span>{year ?? ""}</span>;
}
