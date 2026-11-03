import db from "../pgdb.js";

const createCmsFaq = async (req, res) => {
  const {
    product_name,
    product_link,
    faqs,
    question,
    answer,
    status = "published",
    sort_order = 0,
    is_active = true,
  } = req.body;

  try {
    // If an array of faqs is provided inside req.body
    if (Array.isArray(faqs) && faqs.length > 0) {
      if (!product_name) {
        return res.status(400).json({
          success: false,
          message: "product_name is required.",
        });
      }

      for (let i = 0; i < faqs.length; i++) {
        if (!faqs[i].question || !faqs[i].question.trim() || !faqs[i].answer || !faqs[i].answer.trim()) {
          return res.status(400).json({
            success: false,
            message: `Question and answer are required for all FAQ items (check entry #${i + 1}).`,
          });
        }
      }

      const itemsToInsert = faqs.map((f, idx) => ({
        product_name,
        product_link: product_link || null,
        question: f.question.trim(),
        answer: f.answer.trim(),
        status,
        sort_order: f.sort_order !== undefined ? f.sort_order : idx,
        is_active: f.is_active !== undefined ? f.is_active : true,
      }));

      const { rows: createdFaqs } = await db.cmsFaqs.createMany(itemsToInsert);

      return res.status(201).json({
        success: true,
        count: createdFaqs.length,
        faqs: createdFaqs,
        faq: createdFaqs[0],
      });
    }

    // Single FAQ creation
    if (!product_name || !question || !answer) {
      return res.status(400).json({
        success: false,
        message: "product_name, question, and answer are required.",
      });
    }

    const {
      rows: [createdFaq],
    } = await db.cmsFaqs.create({
      product_name,
      product_link,
      question,
      answer,
      status,
      sort_order,
      is_active,
    });

    return res.status(201).json({
      success: true,
      faq: createdFaq,
      faqs: [createdFaq],
    });
  } catch (err) {
    console.error("[create cms faq]", err);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

const getAdminCmsFaqs = async (req, res) => {
  try {
    const { rows: faqs } = await db.cmsFaqs.findAllAdmin();

    return res.json({
      success: true,
      faqs,
    });
  } catch (err) {
    console.error("[get admin cms faqs]", err);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

const getPublicCmsFaqs = async (req, res) => {
  const productIdentifier = req.query.slug || req.query.product;

  try {
    let faqs;
    if (productIdentifier) {
      const { rows } = await db.cmsFaqs.findPublishedByProduct(productIdentifier);
      faqs = rows;
    } else {
      const { rows } = await db.cmsFaqs.findPublished();
      faqs = rows;
    }

    return res.json({
      success: true,
      faqs,
    });
  } catch (err) {
    console.error("[get public cms faqs]", err);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

const getCmsFaqsByProduct = async (req, res) => {
  const { slug } = req.params;

  try {
    const { rows: faqs } = await db.cmsFaqs.findByProductNameOrSlug(slug);

    return res.json({
      success: true,
      product_name: slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      faqs,
    });
  } catch (err) {
    console.error("[get cms faqs by product]", err);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

const getCmsFaqById = async (req, res) => {
  const { id } = req.params;

  try {
    const {
      rows: [faq],
    } = await db.cmsFaqs.findById(id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found.",
      });
    }

    return res.json({
      success: true,
      faq,
    });
  } catch (err) {
    console.error("[get cms faq by id]", err);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

const updateCmsFaq = async (req, res) => {
  const { id } = req.params;

  try {
    const {
      rows: [updatedFaq],
    } = await db.cmsFaqs.update(id, req.body);

    if (!updatedFaq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found.",
      });
    }

    return res.json({
      success: true,
      faq: updatedFaq,
    });
  } catch (err) {
    console.error("[update cms faq]", err);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

const deleteCmsFaq = async (req, res) => {
  const { id } = req.params;

  try {
    const {
      rows: [deletedFaq],
    } = await db.cmsFaqs.delete(id);

    if (!deletedFaq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found.",
      });
    }

    return res.json({
      success: true,
      message: "FAQ deleted.",
      faq: deletedFaq,
    });
  } catch (err) {
    console.error("[delete cms faq]", err);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

export {
  createCmsFaq,
  getAdminCmsFaqs,
  getPublicCmsFaqs,
  getCmsFaqsByProduct,
  getCmsFaqById,
  updateCmsFaq,
  deleteCmsFaq,
};
