/** Renders *accent* words from CMS headlines in the accent colour. */
export function AccentText({ text }: { text: string }) {
  return text.split(/(\*[^*]+\*)/).map((part, i) =>
    part.startsWith("*") && part.endsWith("*") && part.length > 2 ? (
      <span key={i} className="accent-serif">
        {part.slice(1, -1)}
      </span>
    ) : (
      part
    ),
  );
}
