import { Link } from "react-router-dom";
import hero from "../../assets/homehero.webp";
import { colours, fonts } from "../../theme/theme.js";

const HomeHeroCarousel = () => {
  return (
    <section className="relative h-[400px] md:h-[650px] lg:h-[750px] w-full overflow-hidden" style={{ backgroundColor: colours.secondary }}>
      <img
        src={hero}
        alt="ETLAWM hero banner"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      {/* <div className="absolute inset-0 bg-black/30" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.08),rgba(0,0,0,0.42))]" />*/}

      <div className="relative z-10 flex h-full w-full px-5 md:px-10 lg:px-16">
        <div className="mx-auto mt-8 flex h-full w-full max-w-7xl items-start pt-[85px] md:items-center md:pt-0">
          <div className="max-w-2xl text-left">
            {/* <p
              className="mb-3 sm:mb-5 text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.36em]"
              style={{ color: colours.green, fontFamily: fonts.secondary }}
            >
              Ayurvedic care, simplified
            </p>*/}
      
            <h1
              className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-normal leading-[0.95] lg:leading-[0.92] tracking-[-0.03em] lg:tracking-[-0.04em] drop-shadow-[0_10px_40px_rgba(0,0,0,0.45)]"
              style={{ fontFamily: fonts.sail, color: colours.primary }}
            >
              Science Inspired.
              <br />
              Nature Driven.
            </h1>
      
            <p
              className="mt-4 sm:mt-7 max-w-[60%] sm:max-w-xl text-xs sm:text-sm md:text-base leading-6 sm:leading-7"
              style={{
                color: `${colours.primary}c7`,
                fontFamily: fonts.secondary,
              }}
            >
              Thoughtfully crafted essentials for healthier skin, stronger hair, and everyday confidence.
            </p>
      
            <div className="mt-18 flex flex-wrap gap-2 sm:gap-3">
              <Link
                to="/collection"
                className="rounded-full px-4 py-2 sm:px-6 sm:py-3 text-[10px] min-[375px]:text-xs font-semibold uppercase tracking-[0.12em] min-[375px]:tracking-[0.18em] shadow-[0_12px_30px_rgba(0,0,0,0.22)] transition hover:-translate-y-0.5"
                style={{
                  backgroundColor: colours.accent,
                  color: colours.primary,
                  fontFamily: fonts.secondary,
                }}
              >
                Shop collection
              </Link>
      
              <Link
                to="/ritual"
                className="rounded-full border px-4 py-2 sm:px-6 sm:py-3 text-[10px] min-[375px]:text-xs font-semibold uppercase tracking-[0.12em] min-[375px]:tracking-[0.18em] backdrop-blur-sm transition hover:-translate-y-0.5"
                style={{
                  borderColor: `${colours.primary}8c`,
                  backgroundColor: "rgba(255,255,255,0.1)",
                  color: colours.primary,
                  fontFamily: fonts.secondary,
                }}
              >
                Find a ritual
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeHeroCarousel;