import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getCategories, getArticleById, createArticle, updateArticle } from '../lib/adminService';
import type { Category } from '../lib/adminService';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Upload, Loader2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function ArticleFormPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!id;

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ข้อมูลฟอร์ม (Form state)
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<string | null>(null);

  const [titleError, setTitleError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // โหลดหมวดหมู่และบทความเดิม (ถ้าเป็นโหมดแก้ไข)
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      try {
        const catList = await getCategories();
        setCategories(catList);

        if (catList.length > 0) {
          setCategory(catList[0].name); // ค่าเริ่มต้นคือหมวดหมู่แรก
        }

        if (isEditMode && id) {
          const article = await getArticleById(id);
          setTitle(article.title);
          setContent(article.content);
          setCategory(article.category);
          setThumbnailPreview(article.thumbnailUrl || null);
        }
      } catch (e: any) {
        toast.error(e.message || 'ไม่สามารถโหลดข้อมูลเริ่มต้นได้');
        navigate('/admin/articles');
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, [id, isEditMode, navigate]);

  // เมื่อผู้ใช้เลือกรูปภาพ Thumbnail
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Edge case check: ตรวจสอบความถูกต้องของไฟล์รูปภาพ
    if (!file.type.startsWith('image/')) {
      toast.error('กรุณาอัปโหลดเฉพาะไฟล์รูปภาพเท่านั้น (.jpg, .png, .gif, .webp)');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const base64String = event.target.result as string;
        setThumbnailPreview(base64String);
        setThumbnailFile(base64String);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // ดำเนินการบันทึกบทความ (Save logic)
  const handleSave = async (status: 'draft' | 'published') => {
    setTitleError('');

    if (!title.trim()) {
      setTitleError('กรุณากรอกชื่อเรื่องบทความ');
      toast.error('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      return;
    }

    setIsSubmitting(true);

    try {
      const finalThumbnail = thumbnailFile || thumbnailPreview || '';
      const authorName = user?.name || 'Admin User';

      if (isEditMode && id) {
        await updateArticle(id, title, content, category, finalThumbnail, status);
        toast.success(`อัปเดตบทความและบันทึกเป็น ${status === 'published' ? 'Published' : 'Draft'} สำเร็จ`);
      } else {
        await createArticle(title, content, category, finalThumbnail, status, authorName);
        toast.success(`สร้างบทความและบันทึกเป็น ${status === 'published' ? 'Published' : 'Draft'} สำเร็จ`);
      }

      navigate('/admin/articles');
    } catch (err: any) {
      toast.error(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24" id="form-loading">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-custom-accent"></div>
      </div>
    );
  }

  return (
    <div className="bg-custom-navbar-bg border border-custom-border rounded-[24px] p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col gap-6" id="article-form-container">
      {/* ส่วนหัวย้อนกลับ */}
      <div className="flex items-center gap-3 border-b border-custom-border pb-4">
        <Link
          to="/admin/articles"
          className="p-2 border border-custom-border rounded-xl text-custom-text-primary hover:bg-[rgba(28,26,23,0.03)] dark:hover:bg-[rgba(244,242,238,0.05)] transition-colors cursor-pointer"
          id="btn-back-to-articles"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h2 className="text-2xl font-extrabold text-custom-text-primary tracking-tight">
            {isEditMode ? 'แก้ไขบทความ (Edit Article)' : 'สร้างบทความใหม่ (Create Article)'}
          </h2>
          <p className="text-sm text-custom-text-secondary">
            {isEditMode ? 'แก้ไขข้อความและจัดพิมพ์บทความเดิมในระบบ' : 'เขียนบทความใหม่ บันทึกเป็นฉบับร่าง หรือเผยแพร่ทันที'}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {/* ชื่อเรื่อง */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="art-title" className="text-xs font-semibold text-custom-text-primary uppercase tracking-wider">
            ชื่อเรื่องบทความ *
          </label>
          <input
            id="art-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ตั้งชื่อเรื่องให้น่าดึงดูดใจ..."
            disabled={isSubmitting}
            className={`w-full text-sm px-4 py-3 bg-custom-bg border ${
              titleError ? 'border-destructive focus:ring-destructive/30' : 'border-custom-border focus:ring-custom-accent/30'
            } rounded-xl text-custom-text-primary placeholder-custom-text-muted focus:outline-none focus:ring-3 focus:border-transparent transition-all duration-200`}
          />
          {titleError && (
            <span className="text-xs text-destructive flex items-center gap-1 mt-0.5 pl-1">
              <AlertCircle size={12} />
              {titleError}
            </span>
          )}
        </div>

        {/* กึ่งกลาง: หมวดหมู่และอัปโหลดรูปภาพ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* หมวดหมู่ */}
          <div className="flex flex-col gap-1.5 md:col-span-1">
            <label htmlFor="art-category" className="text-xs font-semibold text-custom-text-primary uppercase tracking-wider">
              หมวดหมู่บทความ
            </label>
            <select
              id="art-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isSubmitting}
              className="w-full text-sm px-4 py-3 bg-custom-bg border border-custom-border rounded-xl text-custom-text-primary focus:outline-none focus:ring-3 focus:ring-custom-accent/20 transition-all duration-200"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name} className="bg-[#120c24] text-white">{cat.name}</option>
              ))}
            </select>
          </div>

          {/* อัปโหลดรูปภาพปก (Thumbnail) */}
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-custom-text-primary uppercase tracking-wider">
              รูปภาพหน้าปกบทความ (Thumbnail)
            </label>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {/* ตัวอย่างภาพ */}
              <div 
                onClick={handleUploadClick}
                className="w-full sm:w-36 h-24 bg-custom-bg border-2 border-dashed border-custom-border rounded-xl flex items-center justify-center overflow-hidden cursor-pointer hover:border-custom-accent/50 transition-colors"
                id="thumbnail-preview-box"
              >
                {thumbnailPreview ? (
                  <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center flex flex-col items-center gap-1 text-custom-text-muted">
                    <ImageIcon size={20} />
                    <span className="text-[10px]">คลิกเพื่ออัปโหลด</span>
                  </div>
                )}
              </div>

              {/* ปุ่มควบคุมไฟล์ */}
              <div className="flex flex-col gap-1 items-center sm:items-start text-center sm:text-left flex-grow">
                <button
                  type="button"
                  onClick={handleUploadClick}
                  disabled={isSubmitting}
                  className="font-semibold py-2 px-4 rounded-xl cursor-pointer text-xs transition-all duration-200 border border-custom-btn-border text-custom-text-primary hover:bg-[rgba(28,26,23,0.03)] dark:hover:bg-[rgba(244,242,238,0.05)] inline-flex items-center gap-1.5 outline-none"
                  id="btn-upload-thumbnail"
                >
                  <Upload size={12} />
                  อัปโหลดไฟล์รูปภาพ
                </button>
                <span className="text-[10px] text-custom-text-muted">
                  ขนาดแนะนำ 1200x630 (จำลองบันทึกเป็น Base64 ใน localStorage)
                </span>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* เนื้อหาบทความ */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="art-content" className="text-xs font-semibold text-custom-text-primary uppercase tracking-wider">
            เนื้อหาบทความ (Markdown/Plain Text)
          </label>
          <textarea
            id="art-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="พิมพ์เนื้อหาที่อัดแน่นไปด้วยเนื้อหาของคุณตรงนี้..."
            disabled={isSubmitting}
            rows={10}
            className="w-full text-sm px-4 py-3 bg-custom-bg border border-custom-border rounded-xl text-custom-text-primary placeholder-custom-text-muted focus:outline-none focus:ring-3 focus:ring-custom-accent/20 focus:border-transparent transition-all duration-200 font-sans"
          />
        </div>

        {/* ปุ่มบันทึกการส่งฟอร์ม */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 border-t border-custom-border pt-5">
          {/* บันทึกเป็นร่าง */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave('draft')}
            className="font-semibold py-2.5 px-5 rounded-full cursor-pointer transition-all duration-200 border border-custom-btn-border text-custom-text-primary hover:bg-[rgba(28,26,23,0.03)] dark:hover:bg-[rgba(244,242,238,0.05)] disabled:opacity-50 inline-flex items-center justify-center gap-2 outline-none"
            id="btn-save-draft"
          >
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : null}
            Save as draft
          </button>

          {/* บันทึกและจัดพิมพ์ */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave('published')}
            className="font-semibold py-2.5 px-6 rounded-full cursor-pointer transition-all duration-200 inline-flex items-center justify-center gap-2 bg-custom-btn-signup-bg border border-custom-btn-signup-bg text-custom-btn-signup-text hover:opacity-95 disabled:opacity-50 shadow-sm focus:outline-none"
            id="btn-save-publish"
          >
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : null}
            Save and publish
          </button>
        </div>
      </div>
    </div>
  );
}
