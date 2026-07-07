import db from "../pgdb.js";
import multer from "multer";
import axios from "axios";
import crypto from "crypto";
import path from "path";
import dotenv from 'dotenv';
dotenv.config();


//get
const getAllProducts = async (req, res) => {
  const { category_id, limit, offset } = req.query;
  try {
    const { rows } = await db.products.findAll({
      category_id: category_id ? parseInt(category_id) : undefined,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
    });
    res.json({ success: true, products: rows });
  } catch (err) {
    console.error("[get products]", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
}

//get
const getProduct = async (req, res) => {
  try {
    const { rows } = await db.products.findById(req.params.id);
    if (!rows.length)
      return res.status(404).json({ success: false, message: "Product not found." });

    const { rows: [rating] } = await db.reviews.avgRating(req.params.id);
    res.json({ success: true, product: { ...rows[0], ...rating } });
  } catch (err) {
    console.error("[get product]", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
}

//get
const productImages = async (req, res) => {
  try {
    const { rows } = await db.productImages.findByProduct(req.params.id);
    res.json({ success: true, images: rows });
  } catch (err) {
    console.error("[get product images]", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
}

//---Admin---

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [ "image/jpeg", "image/png", "image/webp" ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG and WebP images are allowed."));
    }

    cb(null, true);
  },
})

//post
const uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No image file was uploaded.",
    });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_KEY;

  const bucketName = req.query.bucket || req.body.bucket || "product-images";

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({
      success: false,
      message: "Supabase storage is not configured.",
    });
  }

  try {
    const originalExtension = path
      .extname(req.file.originalname)
      .toLowerCase();

    const allowedExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
    ];

    const extension = allowedExtensions.includes(
      originalExtension,
    )
      ? originalExtension
      : `.${req.file.mimetype.split("/")[1]}`;

    const prefix = bucketName === "category-images" ? "category" : "product";
    const fileName =
      `${prefix}-${Date.now()}-` +
      `${crypto.randomUUID()}${extension}`;

    const encodedFileName = encodeURIComponent(fileName);

    await axios.post(
      `${supabaseUrl}/storage/v1/object/` +
        `${bucketName}/${encodedFileName}`,
      req.file.buffer,
      {
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
          apikey: supabaseKey,
          "Content-Type": req.file.mimetype,
          "x-upsert": "false",
        },
        maxBodyLength: Infinity,
      },
    );

    const publicUrl =
      `${supabaseUrl}/storage/v1/object/public/` +
      `${bucketName}/${encodedFileName}`;

    return res.status(201).json({
      success: true,
      url: publicUrl,
      file_name: fileName,
    });
  } catch (err) {
    console.error(
      "[upload image to Supabase]",
      err.response?.data ?? err.message,
    );

    return res.status(500).json({
      success: false,
      message:
        err.response?.data?.message ??
        "Failed to upload image.",
    });
  }
};

//post
const addProduct = async (req, res) => {
  const {
    name, slug, code, category_id, badge,
    price, original_price, discount_value, discount_type,
    stock_qty, size_value, size_unit,
    description, ingredients, usage_instructions, benefits,
    status, is_active, is_draft, 
    seo_title, seo_description, 
    is_new, concerns,
  } = req.body;

  if (!name?.trim() || price === undefined || price === null) {
    return res.status(400).json({
      success: false,
      message: "Name and price are required.",
    });
  }

  try {
    const { rows: [product] } = await db.products.create({
      name, slug, code, category_id, badge,
      price, original_price, discount_value, discount_type,
      stock_qty, size_value, size_unit,
      description, ingredients, usage_instructions, benefits,
      status, is_active, is_draft, 
      seo_title, seo_description, 
      is_new, concerns,
    }); 

    if (!product) {
      return res.status(500).json({
        success: false,
        message: "Product could not be created.",
      });
    }

    await db.inventory.init(product.id, stock_qty ?? 0);

    res.status(201).json({ success: true, product });
  } catch (err) {
    console.error("[create product]", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
}

//patch
const updateProduct = async (req, res) => {
  try {
    const { rows: [product] } = await db.products.update(req.params.id, req.body);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }
    
    res.json({ success: true, product });
  } catch (err) {
    console.error("[update product]", err);
    res.status(500).json({ success: false, message: err.message || "Server error." });
  }
}

//delete
const deleteProduct = async (req, res) => {
  try {
    await db.products.delete(req.params.id);

    res.json({ success: true, message: "Product deleted." });
  } catch (err) {
    console.error("[delete product]", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
}

//post
const addProductImage = async (req, res) => {
  const { image_url, is_primary, sort_order } = req.body;
  if (!image_url)
    return res.status(400).json({ success: false, message: "image_url is required." });
  try {
    const { rows: [img] } = await db.productImages.add({
      product_id: req.params.id,
      image_url,
      is_primary,
      sort_order,
    });
    res.status(201).json({ success: true, image: img });
  } catch (err) {
    console.error("[add product image]", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
}

//patch
const setProductImagePrimary = async (req, res) => {
  try {
    const { rows: [img] } = await db.productImages.setPrimary(req.params.id, req.params.product_id);
    res.json({ success: true, image: img });
  } catch (err) {
    console.error("[set primary image]", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
}

//delete
const deleteProductImage = async (req, res) => {
  try {
    await db.productImages.delete(req.params.id, req.params.product_id);
    res.json({ success: true, message: "Image deleted." });
  } catch (err) {
    console.error("[delete product image]", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
}

const getProductIngredients = async (req, res) => {
  try {
    const { rows } = await db.productIngredients.getByProductId(req.params.id);
    res.json({ success: true, ingredients: rows });
  } catch (err) {
    console.error("[get product ingredients]", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
}

const syncProductIngredients = async (req, res) => {
  const { ingredientIds } = req.body;
  try {
    await db.productIngredients.sync(req.params.id, ingredientIds);
    res.json({ success: true, message: "Product ingredients updated." });
  } catch (err) {
    console.error("[sync product ingredients]", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
}

export {
  getAllProducts,
  getProduct,
  productImages,
  upload,
  uploadImage,
  addProduct,
  updateProduct,
  deleteProduct,
  addProductImage,
  setProductImagePrimary,
  deleteProductImage,
  getProductIngredients,
  syncProductIngredients
}
