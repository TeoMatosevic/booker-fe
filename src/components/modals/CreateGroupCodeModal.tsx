import React, { useState, useEffect } from 'react';
import apiClient from '../../api';
import { X } from 'lucide-react';
import { Group } from '../../models';

interface CreateGroupCodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    groups: Group[];
    onCodeCreated: (code: string, groupName: string, groupId: string) => void;
}

const CreateGroupCodeModal: React.FC<CreateGroupCodeModalProps> = ({
    isOpen,
    onClose,
    groups,
    onCodeCreated,
}) => {
    const [selectedGroupId, setSelectedGroupId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && groups.length > 0 && !selectedGroupId) {
            setSelectedGroupId(groups[0].id.toString());
        }
        if (!isOpen) {
            setSelectedGroupId(groups.length > 0 ? groups[0].id.toString() : '');
            setError(null);
            setIsLoading(false);
        }
    }, [isOpen, groups, selectedGroupId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedGroupId) {
            setError("Please select a group.");
            return;
        }
        setIsLoading(true);
        setError(null);

        try {
            const response = await apiClient.post(`/group-codes/`, {
                group_id: selectedGroupId,
            });

            const newCode = response.data.groupCode;
            const selectedGroup = groups.find(g => g.id.toString() === selectedGroupId);

            if (newCode && selectedGroup) {
                onCodeCreated(newCode, selectedGroup.name, selectedGroup.id);
                onClose();
            } else {
                setError("Failed to get code or group details from response.");
            }
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Failed to create group code');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Generate Group Invite Code</h2>
                    <button onClick={onClose} className="p-1 hover:text-gray-700 cursor-pointer">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                    <div className="mb-6">
                        <label htmlFor="groupCodeSelect" className="block text-sm font-medium text-gray-700 mb-1">
                            Select Group <span className="text-red-500">*</span>
                        </label>
                        {groups.length > 0 ? (
                            <select
                                id="groupCodeSelect"
                                value={selectedGroupId}
                                onChange={(e) => setSelectedGroupId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                                required
                            >
                                {groups.map((group) => (
                                    <option key={group.id} value={group.id.toString()}>
                                        {group.name}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <p className="text-sm text-gray-500">No groups available. Please create a group first.</p>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || groups.length === 0 || !selectedGroupId}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
                        >
                            {isLoading ? 'Generating...' : 'Generate Code'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateGroupCodeModal;
