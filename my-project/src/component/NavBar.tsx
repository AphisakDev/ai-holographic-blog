

import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-custom-navbar-bg border border-custom-border rounded-[20px] py-[14px] px-8 flex flex-col transition-all duration-300 max-[576px]:py-3 max-[576px]:px-5 max-[576px]:rounded-[16px] shadow-[0_4px_20px_rgba(28,26,23,0.02)]" id="navbar">
      <div className="flex justify-between items-center w-full">
        <div className="text-2xl font-extrabold text-custom-text-primary tracking-[-0.5px] select-none max-[576px]:text-xl" id="navbar-logo">
          hh<span className="text-custom-accent">.</span>
        </div>
        
        {/* Desktop actions */}
        <div className="flex gap-3 max-[576px]:hidden" id="navbar-actions">
          <button className="text-sm font-semibold py-2.5 px-6 rounded-full cursor-pointer transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] inline-flex items-center justify-center outline-none bg-transparent border border-custom-btn-border text-custom-text-primary hover:bg-[rgba(28,26,23,0.03)] dark:hover:bg-[rgba(244,242,238,0.05)] hover:border-custom-text-primary" id="btn-login">Log in</button>
          <button className="text-sm font-semibold py-2.5 px-6 rounded-full cursor-pointer transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] inline-flex items-center justify-center outline-none bg-custom-btn-signup-bg border border-custom-btn-signup-bg text-custom-btn-signup-text shadow-[0_2px_8px_rgba(28,26,23,0.08)] hover:opacity-90 hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(28,26,23,0.15)]" id="btn-signup">Sign up</button>
        </div>

        {/* Mobile menu toggle button */}
        <button
          className="hidden max-[576px]:flex items-center justify-center p-2 rounded-full text-custom-text-primary hover:bg-[rgba(28,26,23,0.05)] dark:hover:bg-[rgba(244,242,238,0.05)] focus:outline-none transition-all duration-200 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
          id="menu-toggle"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X size={20} className="w-5 h-5 transition-transform duration-200 rotate-90" />
          ) : (
            <Menu size={20} className="w-5 h-5 transition-transform duration-200" />
          )}
        </button>
      </div>

      {/* Mobile action menu */}
      <div
        className={`hidden max-[576px]:flex flex-col gap-2.5 overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[120px] mt-4 opacity-100" : "max-h-0 mt-0 opacity-0 pointer-events-none"
        }`}
        id="mobile-menu"
      >
        <button className="w-full text-sm font-semibold py-2 px-5 rounded-full cursor-pointer transition-all duration-200 bg-transparent border border-custom-btn-border text-custom-text-primary hover:bg-[rgba(28,26,23,0.03)] dark:hover:bg-[rgba(244,242,238,0.05)]" id="mobile-btn-login">Log in</button>
        <button className="w-full text-sm font-semibold py-2 px-5 rounded-full cursor-pointer transition-all duration-200 bg-custom-btn-signup-bg border border-custom-btn-signup-bg text-custom-btn-signup-text shadow-[0_2px_8px_rgba(28,26,23,0.08)] hover:opacity-90" id="mobile-btn-signup">Sign up</button>
      </div>
    </nav>
  );
}


