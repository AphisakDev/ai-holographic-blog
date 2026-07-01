import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, Inbox, Eye, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationListPage() {
  const { notifications, markAsRead, markAllAsRead } = useAuth();
  const navigate = useNavigate();

  // กำหนดเส้นทางสำหรับการกด View ในแต่ละการแจ้งเตือน
  const handleViewNotification = (id: string, title: string) => {
    // ทำเครื่องหมายอ่านแล้ว
    markAsRead(id);

    // นำทางผู้ใช้ไปยังหน้าที่เกี่ยวข้องอิงตามหัวข้อข่าวสาร
    if (title.includes('บทความเด่นวันนี้') || title.includes('React 19')) {
      navigate('/admin/articles/edit/art-1'); // ไปหน้ารายละเอียดบทความแนะนำ
      toast.info('เปิดหน้าบทความแนะนำเรียบร้อย');
    } else if (title.includes('อัปเดตข้อมูลโปรไฟล์')) {
      navigate('/admin/profile');
      toast.info('เปิดหน้าแก้ไขโปรไฟล์ผู้ใช้');
    } else {
      navigate('/admin/articles');
      toast.info('เข้าสู่ศูนย์จัดการบทความ');
    }
  };

  return (
    <div className="bg-custom-navbar-bg border border-custom-border rounded-[24px] p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col gap-6" id="admin-notifications-container">
      {/* ส่วนหัวข้อ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-custom-border pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-custom-text-primary tracking-tight">การแจ้งเตือนทั้งหมด (Notifications)</h2>
          <p className="text-sm text-custom-text-secondary">ตรวจสอบรายการกิจกรรมและการแจ้งเตือนระบบทั้งหมดของคุณ</p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={() => {
              markAllAsRead();
              toast.success('ทำเครื่องหมายเป็นอ่านทั้งหมดแล้ว');
            }}
            className="font-semibold py-2 px-4 rounded-full cursor-pointer text-xs transition-all duration-200 border border-custom-border text-custom-text-primary hover:bg-[rgba(28,26,23,0.03)] dark:hover:bg-[rgba(244,242,238,0.05)] inline-flex items-center gap-1.5 outline-none"
            id="btn-admin-mark-all-read"
          >
            <CheckCheck size={14} />
            อ่านทั้งหมด (Mark read)
          </button>
        )}
      </div>

      {/* รายการแจ้งเตือน */}
      {notifications.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3 border border-dashed border-custom-border rounded-2xl bg-custom-bg/20" id="admin-notis-empty">
          <Inbox size={48} className="text-custom-text-muted" />
          <div className="flex flex-col gap-1">
            <h4 className="text-base font-bold text-custom-text-primary">ไม่มีการแจ้งเตือนใดๆ</h4>
            <p className="text-xs text-custom-text-muted max-w-sm px-4">
              กล่องข้อความว่างเปล่า ระบบจะแจ้งให้คุณทราบเมื่อมีข่าวสารการอัปเดตใหม่ๆ
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3" id="admin-notis-list">
          {notifications.map((noti) => (
            <div
              key={noti.id}
              className={`p-4 border rounded-2xl transition-all duration-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                !noti.isRead 
                  ? 'bg-custom-accent/[0.03] border-custom-accent/30 shadow-[0_2px_10px_rgba(16,185,129,0.02)]' 
                  : 'bg-custom-bg/20 border-custom-border'
              }`}
              id={`admin-noti-row-${noti.id}`}
            >
              {/* รายละเอียด */}
              <div className="flex gap-3 items-start flex-grow">
                <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                  !noti.isRead 
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
                    : 'bg-custom-bg border border-custom-border text-custom-text-muted'
                }`}>
                  <Bell size={16} />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className={`text-sm font-bold ${!noti.isRead ? 'text-custom-text-primary' : 'text-custom-text-secondary'}`}>
                      {noti.title}
                    </h4>
                    {!noti.isRead && (
                      <span className="bg-custom-accent text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-custom-text-secondary leading-relaxed">{noti.message}</p>
                  <span className="text-[10px] text-custom-text-muted mt-1 block">{noti.time}</span>
                </div>
              </div>

              {/* เครื่องมือดูรายละเอียด (View Action Button) */}
              <div className="w-full sm:w-auto shrink-0 flex justify-end">
                <button
                  onClick={() => handleViewNotification(noti.id, noti.title)}
                  className={`font-semibold py-2 px-4 rounded-xl cursor-pointer text-xs transition-all duration-200 inline-flex items-center gap-1.5 outline-none ${
                    !noti.isRead 
                      ? 'bg-custom-btn-signup-bg text-custom-btn-signup-text border border-custom-btn-signup-bg hover:opacity-90 shadow-sm'
                      : 'bg-transparent text-custom-text-secondary border border-custom-btn-border hover:bg-[rgba(28,26,23,0.03)] dark:hover:bg-[rgba(244,242,238,0.05)]'
                  }`}
                  id={`btn-view-noti-${noti.id}`}
                >
                  <Eye size={12} />
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
