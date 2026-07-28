import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../component/Sidebar';
import { toast } from 'sonner';

export default function DashboardLayout() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  // ป้องกันการเข้าถึงหากไม่ได้ล็อกอิน
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
    return null; // จะถูกเปลี่ยนหน้าผ่าน useEffect
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 w-full" id="dashboard-layout">
      <Sidebar />
      <div className="flex-grow w-full max-w-full overflow-hidden" id="dashboard-content">
        <Outlet />
      </div>
    </div>
  );
}
