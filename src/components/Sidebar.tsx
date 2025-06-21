import React from 'react';
import { X, PlusCircle, HomeIcon, Users, KeyRound, Building, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { appEmitter } from '../utils/eventEmitter';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    //if (!isOpen) return null;

    const handleActionClick = (eventName: string) => {
        appEmitter.emit(eventName);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-40"
            style={{ backgroundColor: isOpen ? 'rgba(0, 0, 0, 0.3)' : 'transparent', pointerEvents: isOpen ? 'auto' : 'none' }}
            onClick={onClose}
        >
            <div
                className="fixed top-0 left-0 w-64 h-full bg-gray-800 text-gray-100 p-5 z-50 shadow-lg transition transform duration-300 ease-in-out"
                onClick={(e) => e.stopPropagation()}
                style={{ transform: isOpen ? 'translateX(0)' : 'translateX(-100%)' }}
            >
                <div className="flex justify-between items-center mb-8 mt-14">
                    <h2 className="text-xl font-semibold cursor-pointer">Menu</h2>
                    <button onClick={onClose} className="p-1 text-gray-300 hover:text-white cursor-pointer">
                        <X size={26} />
                    </button>
                </div>
                <nav>
                    <ul className="space-y-2">
                        <li>
                            <Link
                                to="/"
                                onClick={onClose}
                                className="flex items-center py-2.5 px-4 hover:bg-gray-700 rounded-md transition-colors duration-150"
                            >
                                <HomeIcon size={20} className="mr-3 text-indigo-400" /> Dashboard
                            </Link>
                        </li>
                        <li>
                            <button
                                onClick={() => handleActionClick('openCreateGroupModal')}
                                className="w-full flex items-center py-2.5 px-4 hover:bg-gray-700 rounded-md transition-colors duration-150 text-left cursor-pointer"
                            >
                                <Users size={20} className="mr-3 text-green-400" /> Create Group
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => handleActionClick('openAddPropertyModal')}
                                className="w-full flex items-center py-2.5 px-4 hover:bg-gray-700 rounded-md transition-colors duration-150 text-left cursor-pointer"
                            >
                                <Building size={20} className="mr-3 text-blue-400" /> Add Property
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => handleActionClick('openCreateBookingModalFromSidebar')}
                                className="w-full flex items-center py-2.5 px-4 hover:bg-gray-700 rounded-md transition-colors duration-150 text-left cursor-pointer"
                            >
                                <PlusCircle size={20} className="mr-3 text-teal-400" /> New Booking
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => handleActionClick('openCreateGroupCodeModal')}
                                className="w-full flex items-center py-2.5 px-4 hover:bg-gray-700 rounded-md transition-colors duration-150 text-left cursor-pointer"
                            >
                                <KeyRound size={20} className="mr-3 text-yellow-400" /> Create Invite Code
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => handleActionClick('openJoinGroupModal')}
                                className="w-full flex items-center py-2.5 px-4 hover:bg-gray-700 rounded-md transition-colors duration-150 text-left cursor-pointer"
                            >
                                <LogIn size={20} className="mr-3 text-purple-400" /> Join Group
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    );
};

export default Sidebar;
