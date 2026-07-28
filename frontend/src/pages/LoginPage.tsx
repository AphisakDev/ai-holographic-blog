import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import muImg from '../assets/mu.jpg';
import arImg from '../assets/ar.jpg';

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, signUp, loginWithProvider } = useAuth();

  // Determine initial state based on route
  const isSignUpRoute = location.pathname === '/signup';
  const [isRegisterMode, setIsRegisterMode] = useState(isSignUpRoute);

  // Form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation & loading states
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string; api?: string }>({});
  const [signUpErrors, setSignUpErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string; api?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Keep state in sync with URL path changes (e.g. forward/back buttons)
  useEffect(() => {
    setIsRegisterMode(location.pathname === '/signup');
  }, [location.pathname]);

  const validateEmail = (emailStr: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailStr);
  };

  // Switch modes and update URL silently
  const toggleMode = (toRegister: boolean) => {
    setIsRegisterMode(toRegister);
    setLoginErrors({});
    setSignUpErrors({});
    navigate(toRegister ? '/signup' : '/login', { replace: true });
  };

  // Blur validation
  const handleLoginBlur = (field: 'email' | 'password') => {
    const newErrors = { ...loginErrors };
    if (field === 'email') {
      if (!email.trim()) {
        newErrors.email = 'Please enter your email';
      } else if (!validateEmail(email)) {
        newErrors.email = 'Invalid email format';
      } else {
        delete newErrors.email;
      }
    }
    if (field === 'password') {
      if (!password) {
        newErrors.password = 'Please enter your password';
      } else {
        delete newErrors.password;
      }
    }
    setLoginErrors(newErrors);
  };

  const handleSignUpBlur = (field: 'name' | 'email' | 'password' | 'confirmPassword') => {
    const newErrors = { ...signUpErrors };
    if (field === 'name') {
      if (!name.trim()) {
        newErrors.name = 'Please enter your full name';
      } else {
        delete newErrors.name;
      }
    }
    if (field === 'email') {
      if (!email.trim()) {
        newErrors.email = 'Please enter your email';
      } else if (!validateEmail(email)) {
        newErrors.email = 'Invalid email format';
      } else {
        delete newErrors.email;
      }
    }
    if (field === 'password') {
      if (!password) {
        newErrors.password = 'Please enter your password';
      } else if (password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else {
        delete newErrors.password;
      }
    }
    if (field === 'confirmPassword') {
      if (!confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (confirmPassword !== password) {
        newErrors.confirmPassword = 'Passwords do not match';
      } else {
        delete newErrors.confirmPassword;
      }
    }
    setSignUpErrors(newErrors);
  };

  // Form Submit Handlers
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErrors((prev) => ({ ...prev, api: undefined }));
    const tempErrors: typeof loginErrors = {};

    if (!email.trim()) {
      tempErrors.email = 'Please enter your email';
    } else if (!validateEmail(email)) {
      tempErrors.email = 'Invalid email format';
    }
    if (!password) {
      tempErrors.password = 'Please enter your password';
    }

    if (Object.keys(tempErrors).length > 0) {
      setLoginErrors(tempErrors);
      toast.error('Please fill in all fields correctly.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      toast.success('Logged in successfully. Welcome back!');
      navigate('/');
    } catch (err: any) {
      const errorMsg = err.message || 'Incorrect email or password.';
      setLoginErrors((prev) => ({ ...prev, api: errorMsg }));
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpErrors((prev) => ({ ...prev, api: undefined }));
    const tempErrors: typeof signUpErrors = {};

    if (!name.trim()) {
      tempErrors.name = 'Please enter your full name';
    }
    if (!email.trim()) {
      tempErrors.email = 'Please enter your email';
    } else if (!validateEmail(email)) {
      tempErrors.email = 'Invalid email format';
    }
    if (!password) {
      tempErrors.password = 'Please enter your password';
    } else if (password.length < 8) {
      tempErrors.password = 'Password must be at least 8 characters';
    }
    if (!confirmPassword) {
      tempErrors.confirmPassword = 'Please confirm your password';
    } else if (confirmPassword !== password) {
      tempErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(tempErrors).length > 0) {
      setSignUpErrors(tempErrors);
      toast.error('Please fill in all fields correctly.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signUp(name, email, password);
      setIsSuccess(true);
      toast.success('Account registered successfully.');
    } catch (err: any) {
      const errorMsg = err.message || 'An error occurred during registration.';
      setSignUpErrors((prev) => ({ ...prev, api: errorMsg }));
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setIsSubmitting(true);
    setLoginErrors((prev) => ({ ...prev, api: undefined }));
    setSignUpErrors((prev) => ({ ...prev, api: undefined }));
    try {
      await loginWithProvider(provider);
      const providerName = provider === 'google' ? 'Google' : 'Facebook';
      toast.success(`Logged in successfully via ${providerName}!`);
      navigate('/');
    } catch (err: any) {
      const errorMsg = err.message || 'An error occurred during authentication.';
      if (isRegisterMode) {
        setSignUpErrors((prev) => ({ ...prev, api: errorMsg }));
      } else {
        setLoginErrors((prev) => ({ ...prev, api: errorMsg }));
      }
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state render
  if (isSuccess) {
    return (
      <div className="min-h-[calc(100vh-140px)] flex justify-center items-center pt-0 pb-12 px-4 bg-[#01040a] font-poppins relative overflow-hidden w-full mt-[-48px] rounded-[40px]" id="signup-success-container">
        <div className="absolute top-[10%] left-[5%] w-[350px] h-[350px] rounded-full bg-[#4fd8e0]/10 filter blur-[90px] pointer-events-none"></div>
        <div className="absolute bottom-[10%] right-[5%] w-[450px] h-[450px] rounded-full bg-[#0052d4]/15 filter blur-[110px] pointer-events-none"></div>

        <div className="relative z-10 bg-[#030917]/95 border border-white/10 rounded-[40px] p-8 max-w-md w-full text-center shadow-2xl flex flex-col items-center gap-6 animate-cyan-blue-pulse">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center animate-bounce-short border border-emerald-500/30">
            <CheckCircle2 size={40} className="text-[#10b981] drop-shadow-[0_0_8px_#10b981]" />
          </div>
          
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-extrabold text-white">Sign up successful!</h2>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Your account has been created successfully. Please click the button below to log in.
            </p>
          </div>

          <button
            onClick={() => {
              setIsSuccess(false);
              toggleMode(false);
            }}
            className="w-full mt-2 font-bold py-3 px-6 rounded-full cursor-pointer transition-all duration-250 ease-out inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#00f2fe] to-[#0052d4] hover:from-[#4fd8e0] hover:to-[#0062ff] text-white hover:scale-[1.01] active:scale-[0.99] shadow-[0_4px_20px_rgba(79,216,224,0.3)] focus:outline-none text-xs tracking-wider uppercase"
            id="btn-continue-to-login"
          >
            Continue to Log in
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-140px)] flex justify-center items-center pt-0 pb-12 px-4 bg-[#01040a] font-poppins relative overflow-hidden w-full mt-[-48px] rounded-[40px]" id="auth-container">
      {/* Background Neon Glow Orbs */}
      <div className="absolute top-[10%] left-[5%] w-[350px] h-[350px] rounded-full bg-[#4fd8e0]/10 filter blur-[90px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[5%] w-[450px] h-[450px] rounded-full bg-[#0052d4]/15 filter blur-[110px] pointer-events-none"></div>

      {/* Main card grid with fixed dimensions */}
      <div className="relative z-10 w-full max-w-[1100px] min-h-[680px] bg-[#030917]/90 border border-white/10 rounded-[40px] overflow-hidden shadow-2xl flex animate-cyan-blue-pulse">
        
        {/* ==================== LOGIN FORM SIDE (Always left half on desktop) ==================== */}
        <div 
          style={{ 
            transition: isRegisterMode 
              ? 'transform 0.8s ease-in, opacity 0.8s ease-in' 
              : 'transform 1.2s cubic-bezier(0.25, 1, 0.5, 1) 0.2s, opacity 1.2s cubic-bezier(0.25, 1, 0.5, 1) 0.2s' 
          }}
          className={`w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center gap-5 transition-all absolute md:relative left-0 top-0 bottom-0 h-full ${
            isRegisterMode 
              ? 'max-[768px]:hidden opacity-0 pointer-events-none md:translate-x-[-15%]' 
              : 'w-full opacity-100 pointer-events-auto md:translate-x-0 z-20'
          }`}
          id="login-form-side"
        >
          {/* Logo / Header */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#4fd8e0]">
              <Sparkles size={24} className="drop-shadow-[0_0_8px_#4fd8e0]" />
              <span className="font-extrabold text-lg tracking-wider text-white">ai-anime <span className="text-[#4fd8e0]">Hub</span></span>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mt-2">Log In</h2>
            <p className="text-xs text-neutral-400">Welcome back! Please enter your details to log in.</p>
          </div>

          {loginErrors.api && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl p-3 flex gap-2.5 items-start">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{loginErrors.api}</span>
            </div>
          )}

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-3.5">
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-full border border-white/10 bg-white hover:bg-neutral-100 text-neutral-900 transition-all duration-200 text-xs font-semibold cursor-pointer outline-none"
            >
              <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-3.3-4.53-6.16-4.53z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('facebook')}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-full border border-white/10 bg-white hover:bg-neutral-100 text-neutral-900 transition-all duration-200 text-xs font-semibold cursor-pointer outline-none"
            >
              <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
              </svg>
              Facebook
            </button>
          </div>

          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink mx-3 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
              Or continue with email
            </span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email-login" className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">
                Email
              </label>
              <div className="relative flex items-center">
                <Mail size={15} className="absolute left-4 text-neutral-400" />
                <input
                  id="email-login"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleLoginBlur('email')}
                  placeholder="name@domain.com"
                  disabled={isSubmitting}
                  className={`w-full text-xs pl-11 pr-4 py-3 bg-white/[0.03] border ${
                    loginErrors.email ? 'border-rose-500 focus:ring-rose-500/20' : 'border-white/15 focus:border-[#4fd8e0] focus:ring-[#4fd8e0]/20'
                  } rounded-full text-white placeholder-neutral-500 focus:outline-none focus:ring-3 transition-all duration-200`}
                />
              </div>
              {loginErrors.email && (
                <span className="text-[10px] text-rose-400 flex items-center gap-1 mt-0.5 pl-1">
                  <AlertCircle size={10} />
                  {loginErrors.email}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password-login" className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock size={15} className="absolute left-4 text-neutral-400" />
                <input
                  id="password-login"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => handleLoginBlur('password')}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  className={`w-full text-xs pl-11 pr-12 py-3 bg-white/[0.03] border ${
                    loginErrors.password ? 'border-rose-500 focus:ring-rose-500/20' : 'border-white/15 focus:border-[#4fd8e0] focus:ring-[#4fd8e0]/20'
                  } rounded-full text-white placeholder-neutral-500 focus:outline-none focus:ring-3 transition-all duration-200`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-4 text-neutral-400 hover:text-white cursor-pointer p-1 rounded-md"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {loginErrors.password && (
                <span className="text-[10px] text-rose-400 flex items-center gap-1 mt-0.5 pl-1">
                  <AlertCircle size={10} />
                  {loginErrors.password}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 font-bold py-3 px-6 rounded-full cursor-pointer transition-all duration-250 ease-out inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#00f2fe] to-[#0052d4] hover:from-[#4fd8e0] hover:to-[#0062ff] text-white disabled:opacity-70 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] shadow-[0_4px_20px_rgba(79,216,224,0.3)] focus:outline-none text-xs tracking-wider uppercase"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Logging in...
                </>
              ) : (
                'Log in'
              )}
            </button>
          </form>

          <div className="text-center mt-2 text-xs text-neutral-400">
            Don't have an account?{' '}
            <button 
              type="button"
              onClick={() => toggleMode(true)}
              className="text-[#4fd8e0] font-bold hover:underline transition-all duration-200 bg-transparent border-none outline-none cursor-pointer"
            >
              Sign up here
            </button>
          </div>
        </div>

        {/* ==================== REGISTER FORM SIDE (Always right half on desktop) ==================== */}
        <div 
          style={{ 
            transition: !isRegisterMode 
              ? 'transform 0.8s ease-in, opacity 0.8s ease-in' 
              : 'transform 1.2s cubic-bezier(0.25, 1, 0.5, 1) 0.2s, opacity 1.2s cubic-bezier(0.25, 1, 0.5, 1) 0.2s' 
          }}
          className={`w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center gap-4 transition-all absolute md:relative right-0 top-0 bottom-0 h-full ${
            !isRegisterMode 
              ? 'max-[768px]:hidden opacity-0 pointer-events-none md:translate-x-[15%]' 
              : 'w-full opacity-100 pointer-events-auto md:translate-x-0 z-20'
          }`}
          id="signup-form-side"
        >
          {/* Logo / Header */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#4fd8e0]">
              <Sparkles size={24} className="drop-shadow-[0_0_8px_#4fd8e0]" />
              <span className="font-extrabold text-lg tracking-wider text-white">ai-anime <span className="text-[#4fd8e0]">Hub</span></span>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mt-2">Sign Up</h2>
            <p className="text-xs text-neutral-400">Join us today! Please fill in your details to create an account.</p>
          </div>

          {signUpErrors.api && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl p-3 flex gap-2.5 items-start">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{signUpErrors.api}</span>
            </div>
          )}

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-3.5">
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-full border border-white/10 bg-white hover:bg-neutral-100 text-neutral-900 transition-all duration-200 text-xs font-semibold cursor-pointer outline-none"
            >
              <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-3.3-4.53-6.16-4.53z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('facebook')}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-full border border-white/10 bg-white hover:bg-neutral-100 text-neutral-900 transition-all duration-200 text-xs font-semibold cursor-pointer outline-none"
            >
              <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
              </svg>
              Facebook
            </button>
          </div>

          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink mx-3 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
              Or continue with email
            </span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <form onSubmit={handleSignUpSubmit} className="flex flex-col gap-3" noValidate>
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name-signup" className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">
                Full Name
              </label>
              <div className="relative flex items-center">
                <User size={15} className="absolute left-4 text-neutral-400" />
                <input
                  id="name-signup"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => handleSignUpBlur('name')}
                  placeholder="Your full name"
                  disabled={isSubmitting}
                  className={`w-full text-xs pl-11 pr-4 py-2.5 bg-white/[0.03] border ${
                    signUpErrors.name ? 'border-rose-500 focus:ring-rose-500/20' : 'border-white/15 focus:border-[#4fd8e0] focus:ring-[#4fd8e0]/20'
                  } rounded-full text-white placeholder-neutral-500 focus:outline-none focus:ring-3 transition-all duration-200`}
                />
              </div>
              {signUpErrors.name && (
                <span className="text-[10px] text-rose-400 flex items-center gap-1 mt-0.5 pl-1">
                  <AlertCircle size={10} />
                  {signUpErrors.name}
                </span>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email-signup" className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">
                Email
              </label>
              <div className="relative flex items-center">
                <Mail size={15} className="absolute left-4 text-neutral-400" />
                <input
                  id="email-signup"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleSignUpBlur('email')}
                  placeholder="name@domain.com"
                  disabled={isSubmitting}
                  className={`w-full text-xs pl-11 pr-4 py-2.5 bg-white/[0.03] border ${
                    signUpErrors.email ? 'border-rose-500 focus:ring-rose-500/20' : 'border-white/15 focus:border-[#4fd8e0] focus:ring-[#4fd8e0]/20'
                  } rounded-full text-white placeholder-neutral-500 focus:outline-none focus:ring-3 transition-all duration-200`}
                />
              </div>
              {signUpErrors.email && (
                <span className="text-[10px] text-rose-400 flex items-center gap-1 mt-0.5 pl-1">
                  <AlertCircle size={10} />
                  {signUpErrors.email}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password-signup" className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock size={15} className="absolute left-4 text-neutral-400" />
                <input
                  id="password-signup"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => handleSignUpBlur('password')}
                  placeholder="Min. 8 characters"
                  disabled={isSubmitting}
                  className={`w-full text-xs pl-11 pr-12 py-2.5 bg-white/[0.03] border ${
                    signUpErrors.password ? 'border-rose-500 focus:ring-rose-500/20' : 'border-white/15 focus:border-[#4fd8e0] focus:ring-[#4fd8e0]/20'
                  } rounded-full text-white placeholder-neutral-500 focus:outline-none focus:ring-3 transition-all duration-200`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-4 text-neutral-400 hover:text-white cursor-pointer p-1 rounded-md"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {signUpErrors.password && (
                <span className="text-[10px] text-rose-400 flex items-center gap-1 mt-0.5 pl-1">
                  <AlertCircle size={10} />
                  {signUpErrors.password}
                </span>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPassword-signup" className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <Lock size={15} className="absolute left-4 text-neutral-400" />
                <input
                  id="confirmPassword-signup"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => handleSignUpBlur('confirmPassword')}
                  placeholder="Re-enter password"
                  disabled={isSubmitting}
                  className={`w-full text-xs pl-11 pr-12 py-2.5 bg-white/[0.03] border ${
                    signUpErrors.confirmPassword ? 'border-rose-500 focus:ring-rose-500/20' : 'border-white/15 focus:border-[#4fd8e0] focus:ring-[#4fd8e0]/20'
                  } rounded-full text-white placeholder-neutral-500 focus:outline-none focus:ring-3 transition-all duration-200`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                  className="absolute right-4 text-neutral-400 hover:text-white cursor-pointer p-1 rounded-md"
                >
                  {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {signUpErrors.confirmPassword && (
                <span className="text-[10px] text-rose-400 flex items-center gap-1 mt-0.5 pl-1">
                  <AlertCircle size={10} />
                  {signUpErrors.confirmPassword}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-1 font-bold py-3 px-6 rounded-full cursor-pointer transition-all duration-250 ease-out inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#00f2fe] to-[#0052d4] hover:from-[#4fd8e0] hover:to-[#0062ff] text-white disabled:opacity-70 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] shadow-[0_4px_20px_rgba(79,216,224,0.3)] focus:outline-none text-xs tracking-wider uppercase"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                'Sign up'
              )}
            </button>
          </form>

          <div className="text-center mt-2 text-xs text-neutral-400">
            Already a member?{' '}
            <button 
              type="button"
              onClick={() => toggleMode(false)}
              className="text-[#4fd8e0] font-bold hover:underline transition-all duration-200 bg-transparent border-none outline-none cursor-pointer"
            >
              Log in here
            </button>
          </div>
        </div>

        {/* ==================== SLIDING OVERLAY CONTAINER (Visual Mask) ==================== */}
        <div 
          style={{ transition: 'transform 1.8s cubic-bezier(0.16, 1, 0.3, 1) 1.2s' }}
          className={`hidden md:block absolute top-0 bottom-0 w-1/2 z-30 transition-transform overflow-hidden rounded-[40px] ${
            isRegisterMode 
              ? 'left-0 transform translate-x-0 rounded-r-none' 
              : 'left-0 transform translate-x-full rounded-l-none'
          }`}
          id="sliding-visual-overlay"
        >
          {/* Slide 1: Register Visual (NeuroSama - left side) */}
          <div 
            style={{ transition: 'opacity 1.8s cubic-bezier(0.16, 1, 0.3, 1) 1.2s' }}
            className={`absolute inset-0 transition-opacity ${
              isRegisterMode ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          >
            <img className="w-full h-full object-cover object-center" src={muImg} alt="Register guild showcase" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#040c1e] via-[#040c1e]/40 to-transparent"></div>
            
            <div className="absolute bottom-10 left-10 right-10 flex flex-col gap-4 z-40 text-left">
              <div className="flex flex-col gap-1">
                <h3 className="text-2xl font-extrabold text-white tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                  JOIN THE CIRCLE
                </h3>
                <p className="text-xs text-neutral-300 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] leading-relaxed">
                  Unlock exclusive articles, customize your dashboard, and engage in discussions with fellow AI & anime enthusiasts.
                </p>
              </div>
              <div className="flex gap-1.5 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-white opacity-40"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-white opacity-40"></span>
              </div>
            </div>
          </div>

          {/* Slide 2: Login Visual (chibi - right side) */}
          <div 
            style={{ transition: 'opacity 1.8s cubic-bezier(0.16, 1, 0.3, 1) 1.2s' }}
            className={`absolute inset-0 transition-opacity ${
              !isRegisterMode ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          >
            <img className="w-full h-full object-cover object-center" src={arImg} alt="Login discover showcase" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#040c1e] via-[#040c1e]/40 to-transparent"></div>
            
            <div className="absolute bottom-10 left-10 right-10 flex flex-col gap-4 z-40 text-left">
              <div className="flex flex-col gap-1">
                <h3 className="text-2xl font-extrabold text-white tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                  DISCOVER NEW REALMS
                </h3>
                <p className="text-xs text-neutral-300 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] leading-relaxed">
                  Connect with fellow AI & anime enthusiasts, join discussions, and share your passion.
                </p>
              </div>
              <div className="flex gap-1.5 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white opacity-40"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-white opacity-40"></span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
