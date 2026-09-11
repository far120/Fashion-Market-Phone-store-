import { Link } from "react-router-dom";
import { FiX, FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiArrowRight } from "react-icons/fi";
import { updateCartItem, removeCartItem, clearCart, getCartTotals } from "../../utils/cart";

export default function CartDrawer({ isOpen, onClose, cartItems, setCartItems }) {
  if (!isOpen) return null;

  const { itemsCount, totalAmount } = getCartTotals(cartItems);
  const freeShippingThreshold = 100;
  const freeShippingProgress = Math.min(100, (totalAmount / freeShippingThreshold) * 100);

  function handleQuantityChange(productId, delta, currentQty) {
    const nextQty = currentQty + delta;
    if (nextQty <= 0) {
      handleRemove(productId);
    } else {
      const updated = updateCartItem(productId, nextQty);
      setCartItems(updated);
    }
  }

  function handleRemove(productId) {
    const updated = removeCartItem(productId);
    setCartItems(updated);
  }

  function handleClear() {
    clearCart();
    setCartItems([]);
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 text-slate-100 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <FiShoppingBag className="text-xl" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Your Shopping Cart</h2>
                <p className="text-xs text-slate-400">{itemsCount} {itemsCount === 1 ? "item" : "items"} selected</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              aria-label="Close cart"
            >
              <FiX className="text-xl" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="px-6 py-3 bg-slate-800/50 border-b border-slate-800 text-xs">
            {totalAmount >= freeShippingThreshold ? (
              <p className="text-emerald-400 font-medium text-center">🎉 You unlocked FREE Express Shipping!</p>
            ) : (
              <div>
                <p className="text-slate-300 mb-1.5 flex justify-between">
                  <span>Add <strong className="text-emerald-400">${(freeShippingThreshold - totalAmount).toFixed(2)}</strong> for Free Shipping</span>
                  <span>{Math.round(freeShippingProgress)}%</span>
                </p>
                <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-emerald-400 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center text-slate-600 mb-4">
                  <FiShoppingBag className="text-4xl" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">Your cart is empty</h3>
                <p className="text-slate-400 text-sm mb-6">Discover our latest smartphones and fashion accessories.</p>
                <Link
                  to="/menu"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm rounded-xl transition shadow-lg shadow-emerald-500/20"
                >
                  Explore Store
                </Link>
              </div>
            ) : (
              cartItems.map((item) => (
                <div 
                  key={item.productId}
                  className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 flex gap-4 items-center transition hover:border-slate-600"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white text-sm truncate">{item.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">${Number(item.price).toFixed(2)} each</p>
                    
                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-0.5">
                        <button
                          onClick={() => handleQuantityChange(item.productId, -1, item.quantity)}
                          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white rounded transition"
                          aria-label="Decrease quantity"
                        >
                          <FiMinus className="text-xs" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-white">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.productId, 1, item.quantity)}
                          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white rounded transition"
                          aria-label="Increase quantity"
                        >
                          <FiPlus className="text-xs" />
                        </button>
                      </div>

                      <span className="font-bold text-emerald-400 text-sm">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemove(item.productId)}
                    className="p-2 text-slate-500 hover:text-rose-400 transition rounded-lg hover:bg-slate-700/50"
                    title="Remove item"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer / Summary */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-slate-800 bg-slate-900/90 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="text-white font-medium">${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Shipping</span>
                  <span className="text-emerald-400 font-medium">
                    {totalAmount >= freeShippingThreshold ? "FREE" : "$9.99"}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-800">
                  <span>Total</span>
                  <span className="text-emerald-400 text-lg">
                    ${(totalAmount + (totalAmount >= freeShippingThreshold ? 0 : 9.99)).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleClear}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition"
                >
                  Clear Cart
                </button>
                <Link
                  to="/orders"
                  onClick={onClose}
                  className="px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
                >
                  Checkout <FiArrowRight />
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
