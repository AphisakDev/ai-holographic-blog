import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 flex-grow text-center" id="not-found-page">
      <div className="relative mb-6">
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-custom-accent via-red-500 to-amber-500 opacity-20 blur-xl animate-pulse"></div>
        <div className="relative bg-custom-footer-bg border border-custom-border rounded-full p-6 inline-flex items-center justify-center text-custom-accent">
          <AlertTriangle size={48} className="stroke-[1.5]" />
        </div>
      </div>

      <h1 className="text-7xl font-extrabold tracking-tighter text-custom-text-primary mb-3 bg-clip-text text-transparent bg-gradient-to-b from-custom-text-primary to-custom-text-secondary select-none" id="not-found-title">
        404
      </h1>
      
      <h2 className="text-xl font-bold text-custom-text-primary mb-4" id="not-found-subtitle">
        Page Not Found
      </h2>
      
      <p className="text-custom-text-muted text-sm max-w-md mb-8 leading-relaxed" id="not-found-desc">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable. Let's get you back on track!
      </p>

      <Link 
        to="/" 
        className="inline-flex items-center gap-2 text-sm font-semibold py-3 px-6 rounded-full cursor-pointer transition-all duration-250 bg-custom-btn-signup-bg text-custom-btn-signup-text shadow-[0_2px_8px_rgba(28,26,23,0.08)] hover:opacity-90 hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(28,26,23,0.15)]"
        id="btn-notfound-back-home"
      >
        <Home size={16} />
        Back to Home
      </Link>
    </div>
  );
}
