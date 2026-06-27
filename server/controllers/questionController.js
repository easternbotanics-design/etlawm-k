import db from "../pgdb.js";

// POST /api/questions
export const submitQuestion = async (req, res) => {
  const { name, email, phone_number, subject, message } = req.body;

  // Basic validation
  if (!name || !email || !phone_number || !subject || !message) {
    return res.status(400).json({
      success: false,
      message: "All fields are required: name, email, phone_number, subject, and message.",
    });
  }

  // Simple string trim validation
  if (
    !name.trim() ||
    !email.trim() ||
    !phone_number.trim() ||
    !subject.trim() ||
    !message.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: "Fields cannot be empty or only spaces.",
    });
  }

  // Character count validation
  if (message.length > 250) {
    return res.status(400).json({
      success: false,
      message: "Message exceeds the maximum limit of 250 letters.",
    });
  }

  try {
    const { rows } = await db.homepageQuestions.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone_number: phone_number.trim(),
      subject: subject.trim(),
      message: message.trim(),
    });

    res.status(201).json({
      success: true,
      message: "Question submitted successfully.",
      question: rows[0],
    });
  } catch (err) {
    console.error("[submitQuestion]", err);
    res.status(500).json({
      success: false,
      message: "Server error. Failed to save question.",
    });
  }
};

// GET /api/admin/questions (through adminRouter)
export const getQuestions = async (req, res) => {
  try {
    const { rows } = await db.homepageQuestions.findAll();
    res.status(200).json({
      success: true,
      questions: rows,
    });
  } catch (err) {
    console.error("[getQuestions]", err);
    res.status(500).json({
      success: false,
      message: "Server error. Failed to retrieve questions.",
    });
  }
};

// DELETE /api/admin/questions/:id
export const deleteQuestion = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.homepageQuestions.delete(id);
    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Question not found.",
      });
    }
    res.status(200).json({
      success: true,
      message: "Question deleted successfully.",
    });
  } catch (err) {
    console.error("[deleteQuestion]", err);
    res.status(500).json({
      success: false,
      message: "Server error. Failed to delete question.",
    });
  }
};
