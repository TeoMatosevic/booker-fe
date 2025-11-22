import React from 'react';
import { X, PlusCircle, HomeIcon, Users, KeyRound, Building, LogIn, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { appEmitter } from '../utils/eventEmitter';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const { username } = useAuth();

    const handleActionClick = (eventName: string) => {
        appEmitter.emit(eventName);
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={onClose}
            />

            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 w-72 h-full bg-white z-50 shadow-strong transition-transform duration-300 ease-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
                            style={{ background: 'linear-gradient(to bottom right, #4f46e5, #4338ca)' }}
                        >
                            <Calendar className="text-white" size={18} />
                        </div>
                        <span className="text-lg font-bold text-gray-900">Booker</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        aria-label="Close menu"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* User Info */}
                <div className="px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: '#e0e7ff' }}
                        >
                            <span className="text-sm font-semibold" style={{ color: '#4338ca' }}>
                                {username?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">{username}</p>
                            <p className="text-xs text-gray-500">User Account</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-4 py-4">
                    {/* Main Section */}
                    <div className="mb-6">
                        <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Main
                        </h3>
                        <Link
                            to="/"
                            onClick={onClose}
                            className="flex items-center gap-3 px-3 py-2.5 text-gray-700 rounded-lg transition-colors group cursor-pointer"
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#eef2ff';
                                e.currentTarget.style.color = '#4338ca';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = '#374151';
                            }}
                        >
                            <HomeIcon size={20} className="text-gray-500" />
                            <span className="font-medium">Dashboard</span>
                        </Link>
                    </div>

                    {/* Groups Section */}
                    <div className="mb-6">
                        <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Groups
                        </h3>
                        <ul className="space-y-1">
                            <li>
                                <button
                                    onClick={() => handleActionClick('openCreateGroupModal')}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 rounded-lg transition-colors text-left group cursor-pointer"
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#f0fdf4';
                                        e.currentTarget.style.color = '#15803d';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.color = '#374151';
                                    }}
                                >
                                    <Users size={20} className="text-gray-500" />
                                    <span className="font-medium">Create Group</span>
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => handleActionClick('openJoinGroupModal')}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 rounded-lg transition-colors text-left group cursor-pointer"
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#eef2ff';
                                        e.currentTarget.style.color = '#4338ca';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.color = '#374151';
                                    }}
                                >
                                    <LogIn size={20} className="text-gray-500" />
                                    <span className="font-medium">Join Group</span>
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => handleActionClick('openCreateGroupCodeModal')}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 rounded-lg transition-colors text-left group cursor-pointer"
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#fffbeb';
                                        e.currentTarget.style.color = '#92400e';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.color = '#374151';
                                    }}
                                >
                                    <KeyRound size={20} className="text-gray-500" />
                                    <span className="font-medium">Create Invite Code</span>
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Bookings Section */}
                    <div className="mb-6">
                        <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Bookings
                        </h3>
                        <ul className="space-y-1">
                            <li>
                                <button
                                    onClick={() => handleActionClick('openAddPropertyModal')}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 rounded-lg transition-colors text-left group cursor-pointer"
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#eef2ff';
                                        e.currentTarget.style.color = '#4338ca';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.color = '#374151';
                                    }}
                                >
                                    <Building size={20} className="text-gray-500" />
                                    <span className="font-medium">Add Property</span>
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => handleActionClick('openCreateBookingModalFromSidebar')}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 rounded-lg transition-colors text-left group cursor-pointer"
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#eef2ff';
                                        e.currentTarget.style.color = '#4338ca';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.color = '#374151';
                                    }}
                                >
                                    <PlusCircle size={20} className="text-gray-500" />
                                    <span className="font-medium">New Booking</span>
                                </button>
                            </li>
                        </ul>
                    </div>
                </nav>
            </div>
        </>
    );
};

export default Sidebar;
