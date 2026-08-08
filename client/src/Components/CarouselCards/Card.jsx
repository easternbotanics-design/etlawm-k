import { colours, fonts } from "../../theme/theme.js";

const Card = ({
  subtitle = "This is a placeholder card component.kanf kjanf kjak acnkja ajn  fj ljf ljf ",
  bgColor = "#144d37",
  className = "",
  style = {},
}) => {
  return (
    <div
      className={`relative p-5 sm:p-6 rounded-t-2xl rounded-br-2xl shadow-xl text h-auto max-w-md ${className}`}
      style={{ backgroundColor: bgColor, ...style }}
    >
      <p
        className="text-xs sm:text-sm md:text-base text-[#fafafa] font-sans leading-relaxed whitespace-pre-line"
        style={{ fontFamily: fonts.secondary || "sans-serif" }}
      >
        {subtitle}
      </p>

      {/* Inverted right-angled triangle chat box tail at bottom left corner */}
      <div
        className="absolute left-0 top-full w-0 h-0 border-t-[16px] sm:border-t-[20px] border-r-[16px] sm:border-r-[20px] border-r-transparent"
        style={{
          borderTopColor: bgColor,
        }}
      />
    </div>
  );
};

export default Card;

