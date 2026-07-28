import { Link, useLocation } from "react-router-dom";
import { User, KeyRound } from "lucide-react";

export default function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    {
      name: "Profile (โปรไฟล์)",
      path: "/profile",
      icon: User
    },
    {
      name: "Reset Password (เปลี่ยนรหัสผ่าน)",
      path: "/reset-password",
      icon: KeyRound
    }
  ];

  return (
    <aside className="w-full md:w-64 bg-custom-navbar-bg border border-custom-border rounded-[20px] p-5 flex flex-col gap-2 shrink-0 h-fit" id="sidebar">
      <h3 className="text-xs font-bold text-custom-text-muted uppercase tracking-widest px-3 mb-2 select-none">
        Account Settings
      </h3>
      <nav className="flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0" id="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shrink-0 select-none border ${
                isActive
                  ? "bg-[#4fd8e0]/15 text-[#4fd8e0] border-[#4fd8e0]/30 shadow-[0_0_12px_rgba(79,216,224,0.15)]"
                  : "text-custom-text-secondary border-transparent hover:bg-[rgba(255,255,255,0.05)] hover:text-custom-text-primary"
              }`}
            >
              <Icon size={18} className={isActive ? "text-[#4fd8e0]" : "text-custom-text-muted"} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
