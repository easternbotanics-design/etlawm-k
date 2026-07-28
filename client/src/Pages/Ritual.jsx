import React, { useState, useEffect } from "react";
import EllipseSeatCarousel from "../Components/Template";
import ritualService from "../services/ritualService";

const Ritual = () => {
  const [rituals, setRituals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRituals = async () => {
      try {
        const data = await ritualService.getPublicRituals();
        if (data && data.success && Array.isArray(data.rituals)) {
          setRituals(data.rituals);
        }
      } catch (err) {
        console.error("Failed to fetch rituals:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRituals();
  }, []);

  return (
    <EllipseSeatCarousel rituals={rituals} loading={loading} />
  );
};

export default Ritual;