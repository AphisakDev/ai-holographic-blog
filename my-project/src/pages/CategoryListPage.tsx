import React, { useState, useEffect } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../lib/adminService';
import type { Category } from '../lib/adminService';
import { Search, Plus, Edit, Trash2, Inbox, AlertTriangle, Loader2 } from 'lucide-react';
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

export default function CategoryListPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // เปิด/ปิดฟอร์ม Modal สำหรับเพิ่มหรือแก้ไข (Category Form Modal states)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTarget, setModalTarget] = useState<Category | null>(null); // null = สร้างใหม่, มีค่า = แก้ไข
  const [categoryName, setCategoryName] = useState('');
  const [modalError, setModalError] = useState('');
  const [isModalSubmitting, setIsModalSubmitting] = useState(false);

  // ลบหมวดหมู่ (Delete states)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const catList = await getCategories();
      setCategories(catList);
    } catch (e) {
      toast.error('ไม่สามารถโหลดข้อมูลหมวดหมู่ได้');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // เปิดโมดอลสำหรับสร้างใหม่
  const handleOpenCreate = () => {
    setModalTarget(null);
    setCategoryName('');
    setModalError('');
    setIsModalOpen(true);
  };

  // เปิดโมดอลสำหรับแก้ไข
  const handleOpenEdit = (cat: Category) => {
    setModalTarget(cat);
    setCategoryName(cat.name);
    setModalError('');
    setIsModalOpen(true);
  };

  // จัดการการส่งข้อมูลฟอร์มในโมดอล (Submit Create/Edit)
  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    if (!categoryName.trim()) {
      setModalError('กรุณากรอกชื่อหมวดหมู่');
      return;
    }

    setIsModalSubmitting(true);
    try {
      if (modalTarget) {
        // แก้ไข
        await updateCategory(modalTarget.id, categoryName);
        toast.success(`อัปเดตหมวดหมู่เป็น "${categoryName}" สำเร็จ`);
      } else {
        // สร้างใหม่
        await createCategory(categoryName);
        toast.success(`สร้างหมวดหมู่ใหม่ "${categoryName}" สำเร็จเรียบร้อย`);
      }
      setIsModalOpen(false);
      loadData(); // รีโหลดข้อมูลใหม่
    } catch (err: any) {
      setModalError(err.message || 'เกิดข้อผิดพลาดในการบันทึกหมวดหมู่');
    } finally {
      setIsModalSubmitting(false);
    }
  };

  // ยืนยันการลบหมวดหมู่ (Delete Logic)
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteCategory(deleteTarget.id);
      toast.success(`ลบหมวดหมู่ "${deleteTarget.name}" สำเร็จเรียบร้อย`);
      setDeleteTarget(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'เกิดข้อผิดพลาดในการลบหมวดหมู่');
    } finally {
      setIsDeleting(false);
    }
  };

  // กรองหมวดหมู่ (Filter logic)
  const filteredCategories = categories.filter((cat) => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ฟอร์แมตวันที่
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="bg-custom-navbar-bg border border-custom-border rounded-[24px] p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col gap-6" id="category-list-container">
      {/* ส่วนหัวหน้า */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-custom-border pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-custom-text-primary tracking-tight">หมวดหมู่บทความ (Category Management)</h2>
          <p className="text-sm text-custom-text-secondary">ค้นหา สร้าง แก้ไข และลบหมวดหมู่บทความทั้งหมด</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="font-semibold py-2.5 px-5 rounded-full cursor-pointer transition-all duration-200 ease-out inline-flex items-center gap-2 bg-custom-accent text-white hover:opacity-90 shadow-sm focus:outline-none"
          id="btn-create-category"
        >
          <Plus size={16} />
          Create category
        </button>
      </div>

      {/* แถบค้นหา */}
      <div className="relative flex items-center bg-custom-bg/60 border border-custom-border p-4.5 rounded-2xl" id="category-search-bar">
        <Search size={16} className="absolute left-8 text-custom-text-muted" />
        <input
          type="text"
          placeholder="ค้นหาหมวดหมู่..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-sm pl-11 pr-4 py-2.5 bg-custom-navbar-bg border border-custom-border rounded-xl text-custom-text-primary placeholder-custom-text-muted focus:outline-none focus:ring-3 focus:ring-custom-accent/20 focus:border-transparent transition-all duration-200"
          id="input-search-categories"
        />
      </div>

      {/* ตารางแสดงรายการหมวดหมู่ */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20" id="categories-loading">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-custom-accent"></div>
        </div>
      ) : filteredCategories.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3 border border-dashed border-custom-border rounded-2xl bg-custom-bg/20" id="categories-empty-state">
          <Inbox size={48} className="text-custom-text-muted" />
          <div className="flex flex-col gap-1">
            <h4 className="text-base font-bold text-custom-text-primary">ไม่พบหมวดหมู่ใดๆ</h4>
            <p className="text-xs text-custom-text-muted max-w-sm px-4">
              ไม่มีหมวดหมู่ที่ตรงตามเงื่อนไข ลองพิมพ์คำค้นใหม่ หรือสร้างหมวดหมู่ใหม่
            </p>
          </div>
        </div>
      ) : (
        /* Table Listing */
        <div className="overflow-x-auto border border-custom-border rounded-xl" id="categories-table-wrapper">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-custom-bg border-b border-custom-border text-custom-text-primary font-bold">
                <th className="py-3.5 px-6 font-semibold">ชื่อหมวดหมู่ (Category Name)</th>
                <th className="py-3.5 px-6 font-semibold hidden sm:table-cell">วันที่สร้าง</th>
                <th className="py-3.5 px-6 font-semibold text-right">เครื่องมือ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-custom-border">
              {filteredCategories.map((cat) => (
                <tr key={cat.id} className="hover:bg-custom-bg/30 text-custom-text-secondary transition-colors" id={`cat-row-${cat.id}`}>
                  <td className="py-3.5 px-6 font-bold text-custom-text-primary">{cat.name}</td>
                  <td className="py-3.5 px-6 hidden sm:table-cell text-xs">{formatDate(cat.createdAt)}</td>
                  <td className="py-3.5 px-6 text-right">
                    <div className="flex justify-end gap-2.5">
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="p-2 border border-custom-btn-border hover:bg-[rgba(28,26,23,0.03)] dark:hover:bg-[rgba(244,242,238,0.05)] text-custom-text-primary rounded-lg transition-colors cursor-pointer"
                        id={`btn-edit-cat-${cat.id}`}
                        title="แก้ไขชื่อหมวดหมู่"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(cat)}
                        className="p-2 border border-rose-500/20 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 rounded-lg transition-colors cursor-pointer"
                        id={`btn-delete-cat-${cat.id}`}
                        title="ลบหมวดหมู่"
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

      {/* โมดอลการบันทึกข้อมูล (Create/Edit Modal) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" id="category-form-modal">
          <div className="bg-custom-navbar-bg border border-custom-border rounded-[24px] p-6 max-w-md w-full mx-4 shadow-[0_8px_32px_rgba(0,0,0,0.15)] flex flex-col gap-5">
            <div>
              <h3 className="text-lg font-extrabold text-custom-text-primary">
                {modalTarget ? 'แก้ไขหมวดหมู่ (Edit Category)' : 'สร้างหมวดหมู่ใหม่ (Create Category)'}
              </h3>
              <p className="text-xs text-custom-text-secondary mt-0.5">
                กรอกข้อมูลชื่อหมวดหมู่ที่เหมาะสมสำหรับการกรองบทความ
              </p>
            </div>

            {modalError && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl p-3 flex gap-2 items-start">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleModalSubmit} className="flex flex-col gap-4" noValidate>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="cat-modal-name" className="text-xs font-semibold text-custom-text-primary uppercase tracking-wider">
                  ชื่อหมวดหมู่ *
                </label>
                <input
                  id="cat-modal-name"
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="เช่น IT, Design, Health"
                  disabled={isModalSubmitting}
                  className="w-full text-sm px-4 py-2.5 bg-custom-bg border border-custom-border rounded-xl text-custom-text-primary placeholder-custom-text-muted focus:outline-none focus:ring-3 focus:ring-custom-accent/20 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div className="flex justify-end gap-2.5 mt-2 border-t border-custom-border pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isModalSubmitting}
                  className="font-semibold py-2 px-4 rounded-full cursor-pointer text-xs transition-all duration-200 border border-custom-btn-border text-custom-text-primary hover:bg-[rgba(28,26,23,0.03)] dark:hover:bg-[rgba(244,242,238,0.05)] disabled:opacity-50"
                >
                  ยกเลิก (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={isModalSubmitting}
                  className="font-semibold py-2 px-5 rounded-full cursor-pointer text-xs transition-all duration-200 bg-custom-btn-signup-bg border border-custom-btn-signup-bg text-custom-btn-signup-text hover:opacity-95 disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {isModalSubmitting ? <Loader2 size={12} className="animate-spin" /> : null}
                  บันทึกหมวดหมู่
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* กล่องข้อความยืนยันการลบหมวดหมู่ (Delete Confirmation Dialog) */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-rose-500 flex items-center gap-2">
              <AlertTriangle size={18} />
              ยืนยันการลบหมวดหมู่
            </AlertDialogTitle>
            <AlertDialogDescription>
              คุณแน่ใจว่าต้องการลบหมวดหมู่ <strong>"{deleteTarget?.name}"</strong> ใช่หรือไม่? บทความภายใต้หมวดหมู่นี้ทั้งหมดจะไม่ถูกลบ แต่จะยังคงอยู่
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
