/**
 * Normalizes `category` into an array regardless of whether the API
 * returned the current `string[]` (category id refs) shape or a
 * not-yet-migrated legacy `string`.
 */
export const toCategoryArray = (category: unknown): string[] => {
  if (Array.isArray(category)) {
    return category.filter((c): c is string => typeof c === "string");
  }
  if (typeof category === "string" && category) {
    return [category];
  }
  return [];
};
