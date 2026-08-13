import { Pencil, Trash2 } from "lucide-react";
import { colours, fonts } from "../../theme/theme";

const AdminCard = ({
  title,
  onClick,
  editMode = false,
  onEdit,
  onDelete,
  showDelete = true,
}) => {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick && onClick();
        }
      }}
      className="group relative flex h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
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
      {editMode && (
        <div className="absolute right-4 top-4 flex gap-2">
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="rounded-lg border p-2 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
              style={{
                borderColor: colours.border,
                color: colours.accent,
                backgroundColor: colours.background,
              }}
            >
              <Pencil size={15} />
            </button>
          )}

          {onDelete && showDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="rounded-lg border p-2 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
              style={{
                borderColor: colours.border,
                color: "#A44A3F",
                backgroundColor: colours.background,
              }}
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col items-center justify-center">
        <h3
          className="text-xl font-semibold transition-colors duration-300 group-hover:text-[#A77C6B]"
          style={{
            color: colours.text,
            fontFamily: fonts.primary,
          }}
        >
          {title}
        </h3>

        
      </div>
    </div>
  );
};

export default AdminCard;
