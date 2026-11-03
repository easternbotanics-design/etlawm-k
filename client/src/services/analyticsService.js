const API = import.meta.env.VITE_SERVER_API || "";

export function getVisitorId() {
  try {
    let visitorId = localStorage.getItem("visitor_id");
    if (!visitorId) {
      if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        visitorId = crypto.randomUUID();
      } else {
        visitorId = 'v_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      }
      localStorage.setItem("visitor_id", visitorId);
    }
    return visitorId;
  } catch (e) {
    // In case localStorage is blocked/disabled
    return "anonymous_visitor";
  }
}

export async function trackVisit(path) {
  if (!path) return;
  try {
    const visitorId = getVisitorId();
    await fetch(`${API}/api/analytics/visit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        visitorId,
        path,
      }),
    });
  } catch (err) {
    // Fail silently so analytics errors never break user experience
    console.debug("[analytics] trackVisit failed silently:", err);
  }
}
