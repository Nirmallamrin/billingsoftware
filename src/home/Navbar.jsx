import React from 'react'
import { Link } from 'react-router-dom'
import { FiChevronDown } from "react-icons/fi";
import logo from '../assets/logo.png';

const Navbar = () => {
  return (
    <header className="fixed top-0 left-0 w-full z-50 border-b border-white/1 backdrop-blur-md bg-black/1">
      <div className="max-w-7xl mx-auto h-18 flex items-center justify-between px-20">
        <div className="flex items-center gap-12">
          <Link to="/" className="flex items-center bg-white p-1 rounded-lg shrink-0">
            <img src={logo} alt="Invox Logo" className="h-10 w-auto " />
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            <button className="text-zinc-400 hover:text-white font-semibold transition-all flex items-center gap-1.5 group text-sm uppercase tracking-wider">
              Platform{" "}
              <FiChevronDown
                size={14}
                className="group-hover:rotate-180 transition-transform"
              />
            </button>
            <button className="text-zinc-400 hover:text-white font-semibold transition-all flex items-center gap-1.5 group text-sm uppercase tracking-wider">
              Resources{" "}
              <FiChevronDown
                size={14}
                className="group-hover:rotate-180 transition-transform"
              />
            </button>
            <Link
              to="/"
              className="text-zinc-400 hover:text-white font-semibold transition-all text-xs uppercase tracking-wider"
            >
              Guide
            </Link>
            <Link
              to="/"
              className="text-zinc-400 hover:text-white font-semibold transition-all text-xs uppercase tracking-wider"
            >
              Blog
            </Link>
            <Link
              to="/"
              className="text-zinc-400 hover:text-white font-semibold transition-all text-xs uppercase tracking-wider"
            >
              Pricing
            </Link>
            <Link
              to="/"
              className="text-zinc-400 hover:text-white font-semibold transition-all text-xs uppercase tracking-wider"
            >
              Contact
            </Link>
            <Link
              to="/"
              className="text-zinc-400 hover:text-white font-semibold transition-all text-xs uppercase tracking-wider"
            >
             About
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-8">
          
          <div className="flex items-center gap-4">
            
            <Link
              to="/signup"
              className="px-7 py-3 rounded bg-white text-black font-bold hover:bg-zinc-200 transition-all shadow-xl shadow-white/5 text-[11px] uppercase tracking-[0.2em]"
            >
              Get Start
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar