import { Link } from "react-router-dom";

const links = [
  {
    title: "Shop",
    items: [
      { label: "Collection", href: "/collection" },
      { label: "Skin care", href: "/collection?category=skin" },
      { label: "Hair care", href: "/collection?category=hair" },
      { label: "Body care", href: "/collection?category=body" },
    ],
  },
  {
    title: "Learn",
    items: [
      { label: "Ritual", href: "/ritual" },
      { label: "Ingredients", href: "/ingredients" },
      { label: "Science", href: "/science" },
      { label: "Blogs", href: "/blogs" },
    ],
  },
  {
    title: "Help",
    items: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Account", href: "/dashboard" },
      { label: "Cart", href: "/cart" },
    ],
  },
];

const HomeFooter = () => {
  return (
    <footer className="bg-[#EFE7D8] px-5 py-14 md:px-10 lg:px-16">
      <div className="mx-auto grid max-w-6xl gap-10 border-t border-[#171715]/20 pt-10 md:grid-cols-[1.1fr_1.4fr]">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em]"
          >
            <span className="h-2 w-2 rounded-full bg-[#68B7AA]" />
            ETLAWM
          </Link>

          <p className="mt-5 max-w-sm text-sm leading-7 text-[#171715]/65">
            Calm, direct care for daily rituals. Built around simpler routines,
            clearer choices, and fewer unnecessary steps.
          </p>

          <p className="mt-8 text-xs uppercase tracking-[0.22em] text-[#171715]/45">
            © {new Date().getFullYear()} ETLAWM
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {links.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs uppercase tracking-[0.26em] text-[#171715]/50">
                {group.title}
              </h3>

              <div className="mt-5 flex flex-col gap-3">
                {group.items.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="text-sm text-[#171715]/70 transition hover:text-[#171715] hover:underline"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;