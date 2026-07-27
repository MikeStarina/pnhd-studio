import type { MetadataRoute } from "next";
import { SITE_INFO } from "@/app/constants";
import { getPosts, getShopData } from "@/app/utils/constants";
import methodsData from "@/app/utils/print-methods-data";
import { ssOptions } from "@/app/utils/method-options-data";
import { textileOptions } from "@/app/utils/textile-options-data";
import { printsOptions } from "@/app/utils/prints-options-data";
import type { IProduct } from "@/app/utils/types";

type SitemapEntry = MetadataRoute.Sitemap[number];

const CATEGORY_PAGES: Array<{ path: string; productType: string }> = [
  { path: "/futbolki", productType: "tshirt" },
  { path: "/hudi", productType: "hoodie" },
  { path: "/longslivy", productType: "longsleeve" },
  { path: "/svitshoty", productType: "sweatshirt" },
  { path: "/shoppery", productType: "totebag" },
  { path: "/kepki", productType: "cap" },
];

function absoluteUrl(path: string): string {
  if (path === "/") return `${SITE_INFO.domain}/`;
  return `${SITE_INFO.domain}${path.startsWith("/") ? path : `/${path}`}`;
}

function entry(
  path: string,
  priority: number,
  changeFrequency: NonNullable<SitemapEntry["changeFrequency"]>,
  lastModified?: Date
): SitemapEntry {
  return {
    url: absoluteUrl(path),
    priority,
    changeFrequency,
    ...(lastModified ? { lastModified } : {}),
  };
}

/** Parses blog dates like "27.07.2024" or ISO strings. */
export function parseContentDate(value?: string | Date | null): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value;
  }

  const dotted = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (dotted) {
    const date = new Date(
      Number(dotted[3]),
      Number(dotted[2]) - 1,
      Number(dotted[1])
    );
    return Number.isNaN(date.getTime()) ? undefined : date;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function maxDate(dates: Array<Date | undefined>): Date | undefined {
  const valid = dates.filter((d): d is Date => Boolean(d));
  if (valid.length === 0) return undefined;
  return valid.reduce((latest, current) =>
    current.getTime() > latest.getTime() ? current : latest
  );
}

function productUpdatedAt(product: IProduct): Date | undefined {
  return parseContentDate(product.updatedAt ?? product.createdAt);
}

export async function buildSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const [products, blogPayload] = await Promise.all([
    getShopData(),
    getPosts(),
  ]);

  const posts = blogPayload?.posts ?? [];
  const productList: IProduct[] = Array.isArray(products) ? products : [];

  const entries: MetadataRoute.Sitemap = [
    entry("/", 1.0, "daily"),
    entry(
      "/shop",
      0.9,
      "weekly",
      maxDate(productList.map(productUpdatedAt))
    ),
    entry("/methods", 0.9, "weekly"),
  ];

  for (const category of CATEGORY_PAGES) {
    const categoryProducts = productList.filter(
      (p) => p.type === category.productType
    );
    entries.push(
      entry(
        category.path,
        0.8,
        "weekly",
        maxDate(categoryProducts.map(productUpdatedAt))
      )
    );
  }

  for (const method of methodsData) {
    if (!method.slug) continue;
    entries.push(entry(`/methods/${method.slug}`, 0.8, "monthly"));
  }

  for (const option of ssOptions) {
    if (!option.slug || !option.type) continue;
    entries.push(
      entry(`/methods/${option.slug}/${option.type}`, 0.7, "monthly")
    );
  }

  for (const product of productList) {
    if (!product.slug) continue;
    entries.push(
      entry(`/shop/${product.slug}`, 0.7, "daily", productUpdatedAt(product))
    );
  }

  const postDates = posts.map((post) => parseContentDate(post.createdAt));
  entries.push(entry("/blog", 0.7, "weekly", maxDate(postDates)));

  for (const post of posts) {
    if (!post.slug || post.isActive === false) continue;
    entries.push(
      entry(
        `/blog/${post.slug}`,
        0.6,
        "monthly",
        parseContentDate(post.createdAt)
      )
    );
  }

  for (const textile of textileOptions) {
    if (!textile.slug) continue;
    entries.push(entry(`/textile/${textile.slug}`, 0.6, "monthly"));
  }

  for (const print of printsOptions) {
    if (!print.slug) continue;
    entries.push(entry(`/prints/${print.slug}`, 0.6, "monthly"));
  }

  entries.push(
    entry("/contacts", 0.5, "yearly"),
    entry("/loyalty", 0.5, "yearly"),
    entry("/howto", 0.5, "yearly"),
    entry("/privacy", 0.5, "yearly"),
    entry("/oferta", 0.5, "yearly")
  );

  const seen = new Set<string>();
  return entries.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}
