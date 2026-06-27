import { useState } from "react";
import { colours, fonts } from "../../theme/theme.js";
import { submitQuestion } from "../../services/questionService.js";

const palette = {
  primary: colours.primary || "#F7F3EC",
  background: colours.background || "#FFFFFF",
  secondary: colours.secondary || colours.text || "#171715",
  accent: colours.accent || "#A77C6B",
  border: colours.border || "#D8D2C8",
  muted: colours.mutedText || "#7C7770",
  surface: colours.surface || "#E8E2D8",
};

const HomeQuestions = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleChange = (e) => {
    const { id, value } = e.target;
    if (id === "message" && value.length > 250) {
      setFormData((prev) => ({ ...prev, [id]: value.slice(0, 250) }));
      return;
    }
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    // Validate inputs
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.phone_number.trim() ||
      !formData.subject.trim() ||
      !formData.message.trim()
    ) {
      setStatus({ type: "error", message: "All fields are required." });
      setLoading(false);
      return;
    }

    try {
      await submitQuestion(formData);
      setStatus({
        type: "success",
        message: "Your message has been sent successfully!",
      });
      setFormData({
        name: "",
        email: "",
        phone_number: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      setStatus({
        type: "error",
        message: err.message || "Failed to submit your message. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="relative overflow-hidden px-5 py-24 md:px-10 lg:px-16"
      style={{
        backgroundColor: palette.primary,
        color: palette.secondary,
      }}
    >
      <div className="pointer-events-none absolute inset-0">
        <p
          className="absolute -right-8 top-10 hidden select-none text-[10rem] font-normal leading-none tracking-[-0.08em] opacity-[0.035] xl:block"
          style={{
            fontFamily: fonts.primary,
            color: palette.secondary,
          }}
        >
          ASK
        </p>

        <div
          className="absolute bottom-0 left-0 h-[320px] w-[320px] rounded-full blur-3xl"
          style={{
            backgroundColor: `${palette.accent}24`,
          }}
        />
      </div>

      <div className="relative mx-auto max-w-5xl">
        <div
          className="mb-12 border-y py-10 text-center"
          style={{
            borderColor: `${palette.secondary}24`,
          }}
        >
          <p
            className="mb-4 text-xs font-semibold uppercase tracking-[0.34em]"
            style={{
              color: palette.accent,
              fontFamily: fonts.secondary,
            }}
          >
            Questions
          </p>

          <h2
            className="mx-auto max-w-4xl text-[clamp(3.5rem,7vw,7.5rem)] font-normal leading-[0.82] tracking-[-0.08em]"
            style={{
              fontFamily: fonts.primary,
            }}
          >
            Have any questions?
          </h2>

          <p
            className="mx-auto mt-6 max-w-xl text-sm leading-7 md:text-base"
            style={{
              color: palette.muted,
              fontFamily: fonts.secondary,
            }}
          >
            Send a message and keep it direct.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mx-auto max-w-3xl rounded-[2rem] border p-6 shadow-[0_24px_90px_rgba(23,23,21,0.07)] md:p-10"
          style={{
            borderColor: `${palette.secondary}20`,
            backgroundColor: `${palette.background}cc`,
          }}
        >
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <label
                htmlFor="name"
                className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.22em]"
                style={{
                  color: palette.accent,
                  fontFamily: fonts.secondary,
                }}
              >
                Name
              </label>

              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                className="w-full rounded-none border-0 border-b bg-transparent px-0 py-3 text-sm outline-none transition placeholder:text-[#171715]/40 focus:border-[#171715]"
                style={{
                  borderBottomColor: `${palette.secondary}45`,
                  color: palette.secondary,
                  fontFamily: fonts.secondary,
                }}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.22em]"
                style={{
                  color: palette.accent,
                  fontFamily: fonts.secondary,
                }}
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your email"
                className="w-full rounded-none border-0 border-b bg-transparent px-0 py-3 text-sm outline-none transition placeholder:text-[#171715]/40 focus:border-[#171715]"
                style={{
                  borderBottomColor: `${palette.secondary}45`,
                  color: palette.secondary,
                  fontFamily: fonts.secondary,
                }}
              />
            </div>

            <div>
              <label
                htmlFor="phone_number"
                className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.22em]"
                style={{
                  color: palette.accent,
                  fontFamily: fonts.secondary,
                }}
              >
                Phone Number
              </label>

              <input
                id="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="Your phone number"
                className="w-full rounded-none border-0 border-b bg-transparent px-0 py-3 text-sm outline-none transition placeholder:text-[#171715]/40 focus:border-[#171715]"
                style={{
                  borderBottomColor: `${palette.secondary}45`,
                  color: palette.secondary,
                  fontFamily: fonts.secondary,
                }}
              />
            </div>
          </div>

          <div className="mt-6">
            <label
              htmlFor="subject"
              className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{
                color: palette.accent,
                fontFamily: fonts.secondary,
              }}
            >
              Subject
            </label>

            <input
              id="subject"
              type="text"
              value={formData.subject}
              onChange={handleChange}
              placeholder="What is this about?"
              className="w-full rounded-none border-0 border-b bg-transparent px-0 py-3 text-sm outline-none transition placeholder:text-[#171715]/40 focus:border-[#171715]"
              style={{
                borderBottomColor: `${palette.secondary}45`,
                color: palette.secondary,
                fontFamily: fonts.secondary,
              }}
            />
          </div>

          <div className="mt-6">
            <label
              htmlFor="message"
              className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{
                color: palette.accent,
                fontFamily: fonts.secondary,
              }}
            >
              Message
            </label>

            <textarea
              id="message"
              value={formData.message}
              onChange={handleChange}
              maxLength={250}
              placeholder="Write your message"
              rows="5"
              className="w-full resize-none rounded-none border-0 border-b bg-transparent px-0 py-3 text-sm outline-none transition placeholder:text-[#171715]/40 focus:border-[#171715]"
              style={{
                borderBottomColor: `${palette.secondary}45`,
                color: palette.secondary,
                fontFamily: fonts.secondary,
              }}
            />
            <div 
              className="mt-1.5 flex justify-between text-[10px] uppercase tracking-wider font-semibold" 
              style={{ color: palette.muted, fontFamily: fonts.secondary }}
            >
              <span>Limit: 250 letters max</span>
              <span>Letters: {formData.message.length} / 250</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {status.message && (
              <span
                className={`text-xs font-semibold ${
                  status.type === "success" ? "text-emerald-600" : "text-rose-500"
                }`}
                style={{ fontFamily: fonts.secondary }}
              >
                {status.message}
              </span>
            )}

            <button
              type="submit"
              disabled={loading}
              className="rounded-full px-7 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              style={{
                backgroundColor: palette.accent,
                fontFamily: fonts.secondary,
                boxShadow: `0 14px 34px ${palette.accent}33`,
              }}
            >
              {loading ? "Sending..." : "Send message"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default HomeQuestions;