import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Camera, Mail, User, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl || null);
  const [avatarFile, setAvatarFile] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameError, setNameError] = useState('');

  // เปิดตัวเลือกอัปโหลดรูปภาพ
  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // เมื่อเลือกไฟล์รูปภาพ
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Edge case check: ตรวจสอบความถูกต้องของไฟล์รูปภาพ
    if (!file.type.startsWith('image/')) {
      toast.error('กรุณาอัปโหลดเฉพาะไฟล์รูปภาพเท่านั้น (.jpg, .png, .gif, .webp)');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // แปลงไฟล์เป็น base64 URL สำหรับพรีวิวและเก็บข้อมูลใน localStorage
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const base64String = event.target.result as string;
        setAvatarPreview(base64String);
        setAvatarFile(base64String);
      }
    };
    reader.readAsDataURL(file);
  };

  // จัดการการส่งฟอร์มแก้ไขข้อมูล
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError('');

    if (!name.trim()) {
      setNameError('กรุณากรอกชื่อ-นามสกุล');
      return;
    }

    setIsSubmitting(true);
    try {
      const finalAvatarUrl = avatarFile || avatarPreview || '';
      await updateProfile(name, finalAvatarUrl);
      toast.success('บันทึกข้อมูลส่วนตัวสำเร็จเรียบร้อย');
    } catch (err: any) {
      toast.error(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-custom-navbar-bg border border-custom-border rounded-[24px] p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col gap-6" id="profile-container">
      {/* ส่วนหัวข้อ */}
      <div className="border-b border-custom-border pb-4">
        <h2 className="text-2xl font-extrabold text-custom-text-primary tracking-tight">แก้ไขโปรไฟล์</h2>
        <p className="text-sm text-custom-text-secondary">อัปเดตข้อมูลส่วนตัวและรูปภาพโปรไฟล์ของคุณ</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
        {/* ส่วนรูปประจำตัว (Avatar Section) */}
        <div className="flex flex-col sm:flex-row gap-5 items-center">
          <div className="relative group cursor-pointer" onClick={handleAvatarClick} id="avatar-uploader">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover border-2 border-custom-border group-hover:opacity-75 transition-all duration-200"
              />
            ) : (
              <div className="w-24 h-24 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-full border-2 border-dashed border-emerald-500/30 flex items-center justify-center text-4xl font-extrabold group-hover:opacity-75 transition-all duration-200">
                {user.name.trim().charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute bottom-0 right-0 bg-custom-btn-signup-bg text-custom-btn-signup-text p-2 rounded-full border border-custom-border shadow-md">
              <Camera size={14} />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="flex flex-col gap-1 text-center sm:text-left">
            <h4 className="text-sm font-semibold text-custom-text-primary">รูปภาพโปรไฟล์ของคุณ</h4>
            <p className="text-xs text-custom-text-muted">
              รองรับไฟล์รูปภาพ JPG, PNG, GIF, WEBP (จำลองการบันทึกภาพด้วย Base64)
            </p>
            <button
              type="button"
              onClick={handleAvatarClick}
              className="mt-2 text-xs font-semibold text-custom-accent hover:underline flex items-center gap-1 justify-center sm:justify-start"
            >
              เลือกรูปภาพใหม่
            </button>
          </div>
        </div>

        {/* ฟิลด์ข้อมูล */}
        <div className="flex flex-col gap-4">
          {/* ชื่อ */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="profile-name" className="text-xs font-semibold text-custom-text-primary uppercase tracking-wider">
              ชื่อ-นามสกุล
            </label>
            <div className="relative flex items-center">
              <User size={16} className="absolute left-4 text-custom-text-muted" />
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="สมชาย ใจดี"
                disabled={isSubmitting}
                className={`w-full text-sm pl-11 pr-4 py-3 bg-custom-bg border ${
                  nameError ? 'border-destructive focus:ring-destructive/30' : 'border-custom-border focus:ring-custom-accent/30'
                } rounded-xl text-custom-text-primary placeholder-custom-text-muted focus:outline-none focus:ring-3 focus:border-transparent transition-all duration-200`}
              />
            </div>
            {nameError && (
              <span className="text-xs text-destructive flex items-center gap-1 mt-0.5 pl-1">
                <AlertCircle size={12} />
                {nameError}
              </span>
            )}
          </div>

          {/* อีเมล (แก้ไขไม่ได้) */}
          <div className="flex flex-col gap-1.5 opacity-70">
            <label htmlFor="profile-email" className="text-xs font-semibold text-custom-text-primary uppercase tracking-wider">
              อีเมล (ไม่สามารถแก้ไขได้)
            </label>
            <div className="relative flex items-center">
              <Mail size={16} className="absolute left-4 text-custom-text-muted" />
              <input
                id="profile-email"
                type="email"
                value={user.email}
                readOnly
                className="w-full text-sm pl-11 pr-4 py-3 bg-custom-bg/50 border border-custom-border rounded-xl text-custom-text-muted cursor-not-allowed focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* ปุ่มบันทึก */}
        <div className="flex justify-end border-t border-custom-border pt-5">
          <button
            type="submit"
            disabled={isSubmitting}
            className="font-semibold py-2.5 px-6 rounded-full cursor-pointer transition-all duration-250 ease-out inline-flex items-center justify-center gap-2 bg-custom-btn-signup-bg border border-custom-btn-signup-bg text-custom-btn-signup-text disabled:opacity-75 disabled:cursor-not-allowed hover:opacity-95 shadow-[0_2px_8px_rgba(28,26,23,0.08)] hover:shadow-[0_4px_16px_rgba(28,26,23,0.15)] focus:outline-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              'บันทึกข้อมูล (Save)'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
