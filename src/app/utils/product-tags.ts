/**
 * Normalizes `tags` into an array of tag id strings, defensively handling
 * products that predate the tags field (where it may be missing/undefined).
 */
export const toTagArray = (tags: unknown): string[] => {
  if (Array.isArray(tags)) {
    return tags.filter((t): t is string => typeof t === "string");
  }
  if (typeof tags === "string" && tags) {
    return [tags];
  }
  return [];
};
