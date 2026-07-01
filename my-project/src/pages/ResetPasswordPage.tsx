import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
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

export default function ResetPasswordPage() {
  const { updatePassword } = useAuth();

  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility states
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Form validation errors
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
    api?: string;
  }>({});

  // Loading and Confirmation dialog states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Field validation handler on blur
  const handleBlur = (field: 'currentPassword' | 'newPassword' | 'confirmPassword') => {
    const newErrors = { ...errors };

    if (field === 'currentPassword') {
      if (!currentPassword) {
        newErrors.currentPassword = 'กรุณากรอกรหัสผ่านปัจจุบัน';
      } else {
        delete newErrors.currentPassword;
      }
    }

    if (field === 'newPassword') {
      if (!newPassword) {
        newErrors.newPassword = 'กรุณากรอกรหัสผ่านใหม่';
      } else if (newPassword.length < 8) {
        newErrors.newPassword = 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร';
      } else {
        delete newErrors.newPassword;
      }
    }

    if (field === 'confirmPassword') {
      if (!confirmPassword) {
        newErrors.confirmPassword = 'กรุณายืนยันรหัสผ่านใหม่';
      } else if (confirmPassword !== newPassword) {
        newErrors.confirmPassword = 'รหัสผ่านใหม่และการยืนยันรหัสผ่านใหม่ไม่ตรงกัน';
      } else {
        delete newErrors.confirmPassword;
      }
    }

    setErrors(newErrors);
  };

  // Submit button triggers validations first
  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors((prev) => ({ ...prev, api: undefined }));

    const tempErrors: typeof errors = {};

    if (!currentPassword) {
      tempErrors.currentPassword = 'กรุณากรอกรหัสผ่านปัจจุบัน';
    }
    if (!newPassword) {
      tempErrors.newPassword = 'กรุณากรอกรหัสผ่านใหม่';
    } else if (newPassword.length < 8) {
      tempErrors.newPassword = 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร';
    }
    if (!confirmPassword) {
      tempErrors.confirmPassword = 'กรุณายืนยันรหัสผ่านใหม่';
    } else if (confirmPassword !== newPassword) {
      tempErrors.confirmPassword = 'รหัสผ่านใหม่และการยืนยันรหัสผ่านใหม่ไม่ตรงกัน';
    }

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      toast.error('กรุณากรอกข้อมูลการเปลี่ยนรหัสผ่านให้ถูกต้อง');
      return;
    }

    // เปิด Dialog ยืนยันการทำรายการ
    setIsConfirmOpen(true);
  };

  // Executed when user approves from the AlertDialog
  const handleConfirmReset = async () => {
    setIsConfirmOpen(false);
    setIsSubmitting(true);

    try {
      await updatePassword(currentPassword, newPassword);
      toast.success('เปลี่ยนรหัสผ่านเสร็จสิ้นเรียบร้อยแล้ว');
      
      // ล้างข้อมูลฟอร์ม
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
    } catch (err: any) {
      const errorMsg = err.message || 'รหัสผ่านปัจจุบันไม่ถูกต้อง';
      setErrors((prev) => ({ ...prev, api: errorMsg }));
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-custom-navbar-bg border border-custom-border rounded-[24px] p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col gap-6" id="reset-password-container">
      {/* ส่วนหัวข้อ */}
      <div className="border-b border-custom-border pb-4">
        <h2 className="text-2xl font-extrabold text-custom-text-primary tracking-tight">เปลี่ยนรหัสผ่าน</h2>
        <p className="text-sm text-custom-text-secondary">จัดการรหัสผ่านเข้าสู่ระบบเพื่อความปลอดภัยของบัญชี</p>
      </div>

      {/* Global API error message */}
      {errors.api && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl p-3 flex gap-2.5 items-start">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{errors.api}</span>
        </div>
      )}

      <form onSubmit={handleOpenConfirm} className="flex flex-col gap-4.5" noValidate>
        {/* รหัสผ่านปัจจุบัน */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="current-pass" className="text-xs font-semibold text-custom-text-primary uppercase tracking-wider">
            รหัสผ่านปัจจุบัน
          </label>
          <div className="relative flex items-center">
            <Lock size={16} className="absolute left-4 text-custom-text-muted" />
            <input
              id="current-pass"
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              onBlur={() => handleBlur('currentPassword')}
              placeholder="••••••••"
              disabled={isSubmitting}
              className={`w-full text-sm pl-11 pr-12 py-3 bg-custom-bg border ${
                errors.currentPassword ? 'border-destructive focus:ring-destructive/30' : 'border-custom-border focus:ring-custom-accent/30'
              } rounded-xl text-custom-text-primary placeholder-custom-text-muted focus:outline-none focus:ring-3 focus:border-transparent transition-all duration-200`}
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              tabIndex={-1}
              className="absolute right-4 text-custom-text-muted hover:text-custom-text-primary cursor-pointer p-1 rounded-md"
            >
              {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.currentPassword && (
            <span className="text-xs text-destructive flex items-center gap-1 mt-0.5 pl-1">
              <AlertCircle size={12} />
              {errors.currentPassword}
            </span>
          )}
        </div>

        {/* รหัสผ่านใหม่ */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="new-pass" className="text-xs font-semibold text-custom-text-primary uppercase tracking-wider">
            รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)
          </label>
          <div className="relative flex items-center">
            <Lock size={16} className="absolute left-4 text-custom-text-muted" />
            <input
              id="new-pass"
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              onBlur={() => handleBlur('newPassword')}
              placeholder="••••••••"
              disabled={isSubmitting}
              className={`w-full text-sm pl-11 pr-12 py-3 bg-custom-bg border ${
                errors.newPassword ? 'border-destructive focus:ring-destructive/30' : 'border-custom-border focus:ring-custom-accent/30'
              } rounded-xl text-custom-text-primary placeholder-custom-text-muted focus:outline-none focus:ring-3 focus:border-transparent transition-all duration-200`}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              tabIndex={-1}
              className="absolute right-4 text-custom-text-muted hover:text-custom-text-primary cursor-pointer p-1 rounded-md"
            >
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.newPassword && (
            <span className="text-xs text-destructive flex items-center gap-1 mt-0.5 pl-1">
              <AlertCircle size={12} />
              {errors.newPassword}
            </span>
          )}
        </div>

        {/* ยืนยันรหัสผ่านใหม่ */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirm-new-pass" className="text-xs font-semibold text-custom-text-primary uppercase tracking-wider">
            ยืนยันรหัสผ่านใหม่
          </label>
          <div className="relative flex items-center">
            <Lock size={16} className="absolute left-4 text-custom-text-muted" />
            <input
              id="confirm-new-pass"
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              placeholder="••••••••"
              disabled={isSubmitting}
              className={`w-full text-sm pl-11 pr-12 py-3 bg-custom-bg border ${
                errors.confirmPassword ? 'border-destructive focus:ring-destructive/30' : 'border-custom-border focus:ring-custom-accent/30'
              } rounded-xl text-custom-text-primary placeholder-custom-text-muted focus:outline-none focus:ring-3 focus:border-transparent transition-all duration-200`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              tabIndex={-1}
              className="absolute right-4 text-custom-text-muted hover:text-custom-text-primary cursor-pointer p-1 rounded-md"
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <span className="text-xs text-destructive flex items-center gap-1 mt-0.5 pl-1">
              <AlertCircle size={12} />
              {errors.confirmPassword}
            </span>
          )}
        </div>

        {/* ปุ่มเปลี่ยนรหัสผ่าน */}
        <div className="flex justify-end border-t border-custom-border pt-5">
          <button
            type="submit"
            disabled={isSubmitting}
            className="font-semibold py-2.5 px-6 rounded-full cursor-pointer transition-all duration-250 ease-out inline-flex items-center justify-center gap-2 bg-custom-btn-signup-bg border border-custom-btn-signup-bg text-custom-btn-signup-text disabled:opacity-75 disabled:cursor-not-allowed hover:opacity-95 shadow-[0_2px_8px_rgba(28,26,23,0.08)] hover:shadow-[0_4px_16px_rgba(28,26,23,0.15)] focus:outline-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                กำลังดำเนินการ...
              </>
            ) : (
              'เปลี่ยนรหัสผ่าน (Reset Password)'
            )}
          </button>
        </div>
      </form>

      {/* Confirmation Alert Dialog */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการเปลี่ยนรหัสผ่าน</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการเปลี่ยนรหัสผ่านใช่หรือไม่? ข้อมูลนี้จะได้รับการบันทึกในฐานข้อมูลจำลองทันทีเมื่อกดยืนยัน
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก (Cancel)</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmReset} className="bg-custom-btn-signup-bg text-custom-btn-signup-text font-semibold hover:opacity-90">
              ยืนยันการเปลี่ยน (Confirm)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
