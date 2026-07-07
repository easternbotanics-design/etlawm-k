import { useState } from "react";
import { colours, fonts } from "../theme/theme.js";

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-amber-400">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.08 3.18 2 2 0 0 1 3.05 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z" />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-amber-400">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const LocationIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-amber-400">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = () => {
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const shopLinks = ["All Products", "Collections", "Best Sellers", "New Arrivals"];
  const companyLinks = ["Our Story", "The Science", "The Ritual", "Sustainability"];
  const supportLinks = ["My Account", "Track Order", "FAQs", "Shipping & Returns"];

  return (
    <footer className="bg-[#0d0d0d] text-white" style={{ fontFamily: fonts.secondary }}>
      {/* Top section */}
      <div className="max-w-[1400px] mx-auto px-8 pt-16 pb-12">
        <div className="flex flex-col lg:flex-row lg:justify-between gap-12">
          {/* Brand block */}
          <div className="max-w-xs">
            <div className="text-2xl font-bold mb-1 tracking-[0.085em]" style={{ fontFamily: fonts.logo }}>
              ETLAWM
            </div>
            <div className="text-[10px] tracking-[0.3em] text-gray-400 mb-5 uppercase">
              Herbal Rituals
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Pure botanical formulas crafted with traditional herbal wisdom and modern science — for hair that truly thrives.
            </p>
          </div>

          {/* Newsletter block */}
          <div className="max-w-md w-full lg:w-auto">
            <div className="text-[11px] tracking-[0.25em] uppercase font-semibold mb-2">
              Stay in the Ritual
            </div>
            <p className="text-sm text-gray-400 mb-5">
              New launches, rituals, and exclusive offers — straight to your inbox.
            </p>
            <div className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                placeholder="your@email.com"
                className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-[4px] px-5 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-gray-500 transition-colors"
              />
              <button
                onClick={handleSubscribe}
              className="flex items-center gap-2 rounded-sm px-6 py-3 text-sm font-semibold tracking-wide whitespace-nowrap transition-colors"
                style={{ background: colours.accent, color: colours.background }}
                onMouseEnter={e => e.currentTarget.style.background = colours.secondary}
                onMouseLeave={e => e.currentTarget.style.background = colours.accent}
              >
                {subscribed ? "Done ✓" : (
                  <>Subscribe </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="border-t border-[#1f1f1f]" />
      </div>

      {/* Links section */}
      <div className="max-w-[1400px] mx-auto px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Shop */}
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-gray-400 mb-5 font-semibold">
              Shop
            </div>
            <ul className="space-y-3">
              {shopLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-gray-400 mb-5 font-semibold">
              Company
            </div>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-gray-400 mb-5 font-semibold">
              Support
            </div>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase text-gray-400 mb-5 font-semibold">
              Contact
            </div>
            <ul className="space-y-4">
              <li>
                <a href="tel:+916239551893" className="flex items-center gap-3 text-sm text-gray-300 hover:text-white transition-colors">
                  <PhoneIcon />
                  +91 62395 51893
                </a>
              </li>
              <li>
                <a href="mailto:info@etlawm.com" className="flex items-center gap-3 text-sm text-gray-300 hover:text-white transition-colors">
                  <MailIcon />
                  info@etlawm.com
                </a>
              </li>
              <li>
                <span className="flex items-center gap-3 text-sm text-gray-300">
                  <LocationIcon />
                  Manipur, India
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="border-t border-[#1f1f1f]" />
      </div>

      {/* Bottom bar */}
      <div className="max-w-[1400px] mx-auto px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Social icons */}
        <div className="flex items-center gap-3">
          {[
            { icon: <InstagramIcon />, href: "#" },
            { icon: <FacebookIcon />, href: "#" },
            { icon: <TwitterIcon />, href: "#" },
          ].map((social, i) => (
            <a
              key={i}
              href={social.href}
              className="w-9 h-9 rounded-full border border-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
            >
              {social.icon}
            </a>
          ))}
        </div>

        {/* Legal */}
        <div className="flex items-center gap-1 text-xs text-gray-500 flex-wrap justify-center sm:justify-end">
          <span>© 2026 ETLAWM. All rights reserved.</span>
          <span className="mx-1">·</span>
          <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
          <span className="mx-1">·</span>
          <a href="#" className="hover:text-gray-300 transition-colors">Terms of Use</a>
        </div>
      </div>
    </footer>
  );
}