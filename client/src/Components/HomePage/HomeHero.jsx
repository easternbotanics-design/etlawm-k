import { Link } from "react-router-dom";
// import hero from "../../assets/homehero.webp";
import hero from "../../assets/herobanner.webp"
import { colours, fonts } from "../../theme/theme.js";

const HomeHero = () => {
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
        <div className="mx-auto flex h-full w-full items-start pt-12 sm:pt-16 md:items-center md:pt-0">
          <div className="flex h-full w-full max-w-2xl flex-col justify-between pb-4 md:h-auto md:justify-start md:pb-0 text-left">
            <div>
              <h1
                className="mt-12 sm:-mt-5 md:-mt-28 md:mb-8 flex flex-row items-baseline flex-nowrap whitespace-nowrap gap-1.5 sm:gap-2 md:gap-3 text-xl min-[380px]:text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-normal leading-[0.95] lg:leading-[0.92] tracking-[-0.03em] lg:tracking-[-0.04em] drop-shadow-[0_10px_40px_rgba(0,0,0,0.45)]"
                style={{ fontFamily: fonts.betania, color: "#55433b" }}
              >
                <p className="inline">Nature</p>, <p className="inline">refined through</p>{" "}
                <p className="inline">Science</p>
              </h1>
        
              <p
                className="mt-2 sm:mt-7 max-w-[55%] min-[380px]:max-w-[58%] sm:max-w-xl text-[10px] min-[375px]:text-xs sm:text-sm md:text-base leading-snug sm:leading-7"
                style={{
                  color: `${colours.text}c7`,
                  fontFamily: fonts.secondary,
                }}
              >
                Thoughtfully crafted essentials for healthier skin, stronger hair, and everyday confidence.
              </p>
            </div>
      
            <div className="mt-auto md:mt-36 flex flex-row items-center gap-2 sm:gap-3">
              <Link
                to="/collection"
                className="inline-block text-center rounded-full px-3 py-1.5 sm:px-6 sm:py-3 text-[9px] min-[375px]:text-[10px] sm:text-xs font-semibold uppercase tracking-[0.1em] min-[375px]:tracking-[0.14em] sm:tracking-[0.18em] shadow-[0_12px_30px_rgba(0,0,0,0.22)] transition hover:-translate-y-0.5"
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
                className="inline-block text-center rounded-full border px-3 py-1.5 sm:px-6 sm:py-3 text-[9px] min-[375px]:text-[10px] sm:text-xs font-semibold uppercase tracking-[0.1em] min-[375px]:tracking-[0.14em] sm:tracking-[0.18em] backdrop-blur-sm transition hover:-translate-y-0.5"
                style={{
                  borderColor: `${colours.primary}8c`,
                  backgroundColor: "rgba(255,255,255,0.6)",
                  color: colours.accent,
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

export default HomeHero;