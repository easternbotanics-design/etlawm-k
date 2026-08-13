import { Link } from "react-router-dom";
import { colours, fonts } from "../../theme/theme.js";

const articles = [
  {
    label: "Guide",
    title: "How to build a basic routine without using too many products",
    text: "A simple order for cleansing, treating, hydrating, and finishing.",
    large: true,
  },
  {
    label: "Ingredients",
    title: "Why gentle formulas matter for daily use",
    text: "How mild care helps consistency.",
  },
  {
    label: "Ritual",
    title: "Morning care versus night care",
    text: "What to keep different and what can stay the same.",
  },
];

const ArticleImage = ({ large = false }) => {
  return (
    <div
      className={`relative overflow-hidden border ${
        large ? "aspect-[1.45/1]" : "aspect-[1.6/1]"
      }`}
      style={{ borderColor: `${colours.secondary}26`, backgroundColor: colours.another }}
    >
      <svg
        viewBox="0 0 500 320"
        className="absolute inset-0 h-full w-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="500" height="320" fill={colours.another} />
        <circle cx="260" cy="128" r="82" fill={colours.primary} stroke={colours.secondary} />
        <path
          d="M170 201C226 173 289 173 351 202"
          stroke={colours.secondary}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M190 222C230 204 286 202 332 223"
          stroke={colours.secondary}
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeDasharray="4 8"
        />
        <path
          d="M121 247C194 222 288 224 379 249"
          stroke={colours.secondary}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M235 112C246 94 269 89 286 101C303 113 303 139 288 153C270 170 237 154 230 133"
          fill={colours.accent}
          stroke={colours.secondary}
          strokeWidth="1.6"
        />
      </svg>
    </div>
  );
};

const HomeInsights = () => {
  return (
    <section className="px-5 py-24 md:px-10 lg:px-16" style={{ backgroundColor: colours.primary }}>
      <div 
        className="mx-auto max-w-6xl py-8"
        style={{ borderTop: `1px solid ${colours.border}`, borderBottom: `1px solid ${colours.border}` }}
      >
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.3em]" style={{ color: colours.accent, fontFamily: fonts.secondary }}>
              Notes from the shelf
            </p>

            <h2
              className="text-6xl font-normal leading-none tracking-[-0.08em] md:text-8xl"
              style={{ fontFamily: fonts.primary, color: colours.secondary }}
            >
              INSIGHTS
            </h2>
          </div>

          <p className="hidden text-4xl font-light tracking-[-0.04em] md:block" style={{ fontFamily: fonts.primary, color: colours.secondary }}>
            2026
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <Link
            to="/blogs"
            className="group block p-4 transition hover:-translate-y-1 hover:shadow-[0_18px_60px_rgba(23,23,21,0.1)]"
            style={{ border: `1px solid ${colours.border}`, backgroundColor: colours.another }}
          >
            <ArticleImage large />

            <p className="mt-5 text-xs uppercase tracking-[0.24em]" style={{ color: colours.accent, fontFamily: fonts.secondary }}>
              {articles[0].label}
            </p>

            <h3
              className="mt-2 text-4xl font-normal leading-none tracking-[-0.04em] group-hover:underline"
              style={{ fontFamily: fonts.primary, color: colours.secondary }}
            >
              {articles[0].title}
            </h3>

            <p className="mt-4 max-w-xl text-sm leading-7" style={{ color: `${colours.secondary}b3`, fontFamily: fonts.secondary }}>
              {articles[0].text}
            </p>
          </Link>

          <div className="grid gap-6">
            {articles.slice(1).map((item) => (
              <Link
                key={item.title}
                to="/blogs"
                className="group block p-4 transition hover:-translate-y-1 hover:shadow-[0_18px_60px_rgba(23,23,21,0.1)]"
                style={{ border: `1px solid ${colours.border}`, backgroundColor: colours.another }}
              >
                <ArticleImage />

                <p className="mt-4 text-xs uppercase tracking-[0.24em]" style={{ color: colours.accent, fontFamily: fonts.secondary }}>
                  {item.label}
                </p>

                <h3
                  className="mt-2 text-3xl font-normal leading-none tracking-[-0.04em] group-hover:underline"
                  style={{ fontFamily: fonts.primary, color: colours.secondary }}
                >
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-6" style={{ color: `${colours.secondary}b3`, fontFamily: fonts.secondary }}>
                  {item.text}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/blogs"
            className="inline-flex rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] transition"
            style={{ backgroundColor: colours.accent, color: colours.primary, fontFamily: fonts.secondary }}
          >
            Read more
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomeInsights;