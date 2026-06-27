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
      className="relative flex gap-4 border-b px-4 py-5 last:border-b-0 sm:px-5"
      style={{
        borderColor: colours.border,
        backgroundColor: colours.background,
      }}
    >
      <label className="mt-1 flex shrink-0 cursor-pointer items-start">
        <input
          type="checkbox"
          checked={item.selected}
          onChange={() => onToggleSelected(item.cartItemId)}
          className="h-4 w-4 cursor-pointer accent-black"
          aria-label={`Select ${item.name}`}
        />
      </label>

      <div
        className="h-28 w-24 shrink-0 overflow-hidden rounded-xl sm:h-32 sm:w-28"
        style={{
          backgroundColor: colours.primary,
        }}
      >
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-contain p-2"
        />
      </div>

      <div className="min-w-0 flex flex-1 flex-col justify-between">
        <div className="pr-8">
          {item.category && (
            <p
              className="mb-1 text-xs font-medium uppercase tracking-[0.12em]"
              style={{
                color: colours.accent,
                fontFamily: fonts.secondary,
              }}
            >
              {item.category}
            </p>
          )}

          <h3
            className="line-clamp-2 text-base font-semibold sm:text-lg"
            style={{
              color: colours.text,
              fontFamily: fonts.primary,
            }}
          >
            {item.name}
          </h3>

          {size && (
            <p
              className="mt-1 text-sm opacity-60"
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
              className="mt-2 text-xs font-medium"
              style={{
                color: colours.accent,
                fontFamily: fonts.secondary,
              }}
            >
              Only {item.stockQty} left
            </p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p
              className="text-base font-semibold"
              style={{
                color: colours.text,
                fontFamily: fonts.primary,
              }}
            >
              ₹{item.price.toFixed(2)}
            </p>

            {item.originalPrice && item.originalPrice > item.price && (
              <p
                className="text-xs line-through opacity-45"
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
            className="flex h-9 items-center overflow-hidden rounded-full border"
            style={{
              borderColor: colours.border,
              backgroundColor: colours.background,
            }}
          >
            <button
              type="button"
              onClick={() => onDecrease(item)}
              disabled={isUpdating}
              className="flex h-full w-9 cursor-pointer items-center justify-center transition-opacity hover:opacity-60 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label={`Decrease ${item.name} quantity`}
            >
              <Minus size={14} />
            </button>

            <span
              className="min-w-8 text-center text-sm font-medium"
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
              className="flex h-full w-9 cursor-pointer items-center justify-center transition-opacity hover:opacity-60 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label={`Increase ${item.name} quantity`}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onRemove(item.cartItemId)}
        disabled={isUpdating}
        className="absolute right-4 top-5 cursor-pointer opacity-45 transition-opacity hover:opacity-100 disabled:cursor-not-allowed"
        style={{
          color: colours.text,
        }}
        aria-label={`Remove ${item.name}`}
      >
        <Trash2 size={17} />
      </button>
    </article>
  );
}

export default CartProductCard;