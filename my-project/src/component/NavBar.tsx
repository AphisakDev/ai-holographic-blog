

export default function NavBar() {
  return (
    <nav className="bg-custom-navbar-bg border border-custom-border rounded-[20px] py-[14px] px-8 flex justify-between items-center shadow-[0_4px_20px_rgba(28,26,23,0.02)] transition-all duration-300 max-[576px]:py-3 max-[576px]:px-5 max-[576px]:rounded-[16px]" id="navbar">
      <div className="text-2xl font-extrabold text-custom-text-primary tracking-[-0.5px] select-none max-[576px]:text-xl" id="navbar-logo">
        hh<span className="text-custom-accent">.</span>
      </div>
      <div className="flex gap-3" id="navbar-actions">
        <button className="text-sm font-semibold py-2.5 px-6 rounded-full cursor-pointer transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] inline-flex items-center justify-center outline-none max-[576px]:py-2 max-[576px]:px-[18px] max-[576px]:text-[13px] bg-transparent border border-custom-btn-border text-custom-text-primary hover:bg-[rgba(28,26,23,0.03)] dark:hover:bg-[rgba(244,242,238,0.05)] hover:border-custom-text-primary" id="btn-login">Log in</button>
        <button className="text-sm font-semibold py-2.5 px-6 rounded-full cursor-pointer transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] inline-flex items-center justify-center outline-none max-[576px]:py-2 max-[576px]:px-[18px] max-[576px]:text-[13px] bg-custom-btn-signup-bg border border-custom-btn-signup-bg text-custom-btn-signup-text shadow-[0_2px_8px_rgba(28,26,23,0.08)] hover:opacity-90 hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(28,26,23,0.15)]" id="btn-signup">Sign up</button>
      </div>
    </nav>
  );
}

