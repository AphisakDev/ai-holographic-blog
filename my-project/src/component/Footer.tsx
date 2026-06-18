export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer-content" id="footer-content">
        <div className="footer-left" id="footer-left">
          <span className="get-in-touch" id="get-in-touch">Get in touch</span>
          <div className="social-links" id="social-links">
            {/* LinkedIn */}
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-btn"
              id="social-linkedin"
              aria-label="LinkedIn"
            >
              <svg viewBox="0 0 24 24" className="social-svg">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
            </a>

            {/* GitHub */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-btn"
              id="social-github"
              aria-label="GitHub"
            >
              <svg viewBox="0 0 24 24" className="social-svg">
                <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
              </svg>
            </a>

            {/* Google / Website */}
            <a
              href="https://google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-btn"
              id="social-google"
              aria-label="Google"
            >
              <svg viewBox="0 0 24 24" className="social-svg">
                <path d="M12.24 10.285V13.4h6.887c-.648 2.41-2.519 4.113-5.211 4.113-3.415 0-6.191-2.822-6.191-6.299 0-3.477 2.776-6.299 6.191-6.299 1.567 0 2.997.585 4.095 1.547l2.451-2.452C18.815 2.535 15.69 1.5 12.24 1.5 6.772 1.5 2.25 6.073 2.25 11.72s4.522 10.22 9.99 10.22c5.727 0 9.52-4.004 9.52-9.717 0-.687-.06-1.347-.172-1.938H12.24z" />
              </svg>
            </a>
          </div>
        </div>
        <div className="footer-right" id="footer-right">
          <a href="/" className="home-link" id="home-link">Home page</a>
        </div>
      </div>
    </footer>
  );
}
