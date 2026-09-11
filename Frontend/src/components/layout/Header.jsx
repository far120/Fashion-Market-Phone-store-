import { useState, useEffect } from "react";
import { FiLogOut, FiMenu, FiX, FiShoppingBag, FiUser, FiSmartphone, FiStar, FiGrid, FiShield } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { readCart, getCartTotals } from "../../utils/cart";
import CartDrawer from "../ui/CartDrawer";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const { isAuthenticated, isAdmin, isManager, user, logout } = useAuth();
  const location = useLocation();

  const userName = user?.username || "Account";

  useEffect(() => {
    setCartItems(readCart());
    const handleStorage = () => setCartItems(readCart());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [location.pathname, isCartOpen]);

  const { itemsCount } = getCartTotals(cartItems);

  function handleLogout() {
    logout();
    setIsMobileMenuOpen(false);
  }

  function isActive(path) {
    return location.pathname === path;
  }

  const linkClass = (path) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition ${
      isActive(path)
        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold"
        : "text-slate-300 hover:text-white hover:bg-slate-800/60"
    }`;

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Brand Logo */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20 transition group-hover:scale-105">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-emerald-400">
                    <FiSmartphone className="text-2xl transition group-hover:rotate-12" />
                  </div>
                </div>
                <div>
                  <span className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1">
                    FASHION <span className="text-emerald-400 font-black">&</span> TECH
                  </span>
                  <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1">
                    Smartphones & Gear
                  </span>
                </div>
              </Link>

              {/* Navigation Links */}
              <ul className="hidden lg:flex items-center gap-1">
                <li>
                  <Link to="/" className={linkClass("/")}>
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/menu" className={linkClass("/menu")}>
                    <FiGrid className="text-xs" /> Store Catalog
                  </Link>
                </li>
                <li>
                  <Link to="/reviews" className={linkClass("/reviews")}>
                    <FiStar className="text-xs" /> Reviews
                  </Link>
                </li>
                {isAuthenticated && (
                  <li>
                    <Link to="/orders" className={linkClass("/orders")}>
                      My Orders
                    </Link>
                  </li>
                )}
                {(isAdmin || isManager) && (
                  <li>
                    <Link to="/admin/dashboard" className={linkClass("/admin/dashboard")}>
                      <FiShield className="text-xs text-amber-400" />
                      <span className="text-amber-400">Admin Hub</span>
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            {/* Right Header Actions */}
            <div className="flex items-center gap-3">
              
              {/* Cart Drawer Trigger */}
              <button
                onClick={() => {
                  setCartItems(readCart());
                  setIsCartOpen(true);
                }}
                className="relative p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition flex items-center justify-center group"
                aria-label="Shopping Cart"
              >
                <FiShoppingBag className="text-xl group-hover:scale-110 transition" />
                {itemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-pulse">
                    {itemsCount}
                  </span>
                )}
              </button>

              {/* Auth / Profile Actions */}
              <div className="hidden sm:flex items-center gap-3">
                {isAuthenticated ? (
                  <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                        <FiUser />
                      </div>
                      <div className="text-left">
                        <span className="block text-xs font-bold text-white group-hover:text-emerald-400 transition truncate max-w-[90px]">
                          {userName}
                        </span>
                        <span className="block text-[9px] uppercase font-extrabold text-emerald-400">
                          {isAdmin ? "Admin" : isManager ? "Manager" : "Customer"}
                        </span>
                      </div>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="p-2.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition border border-transparent hover:border-rose-500/20"
                      title="Logout"
                    >
                      <FiLogOut className="text-lg" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      to="/login"
                      className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-emerald-500/20"
                    >
                      Create Account
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile menu hamburger toggle */}
              <button
                type="button"
                className="lg:hidden p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
              </button>

            </div>
          </div>

          {/* Mobile Drawer Navigation */}
          {isMobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-slate-800 space-y-2">
              <Link
                to="/"
                className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:bg-slate-800"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home Page
              </Link>
              <Link
                to="/menu"
                className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:bg-slate-800"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Store Catalog
              </Link>
              <Link
                to="/reviews"
                className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:bg-slate-800"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Reviews & Feedback
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/orders"
                    className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:bg-slate-800"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  <Link
                    to="/profile"
                    className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:bg-slate-800"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Profile ({userName})
                  </Link>
                  {(isAdmin || isManager) && (
                    <Link
                      to="/admin/dashboard"
                      className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-amber-400 hover:bg-slate-800"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:bg-slate-800 flex items-center gap-2"
                  >
                    <FiLogOut /> Logout
                  </button>
                </>
              ) : (
                <div className="pt-2 grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    className="text-center px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm font-semibold text-slate-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="text-center px-4 py-2.5 bg-emerald-500 rounded-xl text-sm font-bold text-slate-950"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          )}
        </nav>
      </header>

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        setCartItems={setCartItems}
      />
    </>
  );
}