import type { MetadataRoute } from "next";
import { buildSitemapEntries } from "@/app/utils/sitemap-entries";

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildSitemapEntries();
}
