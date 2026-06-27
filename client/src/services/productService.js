//api layer for all product related api calls
const API = import.meta.env.VITE_SERVER_API;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Derive a URL-safe slug from a product name.
 * e.g. "Botanical Hair Serum" → "botanical-hair-serum"
 */
function slugify(name = '') {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
}

/**
 * Resolve an image URL.
 * - If the backend returns an absolute URL (http/https), use it as-is.
 * - If it returns a relative path starting with "/", serve it from the
 *   Vite dev-server public folder (which mirrors the same origin).
 * - Falls back to a neutral placeholder so the UI never shows a broken image.
 */
 function resolveImage(url) {
   if (!url) {
     return "/products/placeholder.png";
   }
 
   if (
     url.startsWith("http://") ||
     url.startsWith("https://")
   ) {
     return url;
   }
 
   return `${API}${url.startsWith("/") ? url : `/${url}`}`;
 }
 
/**
 * Map a raw DB product row → the shape the UI components expect.
 *
 * DB fields present:  id, name, category_id, category_name, price,
 *                     stock_qty, description, primary_image, is_active,
 *                     created_at, avg_rating (on single-product fetch)
 *
 * UI fields needed:   id, slug, name, subtitle, category, description,
 *                     price, originalPrice, image, badge, concerns,
 *                     isNew, rating, reviews
 */
function normalizeProduct(raw) {
    if (!raw) return null;

    const slug = raw.slug ?? slugify(raw.name);

    // Derive a frontend-style category slug from the DB category name.
    // e.g. "Hair Care" → "hair-care"
    const categorySlug = raw.category_slug
        ?? (raw.category_name ? slugify(raw.category_name) : 'uncategorized');

    return {
        // Core identity
        id: raw.id,
        slug,
    
        // Display strings
        name: raw.name ?? '',
        subtitle: raw.category_name ?? '',
        category: categorySlug,
        categoryId: raw.category_id ?? null,
    
        // CMS fields
        code: raw.code ?? null,
        status: raw.status ?? 'active',
    
        // Long copy
        description: raw.description ?? '',
        ingredients: raw.ingredients ?? '',
        usageInstructions: raw.usage_instructions ?? raw.usageInstructions ?? '',
        benefits: Array.isArray(raw.benefits)
            ? raw.benefits
            : raw.benefits
                ? [raw.benefits]
                : [],
    
        // Pricing
        price: Number(raw.price) || 0,
        originalPrice: raw.original_price ? Number(raw.original_price) : null,
        discountValue: raw.discount_value ? Number(raw.discount_value) : null,
        discountType: raw.discount_type ?? null,
    
        // Size / quantity
        sizeValue: raw.size_value ? Number(raw.size_value) : null,
        sizeUnit: raw.size_unit ?? null,
    
        // Image — primary_image is the URL stored in product_images
        image: resolveImage(raw.primary_image ?? raw.image_url),
    
        // Badge / flags
        badge: raw.badge ?? null,
        concerns: Array.isArray(raw.concerns) ? raw.concerns : [],
        isNew: raw.is_new ?? false,
        isActive: raw.is_active ?? true,
        isDraft: raw.is_draft ?? false,
    
        // SEO
        seoTitle: raw.seo_title ?? '',
        seoDescription: raw.seo_description ?? '',
    
        // Ratings
        rating: raw.avg_rating ? Number(raw.avg_rating) : 0,
        reviews: raw.total ? Number(raw.total) : 0,
    
        // Stock
        stockQty: raw.stock_qty ?? 0,
    };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch all active products.
 * Supports optional category filtering via the backend's ?category_id= param,
 * but because the frontend works with category *slugs* (not IDs) we fetch
 * everything and do client-side filtering — keeping parity with the old flow.
 *
 * @param {boolean} includeInactive Whether to request inactive products (requires admin permissions).
 * @returns {Promise<Array>}  Array of normalised product objects.
 */
 export async function getProducts(includeInactive = false) {
   const token = localStorage.getItem("token");
   const headers = {};
 
   if (token) {
     headers.Authorization = `Bearer ${token}`;
   }
 
   const query = includeInactive
     ? "?include_inactive=true"
     : "";
 
   const response = await fetch(
     `${API}/api/product${query}`,
     { headers },
   );
 
   if (!response.ok) {
     const err = await response.json().catch(() => ({}));
 
     throw new Error(
       err.message ??
         `Failed to fetch products (${response.status})`,
     );
   }
 
   const data = await response.json();
   const raw = Array.isArray(data.products)
     ? data.products
     : [];
 
   return raw.map(normalizeProduct);
 }

/**
 * Fetch a single product by its slug.
 *
 * The backend only exposes /api/products/:id (numeric).  We therefore fetch
 * all products and find the matching slug client-side.  This is cheap because
 * the collection is small and results are already cached by the browser HTTP
 * cache on subsequent requests.
 *
 * @param {string} slug
 * @returns {Promise<object|null>}  Normalised product, or null if not found.
 */
export async function getProductBySlug(slug) {
    const products = await getProducts();
    return products.find(p => p.slug === slug) ?? null;
}

/**
 * Fetch a single product by its database ID.
 *
 * @param {number|string} id
 * @returns {Promise<object|null>} Normalised product, or null if not found.
 */
 export async function getProductById(id) {
   const response = await fetch(
     `${API}/api/product/${id}`,
   );
 
   if (!response.ok) {
     const err = await response.json().catch(() => ({}));
 
     throw new Error(
       err.message ??
         `Failed to fetch product (${response.status})`,
     );
   }
 
   const data = await response.json();
 
   return normalizeProduct(data.product);
 }


/**
 * Delete a product by database ID.
 *
 * @param {number|string} id
 * @returns {Promise<object>} Backend response.
 */
 export async function deleteProduct(id) {
   const token = localStorage.getItem("token");
 
   if (!token) {
     throw new Error("Admin authentication is required.");
   }
 
   const response = await fetch(
     `${API}/api/admin/products/${id}`,
     {
       method: "DELETE",
       headers: {
         Authorization: `Bearer ${token}`,
       },
     },
   );
 
   if (!response.ok) {
     const err = await response.json().catch(() => ({}));
 
     throw new Error(
       err.message ??
         `Failed to delete product (${response.status})`,
     );
   }
 
   return response.json();
 }
