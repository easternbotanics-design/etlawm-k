import CartProductCard from "./CartProductCard";
import { colours, fonts } from "../../theme/theme";

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
  return (
    <section className="min-w-0">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        

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
          items.map((item) => (
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
    </section>
  );
}

export default CartItemsSection;