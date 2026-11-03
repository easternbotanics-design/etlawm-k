import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { colours, fonts } from "../theme/theme";

export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  disabled = false,
  className = "",
  style = {},
  inputClassName = "h-12 rounded-xl px-4 text-sm",
  optionClassName = "px-4 py-3 text-sm",
  inputStyle = {},
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ fontFamily: fonts.secondary, ...style }}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between border bg-transparent outline-none transition-all disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer ${inputClassName}`}
        style={{
          borderColor: colours.border,
          color: colours.text,
          ...inputStyle,
        }}
      >
        <span className={!selectedOption ? "opacity-55" : ""}>{displayLabel}</span>
        {isOpen ? (
          <ChevronUp size={16} className="opacity-60" />
        ) : (
          <ChevronDown size={16} className="opacity-60" />
        )}
      </button>

      {isOpen && !disabled && (
        <div
          data-lenis-prevent
          className="absolute left-0 right-0 z-[100] mt-2 max-h-60 overflow-y-auto rounded-xl border bg-white py-1 shadow-lg dropdown-scrollbar"
          style={{
            borderColor: colours.border,
          }}
        >
          {options.length === 0 ? (
            <div className={`opacity-55 ${optionClassName}`}>No options available</div>
          ) : (
            options.map((option) => {
              const isSelected = String(option.value) === String(value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left transition-colors flex items-center justify-between cursor-pointer ${optionClassName}`}
                  style={{
                    backgroundColor: isSelected ? `${colours.primary}` : "transparent",
                    color: colours.text,
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.03)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <span>{option.label}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
