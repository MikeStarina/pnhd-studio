"use server";

import { revalidatePath, revalidateTag } from "next/cache";

const SHOP_LIST_PATHS = [
  "/shop",
  "/futbolki",
  "/hudi",
  "/longslivy",
  "/svitshoty",
  "/shoppery",
  "/kepki",
] as const;

/**
 * Bust Next.js Data Cache for product fetches + related shop pages.
 * Call after admin create / update / delete.
 * Pass previousSlug when the slug changed so the old card path is cleared too.
 */
export async function revalidateShopData(
  slug?: string,
  previousSlug?: string
) {
  revalidateTag("shopDataTag");

  for (const path of SHOP_LIST_PATHS) {
    revalidatePath(path);
  }

  if (slug) {
    revalidatePath(`/shop/${slug}`);
  }
  if (previousSlug && previousSlug !== slug) {
    revalidatePath(`/shop/${previousSlug}`);
  }

  revalidatePath("/sitemap.xml");
}

/**
 * Bust Next.js Data Cache for blog listing + post pages.
 * Call after admin create / update / delete.
 * Uses layout scope so /blog and all /blog/[slug] pages are regenerated.
 */
export async function revalidateBlogData(
  slug?: string,
  previousSlug?: string
) {
  revalidateTag("blogTag");
  revalidatePath("/blog", "layout");

  if (slug) {
    revalidatePath(`/blog/${slug}`, "page");
  }
  if (previousSlug && previousSlug !== slug) {
    revalidatePath(`/blog/${previousSlug}`, "page");
  }

  revalidatePath("/sitemap.xml");
}
