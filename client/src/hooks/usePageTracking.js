import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackVisit } from "../services/analyticsService";

export function usePageTracking() {
  const location = useLocation();
  const lastTrackedRef = useRef(null);

  useEffect(() => {
    const fullPath = location.pathname + location.search;

    // Deduplicate React StrictMode double rendering
    if (lastTrackedRef.current === fullPath) {
      return;
    }

    lastTrackedRef.current = fullPath;
    trackVisit(fullPath);
  }, [location.pathname, location.search]);
}

export default usePageTracking;
