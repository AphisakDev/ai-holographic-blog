import { useState, useRef, useEffect } from "react";
import { Menu, X, Crown, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import NotificationDropdown from "./NotificationDropdown";

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    toast.success("ออกจากระบบสำเร็จ");
    navigate("/");
  };

  // ปิดเมนูโปรไฟล์เมื่อคลิกข้างนอก
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav 
      style={{ overflow: 'visible', position: 'relative', zIndex: 100 }} 
      className="glass-panel rounded-[20px] py-[14px] px-8 flex flex-col transition-all duration-300 max-[576px]:py-3 max-[576px]:px-5 max-[576px]:rounded-[16px] shadow-[0_4px_20px_rgba(79,216,224,0.12)]" 
      id="navbar"
    >
      <div className="flex justify-between items-center w-full">
        <Link to="/" className="flex items-center gap-2 text-2xl font-extrabold text-custom-text-primary tracking-[-0.5px] select-none max-[576px]:text-xl drop-shadow-[0_0_12px_rgba(79,216,224,0.6)]" id="navbar-logo">
          <Sparkles className="w-5 h-5 text-[#4fd8e0] animate-neon-star shrink-0" />
          <span>ai-anime <span className="text-[#4fd8e0]">Hub</span></span>
        </Link>

        {/* Desktop actions */}
        <div className="flex gap-3 items-center max-[576px]:hidden" id="navbar-actions">
          {user ? (
            <div className="flex gap-4 items-center" id="navbar-user-controls">
              {/* รายการแจ้งเตือน */}
              <NotificationDropdown />

              {/* โปรไฟล์ดร็อปดาวน์ */}
              <div className="relative" ref={profileMenuRef}>
                <button 
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="glass-button text-sm py-2 px-4 rounded-full inline-flex items-center gap-2 outline-none" 
                  id="navbar-profile-toggle"
                >
                  {user.avatarUrl ? (
                    <img 
                      src={user.avatarUrl} 
                      alt={user.name} 
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : (
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      user.role === 'admin' 
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' 
                        : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {user.role === 'admin' ? (
                        <Crown size={10} className="stroke-[3]" />
                      ) : (
                        <span className="text-[10px] font-extrabold">{user.name.trim().charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                  )}
                  <span>{user.name}</span>
                </button>

                {isProfileMenuOpen && (
                  <div 
                    style={{ position: 'absolute', background: 'rgba(6, 15, 35, 0.96)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }} 
                    className="absolute right-0 mt-3 w-52 glass-panel rounded-xl shadow-[0_8px_30px_rgba(79,216,224,0.15)] py-2.5 z-50 flex flex-col animate-fade-in" 
                    id="profile-dropdown-panel"
                  >
                    <Link 
                      to={user.role === 'admin' ? '/admin/profile' : '/profile'} 
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-custom-text-secondary hover:bg-[rgba(255,255,255,0.08)] hover:text-custom-text-primary"
                    >
                      Profile (โปรไฟล์)
                    </Link>
                    <Link 
                      to={user.role === 'admin' ? '/admin/reset-password' : '/reset-password'} 
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-custom-text-secondary hover:bg-[rgba(255,255,255,0.08)] hover:text-custom-text-primary"
                    >
                      Reset Password (เปลี่ยนรหัสผ่าน)
                    </Link>
                    {user.role === 'admin' && (
                      <Link 
                        to="/admin/articles" 
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="px-3 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg mx-2 my-1 flex items-center justify-center gap-1.5"
                        id="admin-panel-link"
                      >
                        <Crown size={12} className="shrink-0" />
                        Admin Panel
                      </Link>
                    )}
                    <hr className="border-custom-border my-1.5" />
                    <button 
                      onClick={() => { setIsProfileMenuOpen(false); handleLogout(); }} 
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer border-none bg-transparent"
                    >
                      Log out (ออกจากระบบ)
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <Link 
                to="/login" 
                className="glass-button text-sm py-2 px-5 rounded-full inline-flex items-center justify-center outline-none" 
                id="btn-login"
              >
                Log in
              </Link>
              <Link 
                to="/signup" 
                className="text-sm py-2 px-5 rounded-full inline-flex items-center justify-center outline-none bg-gradient-to-r from-[#00f2fe] to-[#0052d4] text-white hover:from-[#4fd8e0] hover:to-[#0062ff] shadow-[0_4px_15px_rgba(79,216,224,0.3)] transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] font-semibold" 
                id="btn-signup"
              >
                Sign up
              </Link>
            </>
          )}
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
          isOpen ? "max-h-[350px] mt-4 opacity-100" : "max-h-0 mt-0 opacity-0 pointer-events-none"
        }`}
        id="mobile-menu"
      >
        {user ? (
          <>
            <div className="flex justify-between items-center px-4 py-2 border border-custom-border rounded-xl bg-custom-bg/40 mb-1.5">
              <span className="text-xs font-semibold text-custom-text-secondary">การแจ้งเตือน</span>
              <NotificationDropdown />
            </div>
            <Link 
              to={user.role === 'admin' ? '/admin/profile' : '/profile'} 
              onClick={() => setIsOpen(false)} 
              className="glass-button w-full text-center text-sm py-2 px-5 rounded-full" 
              id="mobile-btn-profile"
            >
              Profile (โปรไฟล์)
            </Link>
            <Link 
              to={user.role === 'admin' ? '/admin/reset-password' : '/reset-password'} 
              onClick={() => setIsOpen(false)} 
              className="glass-button w-full text-center text-sm py-2.5 px-5 rounded-full" 
              id="mobile-btn-reset-password"
            >
              Reset Password (เปลี่ยนรหัสผ่าน)
            </Link>
            {user.role === 'admin' && (
              <Link 
                to="/admin/articles" 
                onClick={() => setIsOpen(false)} 
                className="glass-button w-full text-center text-sm font-bold py-2 px-5 rounded-full bg-amber-500/15 border-amber-500/30 text-amber-400! flex items-center justify-center gap-1.5" 
                id="mobile-btn-admin"
              >
                <Crown size={14} className="shrink-0" />
                Admin Panel
              </Link>
            )}
            <button 
              onClick={() => { handleLogout(); setIsOpen(false); }} 
              className="glass-button w-full text-sm py-2 px-5 rounded-full bg-[#ef4444] hover:bg-[#ef4444]/80 text-[#ffffff]!" 
              id="mobile-btn-logout"
            >
              Log out (ออกจากระบบ)
            </button>
          </>
        ) : (
          <>
            <Link 
              to="/login" 
              onClick={() => setIsOpen(false)} 
              className="glass-button w-full text-center text-sm py-2 px-5 rounded-full" 
              id="mobile-btn-login"
            >
              Log in
            </Link>
            <Link 
              to="/signup" 
              onClick={() => setIsOpen(false)} 
              className="w-full text-center text-sm py-2 px-5 rounded-full bg-gradient-to-r from-[#00f2fe] to-[#0052d4] text-white hover:from-[#4fd8e0] hover:to-[#0062ff] shadow-[0_4px_15px_rgba(79,216,224,0.2)] font-semibold" 
              id="mobile-btn-signup"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}




