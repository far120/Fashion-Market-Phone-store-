import { FaFacebookF, FaLinkedinIn, FaTwitter } from "react-icons/fa";
import { FiArrowUpRight, FiShield, FiTruck, FiHeadphones, FiSmartphone } from "react-icons/fi";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="glass-panel border-t border-slate-800 bg-slate-950 text-slate-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid gap-10 md:grid-cols-4">
        
        {/* Logo / Brand Info */}
        <div className="space-y-4 md:col-span-1">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-emerald-400 font-bold">
                <FiSmartphone className="text-xl" />
              </div>
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-white block">
                FASHION <span className="text-emerald-400">&</span> TECH
              </span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 block -mt-1">
                Store Marketplace
              </span>
            </div>
          </Link>

          <p className="text-xs text-slate-400 leading-relaxed">
            Your destination for flagship smartphones, premium audio gear, wearable tech, and fashion accessories with official warranty and express delivery.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Quick Navigation</h3>
          <ul className="space-y-2.5 text-xs font-semibold">
            <li>
              <Link to="/" className="hover:text-emerald-400 transition flex items-center gap-1">
                Home Marketplace <FiArrowUpRight className="text-[10px]" />
              </Link>
            </li>
            <li>
              <Link to="/menu" className="hover:text-emerald-400 transition flex items-center gap-1">
                Store Catalog <FiArrowUpRight className="text-[10px]" />
              </Link>
            </li>
            <li>
              <Link to="/reviews" className="hover:text-emerald-400 transition flex items-center gap-1">
                Customer Reviews <FiArrowUpRight className="text-[10px]" />
              </Link>
            </li>
            <li>
              <Link to="/orders" className="hover:text-emerald-400 transition flex items-center gap-1">
                My Orders & Track <FiArrowUpRight className="text-[10px]" />
              </Link>
            </li>
          </ul>
        </div>

        {/* Support & Warranty */}
        <div>
          <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Customer Care</h3>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li className="flex items-center gap-2">
              <FiShield className="text-emerald-400" /> Official 2-Year Warranty
            </li>
            <li className="flex items-center gap-2">
              <FiTruck className="text-cyan-400" /> 24h Express Shipping
            </li>
            <li className="flex items-center gap-2">
              <FiHeadphones className="text-amber-400" /> 24/7 Tech Customer Support
            </li>
          </ul>
        </div>

        {/* Social Links */}
        <div>
          <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Connect With Us</h3>
          <div className="flex gap-3 text-sm">
            <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/30 flex items-center justify-center transition">
              <FaFacebookF />
            </a>
            <a href="#" aria-label="Twitter" className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/30 flex items-center justify-center transition">
              <FaTwitter />
            </a>
            <a href="#" aria-label="LinkedIn" className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/30 flex items-center justify-center transition">
              <FaLinkedinIn />
            </a>
          </div>
        </div>

      </div>

      {/* Copyright */}
      <div className="border-t border-slate-800/80 text-center text-xs py-4 text-slate-500">
        © {new Date().getFullYear()} Fashion & Tech Market. All rights reserved.
      </div>
    </footer>
  );
}