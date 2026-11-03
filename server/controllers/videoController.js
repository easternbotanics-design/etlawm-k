import db from "../pgdb.js";
import multer from "multer";
import axios from "axios";
import crypto from "crypto";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB max video size
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/quicktime",
      "video/x-msvideo",
      "video/m4v",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error(
          "Only MP4, WebM, OGG, MOV, AVI and M4V video formats are allowed."
        )
      );
    }

    cb(null, true);
  },
});

// Upload video file to Supabase storage
const uploadVideo = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No video file was uploaded.",
    });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({
      success: false,
      message: "Supabase storage is not configured.",
    });
  }

  const bucketName = req.query.bucket || req.body.bucket || "product-videos";

  try {
    const originalExt = path.extname(req.file.originalname).toLowerCase() || ".mp4";
    const fileName = `video-${Date.now()}-${crypto.randomUUID()}${originalExt}`;
    const encodedFileName = encodeURIComponent(fileName);

    let targetBucket = bucketName;

    try {
      await axios.post(
        `${supabaseUrl}/storage/v1/object/${targetBucket}/${encodedFileName}`,
        req.file.buffer,
        {
          headers: {
            Authorization: `Bearer ${supabaseKey}`,
            apikey: supabaseKey,
            "Content-Type": req.file.mimetype,
            "x-upsert": "false",
          },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        }
      );
    } catch (uploadErr) {
      // If bucket product-videos doesn't exist, try fallback to product-images
      if (targetBucket !== "product-images") {
        console.warn(`[uploadVideo] Uploading to ${targetBucket} failed, trying product-images bucket fallback...`);
        targetBucket = "product-images";
        await axios.post(
          `${supabaseUrl}/storage/v1/object/${targetBucket}/${encodedFileName}`,
          req.file.buffer,
          {
            headers: {
              Authorization: `Bearer ${supabaseKey}`,
              apikey: supabaseKey,
              "Content-Type": req.file.mimetype,
              "x-upsert": "false",
            },
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
          }
        );
      } else {
        throw uploadErr;
      }
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${targetBucket}/${encodedFileName}`;

    return res.status(201).json({
      success: true,
      url: publicUrl,
      file_name: fileName,
    });
  } catch (err) {
    console.error("[uploadVideo to Supabase]", err.response?.data ?? err.message);

    return res.status(500).json({
      success: false,
      message: err.response?.data?.message ?? "Failed to upload video.",
    });
  }
};

const getAllVideos = async (req, res) => {
  try {
    const { rows } = await db.cmsVideos.findAllAdmin();
    res.json({ success: true, videos: rows });
  } catch (err) {
    console.error("[get all videos]", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const getPublishedVideos = async (req, res) => {
  try {
    const { rows } = await db.cmsVideos.findPublished();
    res.json({ success: true, videos: rows });
  } catch (err) {
    console.error("[get published videos]", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const getVideoById = async (req, res) => {
  try {
    const { rows } = await db.cmsVideos.findById(req.params.id);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Video not found." });
    }
    res.json({ success: true, video: rows[0] });
  } catch (err) {
    console.error("[get video by id]", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const isValidUUID = (id) =>
  typeof id === "string" &&
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
    id.trim()
  );

const createVideo = async (req, res) => {
  const { title, video_url, product_id, product_name, description, thumbnail_url, status, sort_order, is_active } = req.body;

  if (!video_url) {
    return res.status(400).json({
      success: false,
      message: "Video file / URL is required.",
    });
  }

  try {
    const validProductId = isValidUUID(product_id) ? product_id.trim() : null;

    const { rows } = await db.cmsVideos.create({
      title,
      video_url,
      product_id: validProductId,
      product_name,
      description,
      thumbnail_url,
      status,
      sort_order: sort_order ? parseInt(sort_order, 10) : 0,
      is_active: is_active ?? true,
    });

    res.status(201).json({ success: true, video: rows[0] });
  } catch (err) {
    console.error("[create video]", err);
    res.status(500).json({ success: false, message: err.message || "Server error." });
  }
};

const updateVideo = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.product_id !== undefined) {
      updateData.product_id = isValidUUID(updateData.product_id)
        ? updateData.product_id.trim()
        : null;
    }

    const { rows } = await db.cmsVideos.update(req.params.id, updateData);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Video not found." });
    }
    res.json({ success: true, video: rows[0] });
  } catch (err) {
    console.error("[update video]", err);
    res.status(500).json({ success: false, message: err.message || "Server error." });
  }
};

const deleteVideo = async (req, res) => {
  try {
    const { rows } = await db.cmsVideos.delete(req.params.id);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Video not found." });
    }
    res.json({ success: true, message: "Video deleted.", video: rows[0] });
  } catch (err) {
    console.error("[delete video]", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

export {
  upload,
  uploadVideo,
  getAllVideos,
  getPublishedVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
};
