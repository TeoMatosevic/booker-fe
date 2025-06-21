import React, { useState, useEffect } from 'react';
import apiClient from '../../api';
import { X } from 'lucide-react';
import { Property } from '../../models';

interface CreateBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    property: Property | null;
    initialDate?: Date | null;
    onBookingCreated: () => void;
}

const CreateBookingModal: React.FC<CreateBookingModalProps> = ({
    isOpen,
    onClose,
    property,
    initialDate,
    onBookingCreated,
}) => {
    const [guestName, setGuestName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initialDate) {
            const currDate = initialDate.toISOString().split('T')[0];
            setStartDate(currDate);
            setEndDate(currDate);
        } else {
            setStartDate('');
            setEndDate('');
        }
        setGuestName('');
        setError(null);
    }, [isOpen, initialDate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!property) {
            setError("No property selected.");
            return;
        }
        if (!guestName.trim() || !startDate || !endDate) {
            setError("Please fill in all required fields (Title, Start/End Dates).");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await apiClient.post(`/bookings/property/${property.id}`, {
                start_date: startDate,
                end_date: endDate,
                guest_name: guestName,
            });
            onBookingCreated();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Failed to create booking');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen || !property) return null;

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">New Booking for: {property.name}</h2>
                    <button onClick={onClose} className="p-1 hover:text-gray-700 cursor-pointer">
                        <X size={24} />
                    </button>
                </div>
                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="bookingTitle" className="block text-sm font-medium text-gray-700">Title / Guest Name <span className="text-red-500">*</span></label>
                        <input type="text" id="bookingTitle" value={guestName} onChange={(e) => setGuestName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>

                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date <span className="text-red-500">*</span></label>
                        <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date <span className="text-red-500">*</span></label>
                        <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div className="flex justify-end space-x-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300 cursor-pointer">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50 cursor-pointer">
                            {isLoading ? 'Saving...' : 'Create Booking'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateBookingModal;
