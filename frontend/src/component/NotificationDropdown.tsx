import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Inbox } from 'lucide-react';

export default function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ปิดเมนูป๊อปอัพเมื่อคลิกข้างนอก
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef} id="notification-dropdown">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-full border border-custom-btn-border hover:bg-[rgba(28,26,23,0.03)] dark:hover:bg-[rgba(244,242,238,0.05)] cursor-pointer text-custom-text-primary transition-all duration-200 outline-none flex items-center justify-center"
        id="btn-notifications-toggle"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span 
            className="absolute -top-1.5 -right-1.5 bg-rose-500 text-[10px] text-white font-extrabold w-5 h-5 rounded-full flex items-center justify-center border border-custom-navbar-bg animate-pulse-short" 
            id="noti-badge"
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div 
          style={{ position: 'absolute', background: 'rgba(6, 15, 35, 0.96)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
          className="absolute right-0 mt-3 w-80 sm:w-96 glass-panel rounded-2xl shadow-[0_12px_40px_rgba(79,216,224,0.25)] py-4 z-50 flex flex-col gap-3 animate-fade-in" 
          id="notification-panel"
        >
          {/* ส่วนหัวป๊อปอัพ */}
          <div className="flex justify-between items-center px-4 pb-2 border-b border-custom-border">
            <h4 className="text-sm font-extrabold text-custom-text-primary">การแจ้งเตือน</h4>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] font-bold text-custom-accent hover:underline cursor-pointer bg-transparent border-none outline-none"
                id="btn-mark-all-read"
              >
                อ่านทั้งหมด (Mark all read)
              </button>
            )}
          </div>

          {/* รายการแจ้งเตือน */}
          <div className="max-h-72 overflow-y-auto flex flex-col divide-y divide-custom-border" id="notifications-list">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center gap-2">
                <Inbox size={28} className="text-custom-text-muted" />
                <p className="text-xs text-custom-text-muted">ไม่มีรายการแจ้งเตือน</p>
              </div>
            ) : (
              notifications.map((noti) => (
                <div
                  key={noti.id}
                  onClick={() => markAsRead(noti.id)}
                  className={`flex flex-col gap-1 p-3.5 hover:bg-[rgba(28,26,23,0.02)] dark:hover:bg-[rgba(244,242,238,0.02)] transition-colors cursor-pointer relative ${
                    !noti.isRead ? 'bg-custom-accent/[0.03]' : ''
                  }`}
                  id={`noti-item-${noti.id}`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className={`text-xs font-bold ${!noti.isRead ? 'text-custom-text-primary' : 'text-custom-text-secondary'}`}>
                      {noti.title}
                    </span>
                    <span className="text-[10px] text-custom-text-muted shrink-0">{noti.time}</span>
                  </div>
                  <p className="text-[11px] text-custom-text-secondary leading-relaxed">{noti.message}</p>
                  
                  {!noti.isRead && (
                    <div className="absolute right-3.5 bottom-3.5 w-1.5 h-1.5 bg-custom-accent rounded-full" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
