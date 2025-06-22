import React, { useState, useEffect } from 'react';
import apiClient from '../../api';
import { X, Edit3, Trash2, Save } from 'lucide-react';
import { Booking, Property } from '../../models';
import { format } from 'date-fns';

interface ViewEditBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: Booking | null;
    property: Property | null;
    onBookingUpdated: () => void;
    onBookingDeleted: () => void;
}

const ViewEditBookingModal: React.FC<ViewEditBookingModalProps> = ({
    isOpen,
    onClose,
    booking: initialBooking,
    property,
    onBookingUpdated,
    onBookingDeleted,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentBooking, setCurrentBooking] = useState<Booking | null>(initialBooking);

    const [guestName, setGuestName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";

    useEffect(() => {
        setCurrentBooking(initialBooking);
        if (initialBooking) {
            setGuestName(initialBooking.guestName || ''); // Populate guestName
            setStartDate(initialBooking.startDate ? format(initialBooking.startDate, 'yyyy-MM-dd') : '');
            setEndDate(initialBooking.endDate ? format(initialBooking.endDate, 'yyyy-MM-dd') : '');
            setIsEditing(false);
            setError(null);
        }
    }, [initialBooking, isOpen]);

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        setError(null);
    };

    const handleSaveChanges = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentBooking) return;

        if (!guestName.trim() || !startDate || !endDate) {
            setError("Please fill in all required fields (Guest Name, Start/End Dates).");
            return;
        }

        setIsLoading(true);
        setError(null);

        const updatedBookingData = {
            guest_name: guestName,
            start_date: new Date(startDate),
            end_date: new Date(endDate),
        };

        try {
            await apiClient.put(`/bookings/${currentBooking.id}`, updatedBookingData);
            onBookingUpdated();
            setIsEditing(false);
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Failed to update booking');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteBooking = async () => {
        if (!currentBooking) return;
        if (window.confirm(`Are you sure you want to delete this booking for "${currentBooking.guestName || currentBooking.guestName}"?`)) {
            setIsLoading(true);
            setError(null);
            try {
                await apiClient.delete(`/bookings/${currentBooking.id}`);
                onBookingDeleted();
                onClose();
            } catch (err: any) {
                setError(err.response?.data?.error || err.message || 'Failed to delete booking');
            } finally {
                setIsLoading(false);
            }
        }
    };

    if (!isOpen || !currentBooking) return null;

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg my-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">
                        {isEditing ? 'Edit Booking' : 'Booking Details'}
                        {property && <span className="text-sm text-gray-500 ml-2">for {property.name}</span>}
                    </h2>
                    <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700 cursor-pointer">
                        <X size={24} />
                    </button>
                </div>

                {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}

                {!isEditing ? (
                    <div className="space-y-3 text-sm">
                        <p><strong>Guest:</strong> {currentBooking.guestName}</p>
                        <p><strong>Starts:</strong> {currentBooking.startDate?.toLocaleString()}</p>
                        <p><strong>Ends:</strong> {currentBooking.endDate?.toLocaleString()}</p>
                        <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
                            <button
                                onClick={handleDeleteBooking}
                                disabled={isLoading}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md flex items-center disabled:opacity-50 cursor-pointer"
                            >
                                <Trash2 size={16} className="mr-2" /> Delete
                            </button>
                            <button
                                onClick={handleEditToggle}
                                disabled={isLoading}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center disabled:opacity-50 cursor-pointer"
                            >
                                <Edit3 size={16} className="mr-2" /> Edit
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSaveChanges} className="space-y-4">
                        <div>
                            <label htmlFor="editBookingGuestName" className="block text-sm font-medium text-gray-700">Guest name <span className="text-red-500">*</span></label>
                            <input type="text" id="editBookingGuestName" value={guestName} onChange={(e) => setGuestName(e.target.value)} required className={inputClasses} />
                        </div>
                        <div>
                            <label htmlFor="editStartDate" className="block text-sm font-medium text-gray-700">Start Date <span className="text-red-500">*</span></label>
                            <input type="date" id="editStartDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className={inputClasses} />
                        </div>

                        <div>
                            <label htmlFor="editEndDate" className="block text-sm font-medium text-gray-700">End Date <span className="text-red-500">*</span></label>
                            <input type="date" id="editEndDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} required className={inputClasses} />
                        </div>
                        <div className="flex justify-end space-x-3 pt-2">
                            <button type="button" onClick={() => setIsEditing(false)} disabled={isLoading} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border cursor-pointer">Cancel Edit</button>
                            <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-md flex items-center disabled:opacity-50 cursor-pointer">
                                <Save size={16} className="mr-2" /> Save Changes
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ViewEditBookingModal;
