import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Determine if we are on a dark authenticaton page or light dashboard page
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/';

    // Base classes for the navbar pill
    const baseNavClass = "fixed z-50 flex justify-between items-center transition-all duration-300";

    // Choose dynamic styling based on the current page to ensure legibility and premium feel
    const navStyleClass = isAuthPage
        ? "top-0 left-0 w-full px-6 md:px-12 py-6 bg-transparent border-transparent text-white" // Seamless transparent blend for Auth pages
        : "top-4 left-1/2 transform -translate-x-1/2 w-[95%] max-w-6xl rounded-2xl px-6 py-3 shadow-xl border bg-white/70 backdrop-blur-xl border-white/50 text-gray-900"; // Floating light pill for Dashboard

    // Dynamic Logo Colors
    const logoGradient = isAuthPage
        ? "from-blue-800 via-indigo-700 to-purple-800"
        : "from-blue-700 via-indigo-600 to-purple-700";

    const starColor = isAuthPage ? "text-blue-700" : "text-blue-600";

    // Ghost button styling matches the theme to stay elegant
    const ghostButtonClass = isAuthPage
        ? "text-blue-100 hover:text-white hover:bg-white/10"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100";

    // Dynamic Login Link Colors (Needs to be dark on mobile auth pages, but light on desktop auth pages where the right side is dark)
    const loginLinkClass = isAuthPage
        ? "text-gray-700 md:text-blue-100 hover:text-blue-600 md:hover:text-white hover:bg-black/5 md:hover:bg-white/10"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100";

    return (
        <nav className={`${baseNavClass} ${navStyleClass}`}>

            <Link to="/" className="flex items-center gap-2 group">
                <span className={`text-xl md:text-2xl pt-[2px] transition-transform group-hover:scale-110 duration-300 ${starColor}`}>✦</span>
                <span className={`text-lg font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r ${logoGradient} drop-shadow-sm group-hover:opacity-80 transition-opacity`}>
                    Sankhya
                </span>
            </Link>

            <div>
                {user ? (
                    <div className="flex items-center gap-3 md:gap-6">
                        <Link to="/profile" className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white border border-blue-500/20 shadow-sm">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <span className="hidden md:inline">{user.name}</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className={`text-sm font-semibold transition-colors px-4 py-2 rounded-xl ${ghostButtonClass}`}
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 md:gap-4">
                        <Link
                            to="/login"
                            className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all ${loginLinkClass}`}
                        >
                            Log In
                        </Link>
                        <Link
                            to="/register"
                            className="text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 transform hover:-translate-y-0.5 transition-all border border-blue-400/30"
                        >
                            Sign Up Free
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
