import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, Calendar, LogOut, User, ChevronDown } from 'lucide-react';
import Sidebar from './Sidebar';

const Navbar: React.FC = () => {
    const { isLoggedIn, logout, username } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    const handleLogout = () => {
        logout();
        setIsSidebarOpen(false);
        setIsUserMenuOpen(false);
        navigate('/login');
    };

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <>
            <nav className="bg-white border-b border-gray-200 shadow-sm h-16 flex items-center sticky top-0 z-50">
                <div className="container mx-auto px-4 flex justify-between items-center h-full">
                    {/* Left Side - Logo and Menu */}
                    <div className="flex items-center gap-3">
                        {isLoggedIn && (
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                aria-label="Toggle menu"
                            >
                                {isSidebarOpen ? <X size={24} className="text-gray-700" /> : <Menu size={24} className="text-gray-700" />}
                            </button>
                        )}
                        <Link to="/" className="flex items-center gap-2 group">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow"
                                style={{ background: 'linear-gradient(to bottom right, #4f46e5, #4338ca)' }}
                            >
                                <Calendar className="text-white" size={22} />
                            </div>
                            <span className="text-xl font-bold text-gray-900">Booker</span>
                        </Link>
                    </div>

                    {/* Right Side - Auth Actions */}
                    <div className="flex items-center gap-3">
                        {isLoggedIn ? (
                            <>
                                {/* Desktop User Menu */}
                                <div className="relative" ref={userMenuRef}>
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className="hidden md:flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                    >
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center"
                                            style={{ backgroundColor: '#e0e7ff' }}
                                        >
                                            <User size={16} style={{ color: '#4338ca' }} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">{username}</span>
                                        <ChevronDown size={16} className={`text-gray-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isUserMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-strong border border-gray-200 py-1 animate-slide-down">
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <p className="text-sm font-medium text-gray-900">{username}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">Manage your account</p>
                                            </div>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors cursor-pointer"
                                            >
                                                <LogOut size={16} />
                                                <span>Sign out</span>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Mobile Logout Button */}
                                <button
                                    onClick={handleLogout}
                                    className="md:hidden p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors cursor-pointer"
                                    aria-label="Logout"
                                    style={{ color: '#ef4444' }}
                                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                >
                                    <LogOut size={20} />
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Sign in
                                </Link>
                                <Link
                                    to="/register"
                                    style={{ backgroundColor: '#4f46e5' }}
                                    className="px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-colors"
                                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#4338ca'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#4f46e5'; }}
                                >
                                    Sign up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
            {isLoggedIn && (
                <Sidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />
            )}
        </>
    );
};

export default Navbar;
