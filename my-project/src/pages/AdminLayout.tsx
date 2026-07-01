import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '../component/AdminSidebar';
import { toast } from 'sonner';

export default function AdminLayout() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  // ตรวจสอบความถูกต้องของสิทธิ์การเป็น Admin
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        toast.error('กรุณาเข้าสู่ระบบก่อนเข้าใช้งานหน้านี้');
        navigate('/login');
      } else if (user.role !== 'admin') {
        toast.error('สิทธิ์การเข้าถึงสำหรับผู้ดูแลระบบ (Admin) เท่านั้น');
        navigate('/');
      }
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24" id="admin-loading">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-custom-accent"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null; // จะถูกเปลี่ยนหน้าอัตโนมัติใน useEffect
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 w-full" id="admin-layout">
      <AdminSidebar />
      <div className="flex-grow w-full max-w-full overflow-hidden" id="admin-content">
        <Outlet />
      </div>
    </div>
  );
}
