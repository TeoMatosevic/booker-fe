import React, { useState } from 'react';
import { Modal, Button } from '../ui';
import { Property } from '../../models';
import { Building } from 'lucide-react';

interface SelectPropertyModalProps {
    isOpen: boolean;
    onClose: () => void;
    properties: Property[];
    onPropertySelected: (propertyId: string) => void;
}

const SelectPropertyModal: React.FC<SelectPropertyModalProps> = ({
    isOpen,
    onClose,
    properties,
    onPropertySelected,
}) => {
    const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');

    const handleSubmit = () => {
        if (selectedPropertyId) {
            onPropertySelected(selectedPropertyId);
            setSelectedPropertyId('');
            onClose();
        }
    };

    const handleClose = () => {
        setSelectedPropertyId('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Select Property" size="md">
            <div className="space-y-4">
                <p className="text-sm text-gray-600">
                    Please select which property you'd like to create a booking for:
                </p>

                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {properties.map((property) => (
                        <button
                            key={property.id}
                            onClick={() => setSelectedPropertyId(property.id)}
                            className={`
                                w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all cursor-pointer
                                ${selectedPropertyId === property.id
                                    ? 'border-primary-500 bg-primary-50'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }
                            `}
                            style={{
                                borderColor: selectedPropertyId === property.id ? '#4f46e5' : undefined,
                                backgroundColor: selectedPropertyId === property.id ? '#eef2ff' : undefined,
                            }}
                        >
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{
                                    backgroundColor: selectedPropertyId === property.id ? '#4f46e5' : '#e5e7eb',
                                }}
                            >
                                <Building
                                    size={20}
                                    style={{
                                        color: selectedPropertyId === property.id ? '#ffffff' : '#6b7280',
                                    }}
                                />
                            </div>
                            <span className="font-medium text-gray-900 text-left">{property.name}</span>
                        </button>
                    ))}
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
                    <Button type="button" onClick={handleClose} variant="secondary">
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        variant="primary"
                        disabled={!selectedPropertyId}
                    >
                        Continue
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default SelectPropertyModal;
