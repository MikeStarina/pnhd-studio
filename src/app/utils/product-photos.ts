import { IProduct } from "./types";
import { apiBaseUrl, CDN_URL } from "./constants";

export const PHOTO_PLACEHOLDER = `${CDN_URL}/no%20photo.png`;

/** Number of gallery slots rendered for legacy products without `photos`. */
export const LEGACY_GALLERY_SIZE = 4;

export type TPhotoSource = {
  cdnPhoto: string;
  apiPhoto: string | null;
};

export type TProductPhotoInput = Partial<
  Pick<IProduct, "photos" | "slug" | "galleryPhotos" | "image_url">
>;

/** Media URLs are either full CDN addresses or legacy API paths like /images/... */
export const absoluteMediaUrl = (url?: string | null): string => {
  if (!url) return "";
  return /^https?:\/\//i.test(url) ? url : `${apiBaseUrl}${url}`;
};

/** Alias for print / upload URLs (CDN absolute or legacy `/uploads/...`). */
export const resolveMediaUrl = absoluteMediaUrl;

/**
 * Resolves the photo at `index`: a migrated product serves it straight from
 * `photos`, a legacy one falls back to the slug-based CDN key and then to the
 * gallery path on the API.
 */
export const productPhotoSources = (
  product: TProductPhotoInput,
  index: number
): TPhotoSource => {
  const cdn = product.photos?.[index];
  if (cdn) {
    return { cdnPhoto: cdn, apiPhoto: null };
  }

  const legacyPath = product.galleryPhotos?.[index] ?? (index === 0 ? product.image_url : undefined);

  return {
    cdnPhoto: `${CDN_URL}/${product.slug}_${index}.jpg`,
    apiPhoto: legacyPath ? absoluteMediaUrl(legacyPath) : null,
  };
};

/** Ordered sources for the whole gallery. */
export const productGallerySources = (
  product: TProductPhotoInput
): TPhotoSource[] => {
  const count = product.photos?.length || LEGACY_GALLERY_SIZE;
  return Array.from({ length: count }, (_, index) =>
    productPhotoSources(product, index)
  );
};

/** Best available absolute URL for meta tags and structured data. */
export const productMainPhotoUrl = (product: TProductPhotoInput): string =>
  product.photos?.[0] ||
  absoluteMediaUrl(product.image_url) ||
  `${CDN_URL}/${product.slug}_0.jpg`;
