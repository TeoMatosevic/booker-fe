import React, { useState, useEffect } from 'react';
import apiClient from '../../api';
import { X } from 'lucide-react';

interface JoinGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGroupJoined: () => void;
}

const JoinGroupModal: React.FC<JoinGroupModalProps> = ({ isOpen, onClose, onGroupJoined }) => {
    const [groupCode, setGroupCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setGroupCode('');
            setError(null);
            setSuccessMessage(null);
            setIsLoading(false);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!groupCode.trim()) {
            setError("Please enter a group code.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await apiClient.post(`/groups/join/${groupCode.trim()}`);
            const joinedGroupName = response.data?.name || "the group";

            setSuccessMessage(`Successfully joined ${joinedGroupName}!`);
            onGroupJoined();
            setGroupCode('');
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.error || err.response?.data?.message || 'Failed to join group. Invalid or expired code.');
            console.error("Join group error:", err.response || err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Join a Group</h2>
                    <button onClick={onClose} className="p-1 hover:text-gray-700 cursor-pointer">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}
                    {successMessage && <p className="text-green-500 text-sm mb-3 text-center">{successMessage}</p>}

                    <div className="mb-6">
                        <label htmlFor="groupCode" className="block text-sm font-medium text-gray-700 mb-1">
                            Enter Group Code <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="groupCode"
                            value={groupCode}
                            onChange={(e) => setGroupCode(e.target.value)}
                            placeholder="e.g., ABC-123"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-center tracking-wider"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end sm:space-x-3 space-y-2 sm:space-y-0">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300 disabled:opacity-70 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
                        >
                            {isLoading ? 'Joining...' : 'Join Group'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default JoinGroupModal;
