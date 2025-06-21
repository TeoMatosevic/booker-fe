import React, { useState, useEffect } from 'react';
import apiClient from '../../api';
import { X } from 'lucide-react';
interface GroupForDisplay {
    id: string;
    name: string;
}

interface AddPropertyModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentSelectedGroup: GroupForDisplay | null;
    onPropertyAdded: () => void;
}

const AddPropertyModal: React.FC<AddPropertyModalProps> = ({
    isOpen,
    onClose,
    currentSelectedGroup,
    onPropertyAdded,
}) => {
    const [propertyName, setPropertyName] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setPropertyName('');
            setError(null);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentSelectedGroup) {
            setError("No group is currently selected to add a property to.");
            return;
        }
        if (!propertyName.trim()) {
            setError("Property name cannot be empty.");
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            await apiClient.post(`/properties/group/${currentSelectedGroup.id}`, {
                name: propertyName,
                group_id: currentSelectedGroup.id,
            });
            onPropertyAdded();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Failed to add property');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md my-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">
                        Add New Property to "{currentSelectedGroup ? currentSelectedGroup.name : 'Group'}"
                    </h2>
                    <button onClick={onClose} className="p-1 hover:text-gray-700 cursor-pointer">
                        <X size={24} />
                    </button>
                </div>

                {!currentSelectedGroup ? (
                    <p className="text-red-500 text-center">
                        Error: No group selected. Please select a group on the dashboard before adding a property.
                    </p>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && <p className="text-red-500 text-sm ">{error}</p>}
                        <div>
                            <label htmlFor="propertyName" className="block text-sm font-medium text-gray-700">
                                Property Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="propertyName"
                                value={propertyName}
                                onChange={(e) => setPropertyName(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                        </div>
                        <div className="flex justify-end space-x-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
                            >
                                {isLoading ? 'Adding...' : 'Add Property'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AddPropertyModal;
