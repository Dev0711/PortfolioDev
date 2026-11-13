/** Strips the *accent* markers used in headlines, for metadata and plain text. */
export function plainHeadline(text: string) {
  return text.replace(/\*/g, "");
}
