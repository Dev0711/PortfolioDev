import "server-only";
import { updateTag } from "next/cache";
import { CONTENT_TAGS, type ContentTag } from "@/lib/content/tags";

/**
 * Expire cached public content after a mutation. `updateTag` gives
 * read-your-own-writes: the next request renders fresh data, so publishing in
 * the admin updates the live site without a redeploy.
 */
export function publish(...tags: ContentTag[]) {
  for (const tag of tags) updateTag(CONTENT_TAGS[tag]);
}
