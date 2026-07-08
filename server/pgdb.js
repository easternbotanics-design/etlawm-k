'use strict';
import dns from 'node:dns';
import dotenv from 'dotenv';
import { Pool } from 'pg';

if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

dotenv.config();
// ─── Connection Pool ──────────────────────────────────────────────────────────
const pool = process.env.DATABASE_URL
    ? new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    })
    : new Pool({
        host: process.env.PG_HOST,
        port: parseInt(process.env.PG_PORT, 10),
        database: process.env.PG_DATABASE,
        user: process.env.PG_USER,
        password: process.env.PG_PASSWORD,
    });

pool.on('error', (err) => {
    console.error('[pgdb] Unexpected pool error:', err.message);
});

// connectPG() will check if the server is able to connect with the database
const connectPG = async () => {
    const client = await pool.connect();
    try {
        console.log('[pgdb] PostgreSQL connected successfully.');
    } finally {
        client.release();
    }
}

const cmsReviews = {
    create: ({
        customer_name,
        product_name,
        product_link,
        rating,
        review,
        status = "published",
        sort_order = 0,
        is_active = true,
    }) =>
        query(
            `
      INSERT INTO cms_reviews (
        customer_name,
        product_name,
        product_link,
        rating,
        review,
        status,
        sort_order,
        is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
      `,
            [
                customer_name,
                product_name,
                product_link ?? null,
                rating,
                review,
                status,
                sort_order,
                is_active,
            ]
        ),

    findById: (id) =>
        query(
            `
      SELECT *
      FROM cms_reviews
      WHERE id = $1
      LIMIT 1
      `,
            [id]
        ),

    findAllAdmin: () =>
        query(
            `
      SELECT *
      FROM cms_reviews
      ORDER BY created_at DESC
      `
        ),

    findPublished: () =>
        query(
            `
      SELECT *
      FROM cms_reviews
      WHERE status = 'published'
        AND is_active = true
      ORDER BY sort_order ASC, created_at DESC
      `
        ),

    findByProductNameOrSlug: (value) =>
        query(
            `
      SELECT *
      FROM cms_reviews
      WHERE LOWER(product_name) = LOWER($1)
         OR product_link ILIKE '%' || $1 || '%'
      ORDER BY created_at DESC
      `,
            [value]
        ),

    update: (id, fields) => {
        const allowed = [
            "customer_name",
            "product_name",
            "product_link",
            "rating",
            "review",
            "status",
            "sort_order",
            "is_active",
        ];

        const sets = [];
        const vals = [];
        let i = 1;

        for (const key of allowed) {
            if (fields[key] !== undefined) {
                sets.push(`${key} = $${i++}`);
                vals.push(fields[key]);
            }
        }

        if (!sets.length) {
            throw new Error("No valid fields to update");
        }

        sets.push("updated_at = now()");
        vals.push(id);

        return query(
            `
      UPDATE cms_reviews
      SET ${sets.join(", ")}
      WHERE id = $${i}
      RETURNING *
      `,
            vals
        );
    },

    delete: (id) =>
        query(
            `
      DELETE FROM cms_reviews
      WHERE id = $1
      RETURNING *
      `,
            [id]
        ),
};

const cmsIngredients = {
    create: ({
        name,
        scientific_name,
        image_url,
        para1,
        para2,
        para3,
        status = "published",
        sort_order = 0,
        is_active = true,
    }) =>
        query(
            `
      INSERT INTO cms_ingredients (
        name,
        scientific_name,
        image_url,
        para1,
        para2,
        para3,
        status,
        sort_order,
        is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
      `,
            [
                name,
                scientific_name ?? null,
                image_url,
                para1,
                para2,
                para3,
                status,
                sort_order,
                is_active,
            ]
        ),

    findById: (id) =>
        query(
            `
      SELECT *
      FROM cms_ingredients
      WHERE id = $1
      LIMIT 1
      `,
            [id]
        ),

    findAllAdmin: () =>
        query(
            `
      SELECT *
      FROM cms_ingredients
      ORDER BY created_at DESC
      `
        ),

    findPublished: () =>
        query(
            `
      SELECT *
      FROM cms_ingredients
      WHERE status = 'published'
        AND is_active = true
      ORDER BY sort_order ASC, created_at DESC
      `
        ),

    update: (id, fields) => {
        const allowed = [
            "name",
            "scientific_name",
            "image_url",
            "para1",
            "para2",
            "para3",
            "status",
            "sort_order",
            "is_active",
        ];

        const sets = [];
        const vals = [];
        let i = 1;

        for (const key of allowed) {
            if (fields[key] !== undefined) {
                sets.push(`${key} = $${i++}`);
                vals.push(fields[key]);
            }
        }

        if (!sets.length) {
            throw new Error("No valid fields to update");
        }

        sets.push("updated_at = now()");
        vals.push(id);

        return query(
            `
      UPDATE cms_ingredients
      SET ${sets.join(", ")}
      WHERE id = $${i}
      RETURNING *
      `,
            vals
        );
    },

    delete: (id) =>
        query(
            `
      DELETE FROM cms_ingredients
      WHERE id = $1
      RETURNING *
      `,
            [id]
        ),
};

const productIngredients = {
    getByProductId: (productId) =>
        query(
            `SELECT i.*
       FROM cms_ingredients i
       INNER JOIN products_ingredient pi ON pi.ingredient_id = i.id
       WHERE pi.product_id = $1
       ORDER BY i.sort_order ASC, i.name ASC`,
            [productId]
        ),

    sync: async (productId, ingredientIds) => {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            // Delete existing relations
            await client.query(
                `DELETE FROM products_ingredient
         WHERE product_id = $1`,
                [productId]
            );

            // Insert new relations
            if (Array.isArray(ingredientIds) && ingredientIds.length > 0) {
                for (const ingredientId of ingredientIds) {
                    await client.query(
                        `INSERT INTO products_ingredient (product_id, ingredient_id)
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING`,
                        [productId, ingredientId]
                    );
                }
            }

            await client.query("COMMIT");
            return true;
        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    }
};

// helper function, just write query( -- sql query -- ) wherever in the code to access the database
const query = async (text, params = []) => {
    const start = Date.now();
    const res = await pool.query(text, params);
    console.log(`[pgdb] (${Date.now() - start}ms)`, text.slice(0, 80));
    return res;
}

// helper function to access the users table
const users = {
    /** Create a new user with phone or email */
    create: ({
        phone_number,
        email,
        password_hash,
        first_name,
        last_name,
        phone_verified = false,
        onboarding_step = 0,
        is_admin = false,
    }) =>
        query(
            `INSERT INTO users (
            phone_number,
            email,
            password_hash,
            first_name,
            last_name,
            phone_verified,
            onboarding_step,
            is_admin
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING
            id,
            phone_number,
            email,
            first_name,
            last_name,
            phone_verified,
            onboarding_step,
            is_admin,
            whatsapp_opt_in,
            created_at`,
            [
                phone_number ?? null,
                email ?? null,
                password_hash ?? null,
                first_name ?? null,
                last_name ?? null,
                phone_verified,
                onboarding_step,
                is_admin,
            ],
        ),

    findByPhone: (phone_number) =>
        query(`SELECT * FROM users WHERE phone_number = $1 LIMIT 1`, [phone_number]),

    findByEmail: (email) =>
        query(`SELECT * FROM users WHERE email = $1 LIMIT 1`, [email]),

    findById: (id) =>
        query(
            `SELECT id, phone_number, email, first_name, last_name,
                    onboarding_step, is_admin, is_active, last_login_at, created_at, whatsapp_opt_in
             FROM users WHERE id = $1 LIMIT 1`,
            [id]
        ),

    /** Partial update — only updates fields provided */
    update: (id, fields) => {
        const allowed = ['first_name', 'last_name', 'email', 'phone_number', 'password_hash',
            'phone_verified', 'onboarding_step', 'is_active', 'last_login_at',
            'whatsapp_opt_in', 'is_admin'];
        const sets = [];
        const vals = [];
        let i = 1;
        for (const key of allowed) {
            if (fields[key] !== undefined) { sets.push(`${key} = $${i++}`); vals.push(fields[key]); }
        }
        if (!sets.length) throw new Error('No valid fields to update');
        sets.push(`updated_at = now()`);
        vals.push(id);
        return query(
            `UPDATE users SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`,
            vals
        );
    },

    markPhoneVerified: (phone_number) =>
        query(
            `UPDATE users SET phone_verified = true, updated_at = now()
             WHERE phone_number = $1 RETURNING id`,
            [phone_number]
        ),

    touchLastLogin: (id) =>
        query(
            `UPDATE users SET last_login_at = now(), updated_at = now() WHERE id = $1`,
            [id]
        ),

    delete: (id) =>
        query(`DELETE FROM users WHERE id = $1`, [id]),

    findAll: () =>
        query(
            `SELECT id, phone_number, email, first_name, last_name,
                    onboarding_step, is_admin, is_active, last_login_at, created_at, whatsapp_opt_in
             FROM users ORDER BY created_at DESC`
        ),
};

// helper function to access the otp_codes table
// helper function to access the otp_codes table
const otpCodes = {
    create: ({
        phone_number,
        session_id,
        otp_hash,
        provider = "whatsapp",
        expires_at,
    }) =>
        query(
            `
            INSERT INTO otp_codes (
                phone_number,
                session_id,
                otp_hash,
                provider,
                expires_at
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, phone_number, session_id, otp_hash, provider, expires_at, created_at
            `,
            [phone_number, session_id, otp_hash, provider, expires_at]
        ),

    findLatest: (phone_number) =>
        query(
            `
            SELECT *
            FROM otp_codes
            WHERE phone_number = $1
              AND expires_at > now()
            ORDER BY created_at DESC
            LIMIT 1
            `,
            [phone_number]
        ),

    incrementAttempts: (id) =>
        query(
            `
            UPDATE otp_codes
            SET attempts = attempts + 1
            WHERE id = $1
            RETURNING *
            `,
            [id]
        ),

    deleteByPhone: (phone_number) =>
        query(
            `
            DELETE FROM otp_codes
            WHERE phone_number = $1
            `,
            [phone_number]
        ),

    deleteExpired: () =>
        query(
            `
            DELETE FROM otp_codes
            WHERE expires_at <= now()
            `
        ),
};

// helper function to access the user_sessions table
const userSessions = {
    create: ({ user_id, refresh_token_hash, user_agent, ip_address, expires_at }) =>
        query(
            `INSERT INTO user_sessions (user_id, refresh_token_hash, user_agent, ip_address, expires_at)
             VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at`,
            [user_id, refresh_token_hash, user_agent ?? null, ip_address ?? null, expires_at]
        ),

    findByUserId: (user_id) =>
        query(
            `SELECT * FROM user_sessions WHERE user_id = $1 AND expires_at > now()
             ORDER BY created_at DESC`,
            [user_id]
        ),

    deleteById: (id) =>
        query(`DELETE FROM user_sessions WHERE id = $1`, [id]),

    deleteByUserId: (user_id) =>
        query(`DELETE FROM user_sessions WHERE user_id = $1`, [user_id]),

    deleteExpired: () =>
        query(`DELETE FROM user_sessions WHERE expires_at <= now()`),
};

// ─── Addresses ────────────────────────────────────────────────────────────────
const addresses = {
    create: async ({ user_id, line1, city, state, pincode, is_default = false }) => {
        if (is_default) {
            await query(`UPDATE addresses SET is_default = false WHERE user_id = $1`, [user_id]);
        }
        return query(
            `INSERT INTO addresses (user_id, line1, city, state, pincode, is_default)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [user_id, line1, city, state, pincode, is_default]
        );
    },

    findByUser: (user_id) =>
        query(`SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC`, [user_id]),

    setDefault: async (id, user_id) => {
        await query(`UPDATE addresses SET is_default = false WHERE user_id = $1`, [user_id]);
        return query(
            `UPDATE addresses SET is_default = true WHERE id = $1 AND user_id = $2 RETURNING *`,
            [id, user_id]
        );
    },

    delete: (id, user_id) =>
        query(`DELETE FROM addresses WHERE id = $1 AND user_id = $2`, [id, user_id]),
};

// ─── Categories ───────────────────────────────────────────────────────────────
const categories = {
    create: ({ name, slug, subtitle, description, image_url, is_active = true }) =>
        query(
            `INSERT INTO categories (name, slug, subtitle, description, image_url, is_active)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [
                name,
                slug ?? null,
                subtitle ?? null,
                description ?? null,
                image_url ?? null,
                is_active,
            ]
        ),

    findAll: () =>
        query(`SELECT * FROM categories ORDER BY name`),

    findById: (id) =>
        query(`SELECT * FROM categories WHERE id = $1 LIMIT 1`, [id]),

    update: (id, fields) => {
        const allowed = [
            "name",
            "slug",
            "subtitle",
            "description",
            "image_url",
            "is_active",
        ];

        const sets = [];
        const vals = [];
        let i = 1;

        for (const key of allowed) {
            if (fields[key] !== undefined) {
                sets.push(`${key} = $${i++}`);
                vals.push(fields[key]);
            }
        }

        if (!sets.length) throw new Error("No valid fields to update");

        sets.push("updated_at = now()");
        vals.push(id);

        return query(
            `UPDATE categories
             SET ${sets.join(", ")}
             WHERE id = $${i}
             RETURNING *`,
            vals
        );
    },

    delete: (id) =>
        query(`DELETE FROM categories WHERE id = $1`, [id]),
};

// ─── Products ─────────────────────────────────────────────────────────────────
const products = {
    /** image_url is no longer stored on products — use productImages.add() separately */
    create: ({
        name,
        category_id,
        price,
        stock_qty = 0,
        description,
        slug,
        badge,
        original_price,
        is_new = false,
        concerns = [],

        // New CMS fields
        code,
        discount_value,
        discount_type = 'percentage',
        size_value,
        size_unit,
        ingredients,
        usage_instructions,
        benefits = [],
        status = 'active',
        is_active = true,
        is_draft = false,
        seo_title,
        seo_description,
    }) =>
        query(
            `INSERT INTO products (
                name,
                category_id,
                price,
                stock_qty,
                description,
                slug,
                badge,
                original_price,
                is_new,
                concerns,
                code,
                discount_value,
                discount_type,
                size_value,
                size_unit,
                ingredients,
                usage_instructions,
                benefits,
                status,
                is_active,
                is_draft,
                seo_title,
                seo_description
            )
            VALUES (
                $1, $2, $3, $4, $5,
                $6, $7, $8, $9, $10,
                $11, $12, $13, $14, $15,
                $16, $17, $18, $19, $20,
                $21, $22, $23
            )
            RETURNING *`,
            [
                name,
                category_id,
                price,
                stock_qty,
                description ?? null,
                slug ?? null,
                badge ?? null,
                original_price ?? null,
                is_new,
                concerns,

                code ?? null,
                discount_value ?? null,
                discount_type ?? 'percentage',
                size_value ?? null,
                size_unit ?? null,
                ingredients ?? null,
                usage_instructions ?? null,
                benefits,
                status ?? 'active',
                is_active,
                is_draft,
                seo_title ?? null,
                seo_description ?? null,
            ]
        ),

    findAll: ({ category_id, limit = 50, offset = 0, include_inactive = false } = {}) => {
        let whereClause = include_inactive ? '1=1' : 'p.is_active = true';

        if (category_id) {
            return query(
                `SELECT p.*, c.name AS category_name,
                        (SELECT image_url FROM product_images
                         WHERE product_id = p.id AND is_primary = true LIMIT 1) AS primary_image
                 FROM products p
                 LEFT JOIN categories c ON c.id = p.category_id
                 WHERE p.category_id = $1 AND ${whereClause}
                 ORDER BY p.created_at DESC LIMIT $2 OFFSET $3`,
                [category_id, limit, offset]
            );
        }

        return query(
            `SELECT p.*, c.name AS category_name,
                    (SELECT image_url FROM product_images
                     WHERE product_id = p.id AND is_primary = true LIMIT 1) AS primary_image
             FROM products p
             LEFT JOIN categories c ON c.id = p.category_id
             WHERE ${whereClause}
             ORDER BY p.created_at DESC LIMIT $1 OFFSET $2`,
            [limit, offset]
        );
    },

    findById: (id) =>
        query(
            `SELECT p.*, c.name AS category_name
             FROM products p
             LEFT JOIN categories c ON c.id = p.category_id
             WHERE p.id = $1 LIMIT 1`,
            [id]
        ),

    findBySlug: (slug) =>
        query(
            `SELECT p.*, c.name AS category_name,
                    (SELECT image_url FROM product_images
                     WHERE product_id = p.id AND is_primary = true LIMIT 1) AS primary_image
             FROM products p
             LEFT JOIN categories c ON c.id = p.category_id
             WHERE p.slug = $1 LIMIT 1`,
            [slug]
        ),

    search: (term, { limit = 20, offset = 0 } = {}) =>
        query(
            `SELECT p.*, c.name AS category_name,
                    (SELECT image_url FROM product_images
                     WHERE product_id = p.id AND is_primary = true LIMIT 1) AS primary_image
             FROM products p
             LEFT JOIN categories c ON c.id = p.category_id
             WHERE p.is_active = true AND p.name % $1
             ORDER BY similarity(p.name, $1) DESC
             LIMIT $2 OFFSET $3`,
            [term, limit, offset]
        ),

    update: (id, fields) => {
        const allowed = [
            'name',
            'category_id',
            'price',
            'stock_qty',
            'description',
            'is_active',
            'slug',
            'badge',
            'original_price',
            'is_new',
            'concerns',

            // New CMS fields
            'code',
            'discount_value',
            'discount_type',
            'size_value',
            'size_unit',
            'ingredients',
            'usage_instructions',
            'benefits',
            'status',
            'is_draft',
            'seo_title',
            'seo_description',
        ];

        const sets = [];
        const vals = [];
        let i = 1;

        for (const key of allowed) {
            if (fields[key] !== undefined) {
                sets.push(`${key} = $${i++}`);
                vals.push(fields[key]);
            }
        }

        if (!sets.length) throw new Error('No valid fields to update');

        sets.push(`updated_at = now()`);
        vals.push(id);

        return query(
            `UPDATE products SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`,
            vals
        );
    },

    adjustStock: (id, delta) =>
        query(
            `UPDATE products SET stock_qty = stock_qty + $1 WHERE id = $2 RETURNING id, stock_qty`,
            [delta, id]
        ),

    delete: (id) =>
        query(`DELETE FROM products WHERE id = $1`, [id]),
};

// ─── Product Images ───────────────────────────────────────────────────────────
const productImages = {
    /** Add an image to a product. If is_primary, clears the existing primary first. */
    add: async ({ product_id, image_url, is_primary = false, sort_order = 0 }) => {
        if (is_primary) {
            await query(
                `UPDATE product_images SET is_primary = false WHERE product_id = $1`,
                [product_id]
            );
        }
        return query(
            `INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [product_id, image_url, is_primary, sort_order]
        );
    },

    findByProduct: (product_id) =>
        query(
            `SELECT * FROM product_images WHERE product_id = $1 ORDER BY sort_order, id`,
            [product_id]
        ),

    setPrimary: async (id, product_id) => {
        await query(
            `UPDATE product_images SET is_primary = false WHERE product_id = $1`,
            [product_id]
        );
        return query(
            `UPDATE product_images SET is_primary = true WHERE id = $1 AND product_id = $2 RETURNING *`,
            [id, product_id]
        );
    },

    delete: (id, product_id) =>
        query(
            `DELETE FROM product_images WHERE id = $1 AND product_id = $2`,
            [id, product_id]
        ),
};

// ─── Inventory ────────────────────────────────────────────────────────────────
const inventory = {
    /** Initialise inventory row for a product (called after product creation) */
    init: (product_id, quantity_available = 0) =>
        query(
            `INSERT INTO inventory (product_id, quantity_available)
             VALUES ($1, $2)
             ON CONFLICT (product_id) DO NOTHING`,
            [product_id, quantity_available]
        ),

    findByProduct: (product_id) =>
        query(`SELECT * FROM inventory WHERE product_id = $1`, [product_id]),

    /** Reserve stock (moves qty from available → reserved) */
    reserve: (product_id, qty) =>
        query(
            `UPDATE inventory
             SET quantity_available = quantity_available - $1,
                 quantity_reserved  = quantity_reserved  + $1,
                 updated_at         = now()
             WHERE product_id = $2
               AND quantity_available >= $1
             RETURNING *`,
            [qty, product_id]
        ),

    /** Release reserved stock back to available (e.g. cancelled order) */
    release: (product_id, qty) =>
        query(
            `UPDATE inventory
             SET quantity_reserved  = quantity_reserved  - $1,
                 quantity_available = quantity_available + $1,
                 updated_at         = now()
             WHERE product_id = $2
             RETURNING *`,
            [qty, product_id]
        ),

    /** Confirm reservation (deduct reserved qty after fulfillment) */
    confirm: (product_id, qty) =>
        query(
            `UPDATE inventory
             SET quantity_reserved = quantity_reserved - $1,
                 updated_at        = now()
             WHERE product_id = $2
             RETURNING *`,
            [qty, product_id]
        ),
};

// ─── Carts ────────────────────────────────────────────────────────────────────
const carts = {
    /** Get or create a cart for a logged-in user */
    getOrCreateForUser: (user_id) =>
        query(
            `INSERT INTO carts (user_id)
             VALUES ($1)
             ON CONFLICT (user_id)
             DO UPDATE SET user_id = EXCLUDED.user_id
             RETURNING *`,
            [user_id],
        ),

    getOrCreateForGuest: (guest_id) =>
        query(
            `INSERT INTO carts (guest_id)
             VALUES ($1)
             ON CONFLICT (guest_id)
             DO UPDATE SET guest_id = EXCLUDED.guest_id
             RETURNING *`,
            [guest_id],
        ),

    findById: (id) =>
        query(`SELECT * FROM carts WHERE id = $1 LIMIT 1`, [id]),

    /** Merge guest cart into user cart on login */
    mergeGuestToUser: async (guest_id, user_id) => {
        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            let {
                rows: [userCart],
            } = await client.query(
                `SELECT *
                 FROM carts
                 WHERE user_id = $1
                 FOR UPDATE`,
                [user_id],
            );

            if (!userCart) {
                const {
                    rows: [createdCart],
                } = await client.query(
                    `INSERT INTO carts (user_id)
                     VALUES ($1)
                     ON CONFLICT (user_id)
                     DO UPDATE SET user_id = EXCLUDED.user_id
                     RETURNING *`,
                    [user_id],
                );

                userCart = createdCart;
            }

            const {
                rows: [guestCart],
            } = await client.query(
                `SELECT *
                 FROM carts
                 WHERE guest_id = $1
                 FOR UPDATE`,
                [guest_id],
            );

            if (!guestCart) {
                await client.query("COMMIT");
                return { rows: [userCart] };
            }

            await client.query(
                `INSERT INTO cart_items (
                    cart_id,
                    product_id,
                    quantity
                 )
                 SELECT
                    $1,
                    ci.product_id,
                    LEAST(ci.quantity, p.stock_qty)
                 FROM cart_items ci
                 JOIN products p
                   ON p.id = ci.product_id
                 WHERE ci.cart_id = $2
                   AND p.is_active = true
                   AND p.stock_qty > 0
                 ON CONFLICT (cart_id, product_id)
                 DO UPDATE SET quantity = LEAST(
                     cart_items.quantity + EXCLUDED.quantity,
                     (
                         SELECT stock_qty
                         FROM products
                         WHERE id = EXCLUDED.product_id
                     )
                 )`,
                [userCart.id, guestCart.id],
            );

            await client.query(
                `DELETE FROM carts
                 WHERE id = $1`,
                [guestCart.id],
            );

            await client.query("COMMIT");

            return { rows: [userCart] };
        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    },

    delete: (id) =>
        query(`DELETE FROM carts WHERE id = $1`, [id]),

    applyCoupon: ({ cart_id, coupon_id }) =>
        query(
            `
            UPDATE carts
            SET
              coupon_id = $2,
              updated_at = NOW()
            WHERE id = $1
            RETURNING *
            `,
            [cart_id, coupon_id]
        ),

    removeCoupon: (cart_id) =>
        query(
            `
            UPDATE carts
            SET
              coupon_id = NULL,
              updated_at = NOW()
            WHERE id = $1
            RETURNING *
            `,
            [cart_id]
        ),
};

// ─── Cart Items ───────────────────────────────────────────────────────────────
const cartItems = {
    /** Add item or update quantity if already present */
    upsert: ({ cart_id, product_id, quantity }) =>
        query(
            `INSERT INTO cart_items (cart_id, product_id, quantity)
             VALUES ($1, $2, $3)
             ON CONFLICT (cart_id, product_id)
             DO UPDATE SET quantity = EXCLUDED.quantity
             RETURNING *`,
            [cart_id, product_id, quantity]
        ),

    findByCart: (cart_id) =>
        query(
            `SELECT ci.*, p.name AS product_name, p.price,
                    (SELECT image_url FROM product_images
                     WHERE product_id = ci.product_id AND is_primary = true LIMIT 1) AS image_url
             FROM cart_items ci
             JOIN products p ON p.id = ci.product_id
             WHERE ci.cart_id = $1`,
            [cart_id]
        ),

    updateQuantity: ({ cart_id, product_id, quantity }) =>
        query(
            `UPDATE cart_items SET quantity = $1
             WHERE cart_id = $2 AND product_id = $3 RETURNING *`,
            [quantity, cart_id, product_id]
        ),

    remove: ({ cart_id, product_id }) =>
        query(
            `DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2`,
            [cart_id, product_id]
        ),

    clearCart: (cart_id) =>
        query(`DELETE FROM cart_items WHERE cart_id = $1`, [cart_id]
        ),

    applyCoupon: ({ cart_id, coupon_id }) =>
        query(
            `
        UPDATE carts
        SET
          coupon_id = $2,
          updated_at = NOW()
        WHERE id = $1
        RETURNING *
        `,
            [cart_id, coupon_id],
        ),

    removeCoupon: (cart_id) =>
        query(
            `
        UPDATE carts
        SET
          coupon_id = NULL,
          updated_at = NOW()
        WHERE id = $1
        RETURNING *
        `,
            [cart_id],
        ),
};

//----Coupons--------------------------------------------------------------------

export const coupons = {
    findValidByCode: (code) =>
        query(
            `
      SELECT *
      FROM coupons
      WHERE UPPER(code) = UPPER($1)
        AND is_active = TRUE
        AND (starts_at IS NULL OR starts_at <= NOW())
        AND (expires_at IS NULL OR expires_at > NOW())
      LIMIT 1
      `,
            [code],
        ),
};

// ─── Orders ───────────────────────────────────────────────────────────────────
const orders = {
    /**
     * Place an order.
     * items: [{ product_id, quantity, unit_price }]
     * shipping: { name, line1, city, state, pincode }
     */
    create: async ({ user_id, shipping, items }) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const total = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);
            const { rows: [order] } = await client.query(
                `INSERT INTO orders
                    (user_id, shipping_name, shipping_line1, shipping_city,
                     shipping_state, shipping_pincode, total)
                 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
                [
                    user_id,
                    shipping.name, shipping.line1, shipping.city,
                    shipping.state, shipping.pincode,
                    total.toFixed(2),
                ]
            );
            for (const { product_id, quantity, unit_price } of items) {
                await client.query(
                    `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
                     VALUES ($1, $2, $3, $4)`,
                    [order.id, product_id, quantity, unit_price]
                );

                // Deduct from products.stock_qty — guard prevents going negative
                const { rowCount: stockRows } = await client.query(
                    `UPDATE products
                     SET stock_qty = stock_qty - $1, updated_at = now()
                     WHERE id = $2 AND stock_qty >= $1`,
                    [quantity, product_id]
                );
                if (stockRows === 0) {
                    throw new Error(`Insufficient stock for product ${product_id}`);
                }

                // Keep inventory table in sync — moves qty: available → reserved
                const { rowCount: invRows } = await client.query(
                    `UPDATE inventory
                     SET quantity_available = quantity_available - $1,
                         quantity_reserved  = quantity_reserved  + $1,
                         updated_at         = now()
                     WHERE product_id = $2 AND quantity_available >= $1`,
                    [quantity, product_id]
                );
                // inventory row may not exist yet (legacy products); skip silently
                if (invRows === 0) {
                    // Attempt a best-effort insert so the row exists going forward
                    await client.query(
                        `INSERT INTO inventory (product_id, quantity_available, quantity_reserved)
                         VALUES ($1, 0, 0)
                         ON CONFLICT (product_id) DO NOTHING`,
                        [product_id]
                    );
                }
            }
            await client.query('COMMIT');
            return { rows: [order] };
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    },

    findAllAdmin: () =>
        query(
            `SELECT o.*, u.email, u.phone_number, u.first_name, u.last_name
             FROM orders o
             LEFT JOIN users u ON u.id = o.user_id
             ORDER BY o.created_at DESC`
        ),

    findByUser: (user_id) =>
        query(
            `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
            [user_id]
        ),

    findById: (id) =>
        query(`SELECT * FROM orders WHERE id = $1 LIMIT 1`, [id]),

    getItems: (order_id) =>
        query(
            `SELECT oi.*, p.name AS product_name,
                    (SELECT image_url FROM product_images
                     WHERE product_id = oi.product_id AND is_primary = true LIMIT 1) AS image_url
             FROM order_items oi
             JOIN products p ON p.id = oi.product_id
             WHERE oi.order_id = $1`,
            [order_id]
        ),

    updateStatus: (id, status) =>
        query(
            `UPDATE orders SET status = $1, updated_at = now()
             WHERE id = $2 RETURNING id, status`,
            [status, id]
        ),

    updatePaymentOrderId: (order_id, razorpay_order_id) =>
        query(
            `UPDATE orders SET razorpay_order_id = $1, updated_at = now()
             WHERE id = $2 RETURNING *`,
            [razorpay_order_id, order_id]
        ),

    updatePaymentFailedOrAbandoned: (order_id, razorpay_payment_id, status) =>
        query(
            `UPDATE orders 
             SET razorpay_payment_id = $1, 
                 status = $2, 
                 updated_at = now()
             WHERE id = $3 
             RETURNING *`,
            [razorpay_payment_id, status, order_id]
        ),

    markPaymentPaid: async ({
        order_id,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
    }) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const { rows: [order] } = await client.query(
                `UPDATE orders
                 SET status = 'paid',
                     razorpay_order_id = $1,
                     razorpay_payment_id = $2,
                     paid_at = now(),
                     updated_at = now()
                 WHERE id = $3
                 RETURNING *`,
                [razorpay_order_id, razorpay_payment_id, order_id]
            );

            if (order) {
                const { rows: [cart] } = await client.query(
                    `SELECT id FROM carts WHERE user_id = $1`,
                    [order.user_id]
                );

                if (cart) {
                    const { rows: orderItems } = await client.query(
                        `SELECT product_id FROM order_items WHERE order_id = $1`,
                        [order.id]
                    );

                    const productIds = orderItems.map(item => item.product_id);

                    if (productIds.length > 0) {
                        await client.query(
                            `DELETE FROM cart_items
                             WHERE cart_id = $1 AND product_id = ANY($2::uuid[])`,
                            [cart.id, productIds]
                        );
                    }

                    await client.query(
                        `UPDATE carts SET coupon_id = NULL WHERE id = $1`,
                        [cart.id]
                    );
                }
            }

            await client.query('COMMIT');
            return { rows: [order] };
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    },
};

// ─── Reviews ──────────────────────────────────────────────────────────────────
const reviews = {
    upsert: ({ user_id, product_id, rating, comment }) =>
        query(
            `INSERT INTO reviews (user_id, product_id, rating, comment)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (user_id, product_id)
             DO UPDATE SET rating    = EXCLUDED.rating,
                           comment   = EXCLUDED.comment,
                           updated_at = now()
             RETURNING *`,
            [user_id, product_id, rating, comment]
        ),

    findByProduct: (product_id) =>
        query(
            `SELECT r.*,
                    u.first_name || ' ' || COALESCE(u.last_name, '') AS user_name
             FROM reviews r
             JOIN users u ON u.id = r.user_id
             WHERE r.product_id = $1 ORDER BY r.created_at DESC`,
            [product_id]
        ),

    avgRating: (product_id) =>
        query(
            `SELECT ROUND(AVG(rating)::NUMERIC, 1) AS avg_rating, COUNT(*) AS total
             FROM reviews WHERE product_id = $1`,
            [product_id]
        ),

    delete: (user_id, product_id) =>
        query(`DELETE FROM reviews WHERE user_id = $1 AND product_id = $2`, [user_id, product_id]),
};

// ─── Admin Phones ─────────────────────────────────────────────────────────────
const adminPhones = {
    isAdmin: async (phone_number) => {
        const { rows } = await query(
            `SELECT 1 FROM admin_phones WHERE phone_number = $1 LIMIT 1`,
            [phone_number]
        );
        return rows.length > 0;
    },
    add: (phone_number) =>
        query(`INSERT INTO admin_phones (phone_number) VALUES ($1) ON CONFLICT DO NOTHING`, [phone_number]),
    remove: (phone_number) =>
        query(`DELETE FROM admin_phones WHERE phone_number = $1`, [phone_number]),
    findAll: () =>
        query(`SELECT * FROM admin_phones ORDER BY created_at DESC`),
};

// ─── Admin Settings ───────────────────────────────────────────────────────────
const adminSettings = {
    getAll: () => query(`SELECT * FROM admin_settings ORDER BY key`),
    get: (key) => query(`SELECT * FROM admin_settings WHERE key = $1 LIMIT 1`, [key]),
    set: (key, value) => query(
        `INSERT INTO admin_settings (key, value, updated_at) VALUES ($1, $2, now())
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
         RETURNING *`,
        [key, value]
    )
};

// ─── Customer Complaints ──────────────────────────────────────────────────────
const customerComplaints = {
    create: ({ user_id, complaint }) =>
        query(
            `INSERT INTO customer_complaints (user_id, complaint)
             VALUES ($1, $2)
             RETURNING *`,
            [user_id, complaint]
        ),

    findByUser: (user_id) =>
        query(
            `SELECT * FROM customer_complaints
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [user_id]
        )
};

// helper function to access the homepage_questions table
const homepageQuestions = {
    create: ({ name, email, phone_number, subject, message }) =>
        query(
            `INSERT INTO homepage_questions (name, email, phone_number, subject, message)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [name, email, phone_number, subject, message]
        ),

    findAll: () =>
        query(
            `SELECT * FROM homepage_questions
             ORDER BY created_at DESC`
        )
};

// ─── Exports ──────────────────────────────────────────────────────────────────
const db = {
    cmsReviews,
    cmsIngredients,
    productIngredients,
    pool,
    query,
    connectPG,
    users,
    otpCodes,
    userSessions,
    addresses,
    categories,
    products,
    productImages,
    inventory,
    carts,
    cartItems,
    orders,
    reviews,
    adminPhones,
    adminSettings,
    customerComplaints,
    homepageQuestions,
};

export default db;