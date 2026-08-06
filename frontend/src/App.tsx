import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './component/NavBar';
import Footer from './component/Footer';
import LandingPage from './pages/LandingPage';
import ViewPostPage from './pages/ViewPostPage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './pages/DashboardLayout';
import ProfilePage from './pages/ProfilePage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminLayout from './pages/AdminLayout';
import ArticleListPage from './pages/ArticleListPage';
import ArticleFormPage from './pages/ArticleFormPage';
import CreatePostComponent from './component/CreatePostComponent';
import CategoryListPage from './pages/CategoryListPage';
import NotificationListPage from './pages/NotificationListPage';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Floating Hologram Background Glows */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[15%] left-[5%] w-[400px] h-[400px] rounded-full bg-[#4fd8e0]/20 filter blur-[100px] animate-pulse-slow"></div>
          <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] rounded-full bg-[#d946ef]/15 filter blur-[130px] animate-pulse-slower"></div>
          <div className="absolute top-[50%] left-[45%] w-[350px] h-[350px] rounded-full bg-[#2563eb]/15 filter blur-[110px] animate-pulse-slow"></div>
        </div>
        
        <main className="w-full max-w-[1200px] mx-auto px-6 pt-10 pb-12 flex flex-col gap-12 flex-grow relative z-10" id="main-content">
          <NavBar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/post/:postId" element={<ViewPostPage />} />
            <Route path="/signup" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* เส้นทางที่ต้องล็อกอินสำหรับ User ทั่วไป */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Navigate to="/profile" replace />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>

            {/* เส้นทางควบคุมทั้งหมดของ Admin ทำการป้องกันผ่าน AdminLayout */}
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<Navigate to="/admin/articles" replace />} />
              <Route path="/admin/articles" element={<ArticleListPage />} />
              <Route path="/admin/articles/create" element={<ArticleFormPage />} />
              <Route path="/admin/create-post" element={<CreatePostComponent />} />
              <Route path="/create-post" element={<CreatePostComponent />} />
              <Route path="/admin/articles/edit/:id" element={<ArticleFormPage />} />
              <Route path="/admin/categories" element={<CategoryListPage />} />
              <Route path="/admin/profile" element={<ProfilePage />} />
              <Route path="/admin/reset-password" element={<ResetPasswordPage />} />
              <Route path="/admin/notifications" element={<NotificationListPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
        <Toaster richColors position="top-right" closeButton />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;





