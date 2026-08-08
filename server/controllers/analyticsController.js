import db from "../pgdb.js";

const trackVisit = async (req, res) => {
  try {
    const { visitorId, path } = req.body || {};

    if (!visitorId || typeof visitorId !== "string" || visitorId.length > 128) {
      return res.status(400).json({ success: false, message: "Invalid visitorId" });
    }

    if (!path || typeof path !== "string" || path.length > 500) {
      return res.status(400).json({ success: false, message: "Invalid path" });
    }

    const userAgent = req.headers["user-agent"] || null;

    await db.websiteVisits.record({
      visitor_id: visitorId.trim(),
      path: path.trim(),
      user_agent: userAgent,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("[track-visit]", err);
    return res.status(500).json({ success: false, message: "Error tracking visit" });
  }
};

const getAdminAnalytics = async (req, res) => {
  try {
    const stats = await db.websiteVisits.getStats();
    return res.status(200).json({
      success: true,
      analytics: stats,
    });
  } catch (err) {
    console.error("[get-admin-analytics]", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export { trackVisit, getAdminAnalytics };
