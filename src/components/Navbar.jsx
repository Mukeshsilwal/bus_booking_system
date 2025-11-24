import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

const NavigationBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pageUrl = location.pathname || "/";
  const token = localStorage.getItem("token");
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdminPath = pageUrl.startsWith("/admin");

  function handleLogout() {
    localStorage.removeItem("token");
    setMenuOpen(false);
    navigate("/");
  }

  return (
    <nav className="bg-gradient-to-r from-cyan-800 to-cyan-950 text-white fixed w-full top-0 left-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              aria-label="Home"
              className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-cyan-300 rounded"
            >
              <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center">
                {/* small bus glyph (text) */}
                <span className="font-bold">TK</span>
              </div>
              <span className="text-xl font-bold">TicketKatum</span>
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/"
              className={`inline-block px-4 py-2 rounded-lg font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-300 ${pageUrl === "/" ? 'bg-white text-cyan-900' : 'bg-white/10 hover:bg-white/20'}`}
            >
              Home
            </Link>

            {!isAdminPath && !token && (
              <Link
                to="/admin/login"
                className="inline-block px-4 py-2 bg-white text-cyan-900 rounded-lg hover:bg-white/90 font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-300"
              >
                Admin Login
              </Link>
            )}

            {isAdminPath && token && (
              <button onClick={handleLogout} type="button" className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 font-semibold focus:outline-none focus:ring-2 focus:ring-red-300">
                Admin Logout
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen((s) => !s)}
              aria-expanded={menuOpen}
              aria-label="Toggle navigation"
              className="p-2 rounded-md bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
            <div className="md:hidden bg-cyan-900/95 border-t border-white/10">
          <div className="px-4 pt-2 pb-4 space-y-2">
            <Link to="/" onClick={() => setMenuOpen(false)} className={`block px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-300 ${pageUrl === '/' ? 'bg-white text-cyan-900' : 'text-white hover:bg-white/10'}`}>
              Home
            </Link>
            {!isAdminPath && !token && (
              <Link to="/admin/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-md text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300">
                Admin Login
              </Link>
            )}
            {isAdminPath && token && (
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-md text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-red-300">
                Admin Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavigationBar;