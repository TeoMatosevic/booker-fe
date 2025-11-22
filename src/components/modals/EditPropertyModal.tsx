import React, { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Property } from '../../models';
import { Modal, Button } from '../ui';
import apiClient from '../../api';
import { useToast } from '../../contexts/ToastContext';

interface EditPropertyModalProps {
    isOpen: boolean;
    onClose: () => void;
    property: Property | null;
    onPropertyUpdated: () => void;
}

const EditPropertyModal: React.FC<EditPropertyModalProps> = ({
    isOpen,
    onClose,
    property,
    onPropertyUpdated,
}) => {
    const { showToast } = useToast();
    const [color, setColor] = useState<string>('#4f46e5');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && property) {
            setColor(property.color || '#4f46e5');
        }
    }, [isOpen, property]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!property) return;

        setIsLoading(true);

        try {
            await apiClient.put(`/properties/${property.id}`, { color });
            showToast('success', 'Property color updated successfully');
            onPropertyUpdated();
            onClose();
        } catch (err: any) {
            showToast('error', err.response?.data?.error || 'Failed to update property color');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetToAuto = () => {
        setColor('');
    };

    if (!property) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Property Color" size="md">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Property: <strong>{property.name}</strong>
                    </label>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Custom Color
                    </label>
                    <div className="flex flex-col items-center gap-3">
                        <HexColorPicker color={color || '#4f46e5'} onChange={setColor} style={{ width: '100%' }} />
                        <div className="flex items-center gap-2 w-full">
                            <input
                                type="text"
                                value={color || ''}
                                onChange={(e) => setColor(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-center font-mono text-sm"
                                placeholder="Auto-generated"
                            />
                            <Button
                                type="button"
                                onClick={handleResetToAuto}
                                variant="secondary"
                                size="sm"
                            >
                                Reset to Auto
                            </Button>
                        </div>
                        {!color && (
                            <p className="text-xs text-gray-500">
                                Leaving empty will use auto-generated color
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-2 border-t border-gray-200">
                    <Button
                        type="button"
                        onClick={onClose}
                        variant="secondary"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        variant="primary"
                    >
                        {isLoading ? 'Saving...' : 'Save Color'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default EditPropertyModal;
