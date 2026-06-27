/**
 * ─── Static UI Configuration ──────────────────────────────────────────────────
 * The PRODUCTS array has been removed — products are now fetched live from the
 * API via `client/src/services/productService.js`.
 *
 * Only static filter/UI configuration lives here: CATEGORIES, CONCERNS,
 * and SORT_OPTIONS. These are used by the sidebar, breadcrumbs, and hero cards.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Category definitions for the collection hero cards and breadcrumb trail.
 * The `slug` values must match the slugified DB `category_name` column
 * (i.e. "Hair Care" → "hair-care") produced by the service normalizer.
 */
export const CATEGORIES = [
  {
    slug:        "hair-care",
    label:       "Hair Care",
    description: "Root-to-tip rituals rooted in Ayurvedic wisdom",
    image:       "/products/hair-category.png",
  },
  {
    slug:        "skin-care",
    label:       "Skin Care",
    description: "Botanical formulas for skin that truly glows",
    image:       "/products/skin-category.png",
  },
];

/** Concern filter options shown in the sidebar. */
export const CONCERNS = [
  { value: "hair-fall", label: "Hair Fall" },
  { value: "dandruff",  label: "Dandruff"  },
  { value: "acne",      label: "Acne"      },
  { value: "glow",      label: "Glow"      },
  { value: "dryness", label: "Dryness" },
];

/** Sort dropdown options for the collection grid. */
export const SORT_OPTIONS = [
  { value: "newest",       label: "Newest"            },
  { value: "price-asc",    label: "Price: Low to High" },
  { value: "price-desc",   label: "Price: High to Low" },
  { value: "best-selling", label: "Best Selling"       },
];
