import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

const NavigationBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pageUrl = location.pathname || "/";
  const token = localStorage.getItem("token");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isAdminPath = pageUrl.startsWith("/admin");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    setMenuOpen(false);
    navigate("/");
  }

  const navClasses = `fixed w-full top-0 left-0 z-50 transition-all duration-300 ${scrolled || menuOpen ? 'bg-white/90 backdrop-blur-md shadow-sm py-2' : 'bg-transparent py-4'
    }`;

  const linkClasses = (isActive) => `
    font-medium transition-colors duration-200 
    ${scrolled || menuOpen ? (isActive ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600') : (isActive ? 'text-white' : 'text-white/90 hover:text-white')}
  `;

  const logoClasses = scrolled || menuOpen ? 'text-indigo-600' : 'text-white';
  const logoBgClasses = scrolled || menuOpen ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600';

  return (
    <nav className={navClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-colors ${logoBgClasses}`}>
              <span className="font-bold text-lg">TK</span>
            </div>
            <span className={`text-xl font-bold tracking-tight transition-colors ${logoClasses}`}>
              TicketKatum
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className={linkClasses(pageUrl === "/")}>Home</Link>
            <Link to="/buslist" className={linkClasses(pageUrl === "/buslist")}>Search Buses</Link>

            {!isAdminPath && !token && (
              <Link
                to="/login"
                className={`px-5 py-2.5 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md
                  ${scrolled ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-white text-indigo-600 hover:bg-indigo-50'}
                `}
              >
                Sign In
              </Link>
            )}

            {isAdminPath && token && (
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all shadow-sm hover:shadow-md"
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${scrolled || menuOpen ? 'text-slate-600 hover:bg-slate-100' : 'text-white hover:bg-white/10'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute top-full left-0 w-full bg-white border-t border-slate-100 shadow-lg transition-all duration-300 origin-top ${menuOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`}>
        <div className="p-4 space-y-3">
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className={`block px-4 py-3 rounded-lg font-medium ${pageUrl === '/' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Home
          </Link>
          <Link
            to="/buslist"
            onClick={() => setMenuOpen(false)}
            className={`block px-4 py-3 rounded-lg font-medium ${pageUrl === '/buslist' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Search Buses
          </Link>

          {!isAdminPath && !token && (
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 rounded-lg font-medium text-indigo-600 hover:bg-indigo-50"
            >
              Sign In
            </Link>
          )}

          {isAdminPath && token && (
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;