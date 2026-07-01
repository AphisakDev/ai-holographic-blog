import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getArticles, deleteArticle, getCategories } from '../lib/adminService';
import type { Article, Category } from '../lib/adminService';
import { Search, Plus, Edit, Trash2, Inbox, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function ArticleListPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // กรองข้อมูล (Filter states)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // ลบบทความ (Delete state)
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // โหลดรายการบทความและหมวดหมู่
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [artList, catList] = await Promise.all([getArticles(), getCategories()]);
      setArticles(artList);
      setCategories(catList);
    } catch (e) {
      toast.error('ไม่สามารถโหลดข้อมูลบทความได้');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ยืนยันการลบบทความ
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteArticle(deleteTarget.id);
      toast.success(`ลบบทความ "${deleteTarget.title}" สำเร็จเรียบร้อย`);
      setDeleteTarget(null);
      // รีโหลดข้อมูลใหม่
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'เกิดข้อผิดพลาดในการลบบทความ');
    } finally {
      setIsDeleting(false);
    }
  };

  // กรองรายการบทความ (Filter logic)
  const filteredArticles = articles.filter((art) => {
    const matchesSearch = art.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? art.category === selectedCategory : true;
    const matchesStatus = selectedStatus ? art.status === selectedStatus : true;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // ฟอร์แมตวันที่จัดแสดง
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('th-TH', {
        year: '2-digit',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="bg-custom-navbar-bg border border-custom-border rounded-[24px] p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col gap-6" id="article-list-container">
      {/* ส่วนหัวหน้า */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-custom-border pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-custom-text-primary tracking-tight">คลังบทความ (Article Management)</h2>
          <p className="text-sm text-custom-text-secondary">ค้นหา กรองข้อมูล สร้าง แก้ไข และลบบทความทั้งหมดในระบบ</p>
        </div>
        <Link
          to="/admin/articles/create"
          className="font-semibold py-2.5 px-5 rounded-full cursor-pointer transition-all duration-200 ease-out inline-flex items-center gap-2 bg-custom-accent text-white hover:opacity-90 shadow-sm focus:outline-none"
          id="btn-create-article"
        >
          <Plus size={16} />
          Create article
        </Link>
      </div>

      {/* แถบตัวกรองและกล่องค้นหา (Search & Filter Controls) */}
      <div className="flex flex-col md:flex-row gap-3.5 items-stretch md:items-center bg-custom-bg/60 border border-custom-border p-4.5 rounded-2xl" id="filter-controls">
        {/* ช่อง Search */}
        <div className="relative flex items-center flex-grow">
          <Search size={16} className="absolute left-4 text-custom-text-muted" />
          <input
            type="text"
            placeholder="ค้นหาชื่อบทความ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-sm pl-11 pr-4 py-2.5 bg-custom-navbar-bg border border-custom-border rounded-xl text-custom-text-primary placeholder-custom-text-muted focus:outline-none focus:ring-3 focus:ring-custom-accent/20 focus:border-transparent transition-all duration-200"
            id="input-search-articles"
          />
        </div>

        {/* กรองตาม Category */}
        <div className="w-full md:w-44">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full text-sm px-4 py-2.5 bg-custom-navbar-bg border border-custom-border rounded-xl text-custom-text-primary focus:outline-none focus:ring-3 focus:ring-custom-accent/20 transition-all duration-200"
            id="filter-category"
          >
            <option value="" className="bg-[#120c24] text-white">ทุกหมวดหมู่ (All Categories)</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name} className="bg-[#120c24] text-white">{cat.name}</option>
            ))}
          </select>
        </div>

        {/* กรองตาม Status */}
        <div className="w-full md:w-40">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full text-sm px-4 py-2.5 bg-custom-navbar-bg border border-custom-border rounded-xl text-custom-text-primary focus:outline-none focus:ring-3 focus:ring-custom-accent/20 transition-all duration-200"
            id="filter-status"
          >
            <option value="" className="bg-[#120c24] text-white">ทุกสถานะ (All)</option>
            <option value="published" className="bg-[#120c24] text-white">Published</option>
            <option value="draft" className="bg-[#120c24] text-white">Draft</option>
          </select>
        </div>
      </div>

      {/* แสดงผลรายการบทความ */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20" id="articles-loading">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-custom-accent"></div>
        </div>
      ) : filteredArticles.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3 border border-dashed border-custom-border rounded-2xl bg-custom-bg/20" id="articles-empty-state">
          <Inbox size={48} className="text-custom-text-muted" />
          <div className="flex flex-col gap-1">
            <h4 className="text-base font-bold text-custom-text-primary">ไม่พบบทความใดๆ</h4>
            <p className="text-xs text-custom-text-muted max-w-sm px-4">
              ไม่มีบทความที่ตรงตามเงื่อนไขการกรองหรือคำค้นหาของคุณ ลองเปลี่ยนคำค้นหรือสร้างบทความชิ้นแรก
            </p>
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="overflow-x-auto border border-custom-border rounded-xl" id="articles-table-wrapper">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-custom-bg border-b border-custom-border text-custom-text-primary font-bold">
                <th className="py-3.5 px-4 font-semibold">ชื่อบทความ</th>
                <th className="py-3.5 px-4 font-semibold hidden sm:table-cell">หมวดหมู่</th>
                <th className="py-3.5 px-4 font-semibold hidden md:table-cell">วันที่สร้าง</th>
                <th className="py-3.5 px-4 font-semibold">สถานะ</th>
                <th className="py-3.5 px-4 font-semibold text-right">เครื่องมือ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-custom-border">
              {filteredArticles.map((art) => (
                <tr key={art.id} className="hover:bg-custom-bg/30 text-custom-text-secondary transition-colors" id={`art-row-${art.id}`}>
                  <td className="py-3.5 px-4 font-medium text-custom-text-primary max-w-xs sm:max-w-md truncate">
                    <span className="block font-bold truncate">{art.title}</span>
                    <span className="text-[11px] text-custom-text-muted block sm:hidden mt-0.5">{art.category}</span>
                  </td>
                  <td className="py-3.5 px-4 hidden sm:table-cell">
                    <span className="px-2.5 py-1 text-[11px] font-semibold border border-custom-border bg-custom-bg rounded-lg">
                      {art.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 hidden md:table-cell text-xs">{formatDate(art.createdAt)}</td>
                  <td className="py-3.5 px-4">
                    {art.status === 'published' ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Published
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex justify-end gap-2.5">
                      <Link
                        to={`/admin/articles/edit/${art.id}`}
                        className="p-2 border border-custom-btn-border hover:bg-[rgba(28,26,23,0.03)] dark:hover:bg-[rgba(244,242,238,0.05)] text-custom-text-primary rounded-lg transition-colors cursor-pointer"
                        id={`btn-edit-${art.id}`}
                        title="แก้ไขบทความ"
                      >
                        <Edit size={14} />
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(art)}
                        className="p-2 border border-rose-500/20 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 rounded-lg transition-colors cursor-pointer"
                        id={`btn-delete-${art.id}`}
                        title="ลบบทความ"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* กล่องข้อความยืนยันการลบบทความ (Delete Confirmation Dialog) */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-rose-500 flex items-center gap-2">
              <AlertTriangle size={18} />
              ยืนยันการลบบทความ
            </AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจว่าต้องการลบบทความ <strong>"{deleteTarget?.title}"</strong> ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนคืนกลับมาได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>ยกเลิก (Cancel)</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              disabled={isDeleting}
              className="bg-rose-600 hover:bg-rose-500 text-white font-semibold"
            >
              {isDeleting ? 'กำลังลบ...' : 'ลบออกทันที (Delete)'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
