import { Link } from "react-router-dom";
import { colours, fonts } from "../../theme/theme.js";

const pathways = [
  {
    title: "To calm",
    text: "For skin that feels heated, reactive, dry, or uncomfortable. Start with mild cleansing, hydration, and a soft barrier-first finish.",
    tone: "primary",
    href: "/collection?concern=calm",
  },
  {
    title: "To restore",
    text: "For dullness, texture, and tired skin days. Focus on steady nourishment rather than aggressive correction.",
    tone: "green",
    href: "/collection?concern=restore",
  },
  {
    title: "For hair care",
    text: "For scalp comfort, oiling rituals, cleansing, and daily nourishment. Keep the routine consistent and light.",
    tone: "another",
    href: "/collection?concern=hair",
  },
  {
    title: "For daily glow",
    text: "For a simple everyday rhythm: cleanse, treat, hydrate, and protect. Nothing complicated, nothing excessive.",
    tone: "subBackground",
    href: "/collection?concern=glow",
  },
  {
    title: "For body care",
    text: "For skin below the neck: gentle exfoliation, nourishment, and moisture that does not feel heavy.",
    tone: "surface",
    href: "/collection?concern=body",
  },
];

const SketchCard = ({ tone = "primary" }) => {
  const bgColor = colours[tone] || colours.primary;

  return (
    <div
      className="relative aspect-[1.55/1] overflow-hidden border"
      style={{ backgroundColor: bgColor, borderColor: `${colours.secondary}26` }}
    >
      <svg
        viewBox="0 0 520 320"
        className="absolute inset-0 h-full w-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 242C50 220 101 213 153 226C211 241 240 280 302 266C372 250 390 192 462 196C488 198 508 205 520 213V320H0V242Z"
          fill="rgba(255,255,255,0.32)"
        />
        <path
          d="M19 246C70 217 114 216 166 232C225 251 247 283 309 269C379 253 394 200 462 202C486 203 505 209 520 218"
          stroke={colours.secondary}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M72 246V164M72 164L38 239M72 164L107 239M72 191L51 242M72 191L94 242"
          stroke={colours.secondary}
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <path
          d="M121 235V132M121 132L82 228M121 132L161 228M121 168L94 232M121 168L149 232"
          stroke={colours.secondary}
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <path
          d="M372 215V128M372 128L334 207M372 128L410 207M372 159L347 212M372 159L396 212"
          stroke={colours.secondary}
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <path
          d="M275 150C290 129 313 119 333 124C357 130 371 154 361 176C351 198 321 202 302 188C284 175 263 171 275 150Z"
          fill={colours.accent}
          stroke={colours.secondary}
          strokeWidth="1.7"
        />
        <path
          d="M315 187C313 204 311 219 310 237"
          stroke={colours.secondary}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M19 275C103 254 171 253 254 270C337 287 429 285 501 260"
          stroke={colours.secondary}
          strokeWidth="1"
          strokeLinecap="round"
          strokeDasharray="3 7"
        />
      </svg>
    </div>
  );
};

const PathwayItem = ({ item, index }) => {
  const imageFirst = index % 2 === 0;

  return (
    <article className="grid gap-8 md:grid-cols-2 md:items-center">
      <div className={imageFirst ? "md:order-1" : "md:order-2"}>
        <SketchCard tone={item.tone} />
      </div>

      <div className={imageFirst ? "md:order-2" : "md:order-1"}>
        <p className="mb-3 text-xs uppercase tracking-[0.26em]" style={{ color: colours.accent, fontFamily: fonts.secondary }}>
          Pathway 0{index + 1}
        </p>

        <h3
          className="text-4xl font-normal leading-none tracking-[-0.04em] md:text-5xl"
          style={{ fontFamily: fonts.primary, color: colours.secondary }}
        >
          {item.title}
        </h3>

        <p className="mt-5 max-w-md text-sm leading-7" style={{ color: `${colours.secondary}b3`, fontFamily: fonts.secondary }}>
          {item.text}
        </p>

        <Link
          to={item.href}
          className="mt-6 inline-flex rounded-full px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition hover:-translate-y-0.5"
          style={{ backgroundColor: colours.accent, border: `1px solid ${colours.accent}`, color: colours.primary, fontFamily: fonts.secondary }}
        >
          Start here
        </Link>
      </div>
    </article>
  );
};

const HomePathways = () => {
  return (
    <section className="px-5 py-24 md:px-10 lg:px-16" style={{ backgroundColor: colours.primary }}>
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="mb-4 text-xs uppercase tracking-[0.32em]" style={{ color: colours.accent, fontFamily: fonts.secondary }}>
            Choose the route
          </p>

          <h2
            className="text-5xl font-normal leading-[0.9] tracking-[-0.06em] md:text-7xl"
            style={{ fontFamily: fonts.primary, color: colours.secondary }}
          >
            Five pathways to simplify your daily care.
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-7" style={{ color: `${colours.secondary}b3`, fontFamily: fonts.secondary }}>
            Each pathway is a practical entry point. Pick one concern, then
            build with fewer, better steps.
          </p>
        </div>

        <div className="space-y-24">
          {pathways.map((item, index) => (
            <PathwayItem key={item.title} item={item} index={index} />
          ))}
        </div>

        <div 
          className="mx-auto mt-24 max-w-3xl p-8 shadow-[0_18px_70px_rgba(23,23,21,0.08)] md:p-12"
          style={{ backgroundColor: colours.another }}
        >
          <div className="grid gap-8 md:grid-cols-[180px_1fr] md:items-center">
            <SketchCard tone="another" />

            <div>
              <h3
                className="text-4xl font-normal leading-none tracking-[-0.04em] md:text-5xl"
                style={{ fontFamily: fonts.primary, color: colours.secondary }}
              >
                Build a care ritual without overbuilding your shelf.
              </h3>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/collection"
                  className="rounded-full px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] transition"
                  style={{ backgroundColor: colours.accent, color: colours.primary, fontFamily: fonts.secondary }}
                >
                  Shop all
                </Link>

                <Link
                  to="/ingredients"
                  className="rounded-full border px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] transition"
                  style={{ borderColor: `${colours.secondary}4d`, color: colours.secondary, fontFamily: fonts.secondary }}
                >
                  See ingredients
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomePathways;