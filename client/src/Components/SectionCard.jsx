import { ArrowRight } from "lucide-react";
import { colours, fonts } from "../theme/theme";

const SectionCard = ({ title, description, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="cursor-pointer group flex h-28 w-full w-max-sm flex-col justify-between rounded-2xl border p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
      style={{
        backgroundColor: colours.background,
        borderColor: colours.border,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = colours.accent;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = colours.border;
      }}
    >
      <div className="flex items-center gap-2">
        <h3
          className="text-2xl font-semibold"
          style={{
            color: colours.text,
            fontFamily: fonts.primary,
          }}
        >
          {title}
        </h3>

        <ArrowRight
          size={18}
          className="transition-transform duration-300 group-hover:translate-x-1"
          style={{
            color: colours.accent,
          }}
        />
      </div>

      {description && (
        <p
          className="mt-2 text-sm"
          style={{
            color: colours.mutedText,
            fontFamily: fonts.secondary,
          }}
        >
          {description}
        </p>
      )}
    </button>
  );
};

export default SectionCard;