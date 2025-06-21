import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';

const Navbar: React.FC = () => {
    const { isLoggedIn, logout, username } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setIsSidebarOpen(false);
        navigate('/login');
    };

    return (
        <>
            <nav className="bg-gray-800 p-4 text-white h-16 flex items-center sticky top-0 z-50">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center">
                        {isLoggedIn ? (
                            <>
                                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="mr-4 p-2 cursor-pointer">
                                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="mr-4" />
                            </>
                        )}
                        <Link to="/" className="text-xl font-bold">Booker</Link>
                    </div>
                    <div className="hidden md:flex items-center space-x-4">
                        {isLoggedIn ? (
                            <>
                                <span className="text-sm">{username}</span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-3 rounded text-sm cursor-pointer"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="hover:text-gray-300">Login</Link>
                                <Link to="/register" className="hover:text-gray-300">Register</Link>
                            </>
                        )}
                    </div>
                    {isLoggedIn && !isSidebarOpen && (
                        <div className="md:hidden">
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
                            >
                                Logout
                            </button>
                        </div>
                    )}
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
