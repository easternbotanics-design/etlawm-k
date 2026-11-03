import { Minus, Plus, Trash2 } from "lucide-react";
import { colours, fonts } from "../../theme/theme";

function CartProductCard({
  item,
  onToggleSelected,
  onIncrease,
  onDecrease,
  onRemove,
  isUpdating = false,
}) {
  const size = [item.sizeValue, item.sizeUnit].filter(Boolean).join(" ");

  return (
    <article
      className="relative flex gap-3 border-b px-3.5 py-3 last:border-b-0 sm:gap-4 sm:px-4"
      style={{
        borderColor: colours.border,
        backgroundColor: colours.background,
      }}
    >
      <label className="mt-0.5 flex shrink-0 cursor-pointer items-start">
        <input
          type="checkbox"
          checked={item.selected}
          onChange={() => onToggleSelected(item.cartItemId)}
          className="h-3.5 w-3.5 cursor-pointer accent-black"
          aria-label={`Select ${item.name}`}
        />
      </label>

      <div
        className="h-20 w-18 shrink-0 overflow-hidden rounded-lg sm:h-22 sm:w-20"
        style={{
          backgroundColor: colours.primary,
        }}
      >
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="min-w-0 flex flex-1 flex-col justify-between">
        <div className="pr-6">
          {item.category && (
            <p
              className="mb-0.5 text-[10px] font-medium uppercase tracking-[0.1em]"
              style={{
                color: colours.accent,
                fontFamily: fonts.secondary,
              }}
            >
              {item.category}
            </p>
          )}

          <h3
            className="line-clamp-1 text-sm font-semibold sm:text-base"
            style={{
              color: colours.text,
              fontFamily: fonts.primary,
            }}
          >
            {item.name}
          </h3>

          {size && (
            <p
              className="mt-0.5 text-xs opacity-60"
              style={{
                color: colours.text,
                fontFamily: fonts.secondary,
              }}
            >
              {size}
            </p>
          )}

          {item.stockQty > 0 && item.stockQty <= 5 && (
            <p
              className="mt-1 text-[11px] font-medium"
              style={{
                color: colours.accent,
                fontFamily: fonts.secondary,
              }}
            >
              Only {item.stockQty} left
            </p>
          )}
        </div>

        <div className="mt-2.5 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p
              className="text-sm font-semibold"
              style={{
                color: colours.text,
                fontFamily: fonts.primary,
              }}
            >
              ₹{item.price.toFixed(2)}
            </p>

            {item.originalPrice && item.originalPrice > item.price && (
              <p
                className="text-[11px] line-through opacity-45"
                style={{
                  color: colours.text,
                  fontFamily: fonts.secondary,
                }}
              >
                ₹{item.originalPrice.toFixed(2)}
              </p>
            )}
          </div>

          <div
            className="flex h-7 items-center overflow-hidden rounded-lg border"
            style={{
              borderColor: colours.border,
              backgroundColor: colours.background,
            }}
          >
            <button
              type="button"
              onClick={() => onDecrease(item)}
              disabled={isUpdating}
              className="flex h-full w-7 cursor-pointer items-center justify-center transition-opacity hover:opacity-60 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label={`Decrease ${item.name} quantity`}
            >
              <Minus size={12} />
            </button>

            <span
              className="min-w-6 text-center text-xs font-medium"
              style={{
                color: colours.text,
                fontFamily: fonts.secondary,
              }}
            >
              {item.quantity}
            </span>

            <button
              type="button"
              onClick={() => onIncrease(item)}
              disabled={isUpdating || item.quantity >= item.stockQty}
              className="flex h-full w-7 cursor-pointer items-center justify-center transition-opacity hover:opacity-60 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label={`Increase ${item.name} quantity`}
            >
              <Plus size={12} />
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onRemove(item.cartItemId)}
        disabled={isUpdating}
        className="absolute right-3 top-3.5 cursor-pointer opacity-45 transition-opacity hover:opacity-100 disabled:cursor-not-allowed"
        style={{
          color: colours.text,
        }}
        aria-label={`Remove ${item.name}`}
      >
        <Trash2 size={15} />
      </button>
    </article>
  );
}

export default CartProductCard;