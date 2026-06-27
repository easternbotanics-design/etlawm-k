import { Link } from "react-router-dom";
import { colours, fonts } from "../../theme/theme.js";

const HomeFinalCTA = () => {
  return (
    <section className="relative overflow-hidden px-5 pb-36 pt-16 text-center md:px-10 lg:px-16" style={{ backgroundColor: colours.primary }}>
      <div className="relative z-10 mx-auto max-w-5xl">
        <p className="mb-5 text-xs uppercase tracking-[0.36em]" style={{ color: colours.accent, fontFamily: fonts.secondary }}>
          Begin again
        </p>

        <h2
          className="text-[clamp(3rem,7vw,8rem)] font-normal leading-[0.82] tracking-[-0.08em]"
          style={{ fontFamily: fonts.primary, color: colours.secondary }}
        >
          A ritual roadmap
          <br />
          for every day.
        </h2>

        <Link
          to="/collection"
          className="mt-8 inline-flex rounded-full px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] shadow-[0_12px_30px_rgba(104,183,170,0.28)] transition hover:-translate-y-0.5"
          style={{ backgroundColor: colours.accent, color: colours.primary, fontFamily: fonts.secondary }}
        >
          Explore collection
        </Link>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 260"
          className="h-[180px] w-full md:h-[230px]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0 194H1440V260H0V194Z" fill={colours.surface} />
          <path
            d="M0 196C154 174 260 151 420 170C577 188 650 231 807 215C982 197 1078 116 1261 124C1346 128 1400 151 1440 174"
            stroke={colours.secondary}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M0 214C198 204 374 204 550 221C709 236 895 240 1059 211C1200 186 1316 181 1440 197"
            stroke={colours.secondary}
            strokeWidth="1"
            strokeLinecap="round"
            strokeDasharray="4 8"
          />
          <path
            d="M735 116C753 91 783 80 807 88C835 96 849 126 837 151C825 177 787 181 765 163C744 147 720 140 735 116Z"
            fill={colours.accent}
            stroke={colours.secondary}
            strokeWidth="2"
          />
          <path
            d="M785 163C781 185 778 207 777 235"
            stroke={colours.secondary}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M99 203V126M99 126L62 196M99 126L136 196M99 153L75 199M99 153L124 199"
            stroke={colours.secondary}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M1295 179V94M1295 94L1257 171M1295 94L1336 171M1295 124L1268 175M1295 124L1323 175"
            stroke={colours.secondary}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </section>
  );
};

export default HomeFinalCTA;