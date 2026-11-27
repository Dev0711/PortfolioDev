/**
 * Shown only when Supabase environment variables are missing. Makes it
 * explicit that the page is rendering starter content, not a live database.
 */
export function PreviewBanner() {
  return (
    <aside
      role="status"
      className="fixed bottom-4 left-1/2 z-[75] w-[min(92vw,40rem)] -translate-x-1/2 panel px-4 py-2.5 text-center font-mono text-[0.6875rem] leading-relaxed text-ink-dim"
    >
      <span className="text-signal">Preview mode</span> · Supabase is not connected. Showing starter content from{" "}
      <code>supabase/seed</code>. See the README to connect.
    </aside>
  );
}
