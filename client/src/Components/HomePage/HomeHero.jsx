import { Link } from "react-router-dom";
import hero from "../../assets/heroBanner2.png";
import { colours, fonts } from "../../theme/theme.js";

const MiniLogo = () => {
  return (
    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-white">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: colours.accent }} />
      <span style={{ fontFamily: fonts.secondary }}>ETLAWM</span>
    </div>
  );
};

const HomeHero = () => {
  return (
    <section className="relative min-h-screen min-h-[100svh] w-full overflow-hidden" style={{ backgroundColor: colours.secondary }}>
      <img
        src={hero}
        alt="ETLAWM hero banner"
        className="absolute inset-0 h-full w-full object-cover object-center scale-105 blur-2xl"
      />

      <div className="absolute inset-0 bg-black/30" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.08),rgba(0,0,0,0.42))]" />

      <div className="relative z-10 flex min-h-screen min-h-[100svh] w-full flex-col px-5 pt-28 md:px-10 lg:px-16">       

        <div className="mx-auto flex flex-1 w-full max-w-6xl flex-col items-center justify-center pb-20 text-center">
          <p className="mb-5 text-xs uppercase tracking-[0.36em]" style={{ color: colours.green, fontFamily: fonts.secondary }}>
            Ayurvedic care, simplified
          </p>

          <h1
            className="max-w-5xl text-[clamp(3.4rem,8.5vw,9.5rem)] font-normal leading-[0.92] tracking-[-0.04em] drop-shadow-[0_10px_40px_rgba(0,0,0,0.45)]"
            style={{ fontFamily: fonts.primary, color: colours.primary }}
          >
            A ritual roadmap
            <br />
            for every day.
          </h1>

          <p className="mt-7 max-w-xl text-sm leading-7 md:text-base" style={{ color: `${colours.primary}c7`, fontFamily: fonts.secondary }}>
            Build your routine through calm formulas, essential ingredients, and
            products made to sit naturally inside your daily rhythm.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/collection"
              className="rounded-full px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] shadow-[0_12px_30px_rgba(0,0,0,0.22)] transition hover:-translate-y-0.5"
              style={{ backgroundColor: colours.accent, color: colours.primary, fontFamily: fonts.secondary }}
            >
              Shop collection
            </Link>

            <Link
              to="/ritual"
              className="rounded-full border px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] backdrop-blur-sm transition hover:-translate-y-0.5"
              style={{ borderColor: `${colours.primary}8c`, backgroundColor: 'rgba(255,255,255,0.1)', color: colours.primary, fontFamily: fonts.secondary }}
            >
              Find a ritual
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeHero;