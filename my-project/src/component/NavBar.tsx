

export default function NavBar() {
  return (
    <nav className="navbar" id="navbar">
      <div className="logo" id="navbar-logo">
        hh<span className="logo-dot">.</span>
      </div>
      <div className="nav-actions" id="navbar-actions">
        <button className="btn btn-login" id="btn-login">Log in</button>
        <button className="btn btn-signup" id="btn-signup">Sign up</button>
      </div>
    </nav>
  );
}
