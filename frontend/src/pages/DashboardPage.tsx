import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Calendar, Mail, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { user, token, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  // Route Protection: Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      toast.error('กรุณาเข้าสู่ระบบก่อนเข้าใช้งานหน้านี้');
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24" id="dashboard-loading">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-custom-accent"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  const handleLogout = () => {
    logout();
    toast.success('ออกจากระบบสำเร็จ');
    navigate('/');
  };

  // formatting helper for creation date
  const formatJoinedDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Get initials for avatar
  const getInitials = (nameStr: string) => {
    return nameStr.trim().charAt(0).toUpperCase();
  };

  return (
    <div className="flex justify-center items-center py-12 px-4" id="dashboard-container">
      <div className="bg-custom-navbar-bg border border-custom-border rounded-[24px] p-8 max-w-2xl w-full shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col gap-8">
        
        {/* Dashboard Title & Introduction */}
        <div className="flex flex-col gap-1.5 border-b border-custom-border pb-5">
          <h2 className="text-3xl font-extrabold text-custom-text-primary tracking-tight">Dashboard</h2>
          <p className="text-sm text-custom-text-secondary">ยินดีต้อนรับเข้าสู่ระบบบัญชีผู้ใช้งานของคุณ</p>
        </div>

        {/* Profile Card */}
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start bg-custom-bg border border-custom-border rounded-2xl p-6">
          {/* Avatar representation */}
          <div className="w-20 h-20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-2 border-emerald-500/20 rounded-full flex items-center justify-center text-3xl font-bold select-none shrink-0 shadow-sm animate-pulse-short">
            {getInitials(user.name)}
          </div>

          {/* User detail lines */}
          <div className="flex flex-col gap-4 flex-grow w-full text-center md:text-left">
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-bold text-custom-text-primary flex items-center justify-center md:justify-start gap-2">
                <UserIcon size={18} className="text-custom-accent" />
                {user.name}
              </h3>
              <p className="text-xs text-custom-text-muted">User ID: {user.id}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mt-2">
              <div className="flex items-center justify-center md:justify-start gap-2.5 bg-custom-navbar-bg px-4 py-3 rounded-xl border border-custom-border">
                <Mail size={16} className="text-custom-text-muted shrink-0" />
                <span className="text-custom-text-primary truncate">{user.email}</span>
              </div>
              
              <div className="flex items-center justify-center md:justify-start gap-2.5 bg-custom-navbar-bg px-4 py-3 rounded-xl border border-custom-border">
                <Calendar size={16} className="text-custom-text-muted shrink-0" />
                <span className="text-custom-text-primary">เป็นสมาชิกเมื่อ: {formatJoinedDate(user.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security & System info */}
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 rounded-xl p-4.5 text-amber-800 dark:text-amber-300 text-sm flex gap-3 items-start">
          <ShieldAlert size={20} className="shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="font-semibold">ระบบจำลอง API (Mock Server State)</span>
            <span className="text-xs leading-relaxed opacity-90">
              สถานะเซสชันของคุณและโทเค็น ({token?.substring(0, 15)}...) ถูกบันทึกและตรวจสอบโดยจำลองสภาพแวดล้อมจริง
            </span>
          </div>
        </div>

        {/* Action Button - Logout */}
        <div className="flex justify-end gap-3 border-t border-custom-border pt-5">
          <button
            onClick={handleLogout}
            className="font-semibold py-2.5 px-6 rounded-full cursor-pointer transition-all duration-200 border border-custom-btn-border text-custom-text-primary hover:bg-[rgba(28,26,23,0.03)] dark:hover:bg-[rgba(244,242,238,0.05)] inline-flex items-center gap-2 outline-none"
            id="btn-dashboard-logout"
          >
            <LogOut size={16} />
            ออกจากระบบ (Log out)
          </button>
        </div>

      </div>
    </div>
  );
}
