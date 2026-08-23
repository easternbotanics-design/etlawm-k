import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { colours, fonts } from "../../theme/theme.js";
import faqService from "../../services/faqService.js";

/* ── FAQ Skeleton Loader ─────────────────────────────────────────── */
const FAQSkeleton = () => {
  return (
    <div className="divide-y divide-stone-200/60 animate-pulse">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="py-5">
          <div className="flex items-center justify-between">
            <div className="h-5 bg-stone-200/70 rounded-md w-3/4 sm:w-2/3"></div>
            <div className="h-4 w-4 bg-stone-200/70 rounded-full shrink-0"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function ProductFAQSection({ product }) {
  const [openIndex, setOpenIndex] = useState(0);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  const productIdentifier = product?.slug || product?.name;

  useEffect(() => {
    if (!productIdentifier) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const loadFaqs = async () => {
      setLoading(true);
      try {
        const data = await faqService.getPublicFaqs(productIdentifier);
        if (isMounted) {
          if (data.success && Array.isArray(data.faqs)) {
            setFaqs(data.faqs);
          } else {
            setFaqs([]);
          }
        }
      } catch (err) {
        console.error("Failed to load product FAQs:", err);
        if (isMounted) setFaqs([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadFaqs();
    return () => {
      isMounted = false;
    };
  }, [productIdentifier]);

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  if (!loading && faqs.length === 0) {
    return null;
  }

  return (
    <section className="w-full px-4 sm:px-8 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h2
            className="text-2xl sm:text-4xl font-normal leading-tight"
            style={{
              color: colours.text || "#1B1B18",
              fontFamily: fonts.primary || "serif",
            }}
          >
            Frequently Asked Questions
          </h2>
          <div
            className="w-12 h-[2px] mx-auto mt-3 rounded-full"
            style={{ backgroundColor: colours.accent || "#A77C6B" }}
          />
        </div>

        {loading ? (
          <FAQSkeleton />
        ) : (
          <div
            className="divide-y-1"
            style={{
              borderColor: colours.border || "#DAD3C3",
            }}
          >
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={faq.id || index}>
                  <button
                    type="button"
                    onClick={() => handleToggle(index)}
                    className="flex w-full items-center justify-between py-5 text-left text-base sm:text-lg font-medium tracking-wide transition-colors cursor-pointer"
                    style={{
                      color: colours.text || "#1B1B18",
                      fontFamily: fonts.primary || "serif",
                    }}
                  >
                    <span className="pr-4">{faq.question}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="shrink-0"
                      style={{ color: colours.accent || "#A77C6B" }}
                    >
                      <ChevronDown size={18} />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p
                          className="pb-5 text-xs sm:text-sm leading-relaxed whitespace-pre-line"
                          style={{
                            color: colours.mutedText || "#6B6656",
                            fontFamily: fonts.secondary || "sans-serif",
                          }}
                        >
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

