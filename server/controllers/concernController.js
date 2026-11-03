import db from '../pgdb.js';

const createSlug = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const getPublicConcerns = async (req, res, next) => {
  try {
    const result = await db.concerns.findAll({ include_inactive: false });
    return res.json({
      success: true,
      concerns: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminConcerns = async (req, res, next) => {
  try {
    const result = await db.concerns.findAll({ include_inactive: true });
    return res.json({
      success: true,
      concerns: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

export const getConcernById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.concerns.findById(id);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Concern tag not found.',
      });
    }
    return res.json({
      success: true,
      concern: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

export const createConcern = async (req, res, next) => {
  try {
    const { name, status, image_url } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Concern name is required.',
      });
    }

    const trimmedName = name.trim();
    const slug = createSlug(trimmedName);

    const existing = await db.concerns.findBySlug(slug);
    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'A concern with this name already exists.',
      });
    }

    const result = await db.concerns.create({
      name: trimmedName,
      slug,
      status: status || 'published',
      is_active: true,
      image_url: image_url || null,
    });

    return res.status(201).json({
      success: true,
      message: 'Concern tag created successfully.',
      concern: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

export const updateConcern = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, status, image_url, is_active } = req.body;

    const existing = await db.concerns.findById(id);
    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Concern tag not found.',
      });
    }

    let slug = existing.rows[0].slug;
    let trimmedName = existing.rows[0].name;

    if (name && name.trim()) {
      trimmedName = name.trim();
      slug = createSlug(trimmedName);

      const existingSlug = await db.concerns.findBySlug(slug);
      if (
        existingSlug.rows.length > 0 &&
        String(existingSlug.rows[0].id) !== String(id)
      ) {
        return res.status(400).json({
          success: false,
          message: 'A concern with this name already exists.',
        });
      }
    }

    const result = await db.concerns.update(id, {
      name: trimmedName,
      slug,
      status: status !== undefined ? status : existing.rows[0].status,
      is_active: is_active !== undefined ? is_active : existing.rows[0].is_active,
      image_url: image_url !== undefined ? image_url : existing.rows[0].image_url,
    });

    return res.json({
      success: true,
      message: 'Concern tag updated successfully.',
      concern: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

export const deleteConcern = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await db.concerns.findById(id);
    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Concern tag not found.',
      });
    }

    await db.concerns.delete(id);
    return res.json({
      success: true,
      message: 'Concern tag deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};
