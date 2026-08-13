import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar.jsx";
import Footer from "../components/Footer.jsx";
import ScienceCard from "../components/SciencePage/ScienceCard.jsx";
import scienceService from "../services/scienceService.js";
import heroBanner3 from "../assets/heroBanner3.png";
import { colours } from "../theme/theme.js";

// Fallback demo compound data in case database has no records yet
const DEMO_SCIENCE_DATA = [
  {
    id: "demo-1",
    name: "Phyto-Lipid Barrier Matrix",
    box_1: "Multi-molecular lipid complex engineered to restore stratum corneum lipid bilayers.",
    box_2: "Demonstrated 84% reduction in transepidermal water loss (TEWL) over 14 days of application.",
    box_3: "Penetrates intercellular spaces to re-establish cellular cohesion and long-term hydration.",
    colour: "#a9ff68",
    tag: "Bio-Identical Lipid",
  },
  {
    id: "demo-2",
    name: "Cellular Antioxidant Complex",
    box_1: "High-potency polyphenols harvested from rare alpine botanical extracts.",
    box_2: "Neutralizes reactive oxygen species (ROS) and mitigates UV-induced oxidative stress.",
    box_3: "Protects collagen structures and reduces inflammation at the cellular layer.",
    colour: "#68efff",
    tag: "Antioxidant Shield",
  },
];

const Science = () => {
  const [scienceData, setScienceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchScienceData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await scienceService.getPublicScience();
        if (response && response.success && Array.isArray(response.science) && response.science.length > 0) {
          setScienceData(response.science);
        } else {
          // Use demo items if database is empty or returns no entries
          setScienceData(DEMO_SCIENCE_DATA);
        }
      } catch (err) {
        console.error("Failed to load science entries from database:", err);
        setError("Could not load latest scientific data. Displaying featured formulation science.");
        setScienceData(DEMO_SCIENCE_DATA);
      } finally {
        setLoading(false);
      }
    };

    fetchScienceData();
  }, []);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#0a0b0e] text-white flex flex-col relative">
      {/* Stationary Viewport Background Container */}
      <div className="fixed inset-0 w-full h-screen pointer-events-none z-0 overflow-hidden">
        <img
          src={heroBanner3}
          alt="Science background"
          className="w-full h-full object-cover object-center opacity-90 brightness-110 contrast-95 blur-xl"
        />
        {/* Light white tone overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: "rgba(247, 243, 236, 0.2)",
          }}
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar />

        {/* Main Science Cards List */}
        <main className="flex-1 pt-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 w-full">
          {error && (
            <div className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm text-center font-mono">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-[#a9ff68] animate-spin" />
              <p className="text-gray-400 font-mono text-sm tracking-wider uppercase">
                Loading Science Database...
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-10 sm:gap-14 w-full">
              {scienceData.map((item, index) => (
                <ScienceCard
                  key={item.id || index}
                  name={item.name}
                  title={item.name}
                  descriptions={item.descriptions}
                  box_1={item.box_1}
                  box_2={item.box_2}
                  box_3={item.box_3}
                  image_url={item.image_url}
                  tag={item.tag || `COMPOUND NO. 0${index + 1}`}
                  stat={item.stat}
                  statLabel={item.statLabel}
                  isReversed={index % 2 !== 0}
                />
              ))}
            </div>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Science;