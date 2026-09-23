import { useMemo } from "react";
import CartProductCard from "./CartProductCard";
import { colours, fonts } from "../../theme/theme";
import { Sparkles } from "lucide-react";

function isComboProduct(item) {
  const name = item.name || "";
  const slug = item.slug || "";
  const isOil =
    /herbal.*hair.*oil/i.test(name) ||
    /herbal.*oil/i.test(name) ||
    (/hair/i.test(name) && /oil/i.test(name) && !/argan/i.test(name));
  const isElixir = /elixir/i.test(name) || /elixir/i.test(slug);
  return isOil || isElixir;
}

function CartItemsSection({
  items,
  selectedCount,
  allSelected,
  updatingItemId,
  onToggleAll,
  onToggleSelected,
  onIncrease,
  onDecrease,
  onRemove,
  onRemoveSelected,
}) {
  const { individualItems, comboItems, hasComboPair } = useMemo(() => {
    const hasOil = items.some(
      (item) =>
        /herbal.*hair.*oil/i.test(item.name || "") ||
        /herbal.*oil/i.test(item.name || "") ||
        (/hair/i.test(item.name || "") && /oil/i.test(item.name || "") && !/argan/i.test(item.name || ""))
    );
    const hasElixir = items.some(
      (item) =>
        /elixir/i.test(item.name || "") ||
        /elixir/i.test(item.slug || "")
    );

    const comboActive = hasOil && hasElixir;

    if (!comboActive) {
      return { individualItems: items, comboItems: [], hasComboPair: false };
    }

    const cItems = [];
    const iItems = [];

    items.forEach((item) => {
      if (isComboProduct(item)) {
        cItems.push(item);
      } else {
        iItems.push(item);
      }
    });

    return { individualItems: iItems, comboItems: cItems, hasComboPair: true };
  }, [items]);

  return (
    <section className="min-w-0 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {selectedCount > 0 && (
          <button
            type="button"
            onClick={onRemoveSelected}
            className="cursor-pointer text-sm font-medium opacity-60 transition-opacity hover:opacity-100"
            style={{
              color: colours.text,
              fontFamily: fonts.secondary,
            }}
          >
            Remove selected
          </button>
        )}
      </div>

      {/* Main / Individual Products */}
      {(individualItems.length > 0 || !hasComboPair) && (
        <div
          className="overflow-hidden rounded-2xl border"
          style={{
            borderColor: colours.border,
            backgroundColor: colours.background,
          }}
        >
          {items.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <h2
                className="text-xl font-semibold"
                style={{
                  color: colours.text,
                  fontFamily: fonts.primary,
                }}
              >
                Your cart is empty
              </h2>

              <p
                className="mt-2 text-sm opacity-55"
                style={{
                  color: colours.text,
                  fontFamily: fonts.secondary,
                }}
              >
                Products added to the cart will appear here.
              </p>
            </div>
          ) : (
            individualItems.map((item) => (
              <CartProductCard
                key={item.cartItemId}
                item={item}
                isUpdating={updatingItemId === item.cartItemId}
                onToggleSelected={onToggleSelected}
                onIncrease={onIncrease}
                onDecrease={onDecrease}
                onRemove={onRemove}
              />
            ))
          )}
        </div>
      )}

      {/* Paired Combos Section */}
      {hasComboPair && comboItems.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 px-1">
            <Sparkles size={16} style={{ color: colours.accent }} />
            <h3
              className="text-sm font-semibold uppercase tracking-wider text-[#171715]"
              style={{ fontFamily: fonts.primary }}
            >
              combos
            </h3>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider text-emerald-800 bg-emerald-100/80 border border-emerald-200"
              style={{ fontFamily: fonts.secondary }}
            >
              20% OFF Combo Applied
            </span>
          </div>

          <div
            className="overflow-hidden rounded-2xl border bg-amber-50/10"
            style={{
              borderColor: colours.accent || colours.border,
              backgroundColor: colours.background,
            }}
          >
            {comboItems.map((item) => (
              <CartProductCard
                key={item.cartItemId}
                item={item}
                isUpdating={updatingItemId === item.cartItemId}
                onToggleSelected={onToggleSelected}
                onIncrease={onIncrease}
                onDecrease={onDecrease}
                onRemove={onRemove}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default CartItemsSection;