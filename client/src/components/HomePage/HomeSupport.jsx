import { Link } from "react-router-dom";
import { colours, fonts } from "../../theme/theme.js";

const cards = [
  {
    title: "At your fingertips, anytime.",
    text: "Browse products, ingredients, and routines whenever you need a clearer next step.",
    href: "/collection",
  },
  {
    title: "Here to help you make sense of it all.",
    text: "Use the pathways to narrow down what you need before adding products to your cart.",
    href: "/ritual",
  },
];

const LineIcon = () => {
  return (
    <svg
      viewBox="0 0 180 140"
      className="mx-auto mb-8 h-28 w-36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="40"
        y="38"
        width="100"
        height="64"
        rx="4"
        fill={colours.primary}
        stroke={colours.secondary}
        strokeWidth="2"
      />
      <path
        d="M58 57H122M58 72H107M58 87H118"
        stroke={colours.secondary}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M90 25C106 16 122 18 134 31"
        stroke={colours.secondary}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeDasharray="4 6"
      />
      <circle cx="141" cy="38" r="8" fill={colours.accent} stroke={colours.secondary} />
    </svg>
  );
};

const HomeSupport = () => {
  return (
    <section className="px-5 py-20 md:px-10 lg:px-16" style={{ backgroundColor: colours.surface }}>
      <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
        {cards.map((card) => (
          <article
            key={card.title}
            className="p-8 text-center shadow-[0_18px_70px_rgba(23,23,21,0.08)] md:p-12"
            style={{ backgroundColor: colours.primary }}
          >
            <LineIcon />

            <h2
              className="mx-auto max-w-md text-4xl font-normal leading-none tracking-[-0.04em] md:text-5xl"
              style={{ fontFamily: fonts.primary, color: colours.secondary }}
            >
              {card.title}
            </h2>

            <p className="mx-auto mt-5 max-w-md text-sm leading-7" style={{ color: `${colours.secondary}b3`, fontFamily: fonts.secondary }}>
              {card.text}
            </p>

            <Link
              to={card.href}
              className="mt-7 inline-flex rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] transition"
              style={{ backgroundColor: colours.accent, color: colours.primary, fontFamily: fonts.secondary }}
            >
              Start now
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
};

export default HomeSupport;