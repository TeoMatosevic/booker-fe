import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, EventProps as RBCEventProps, Views, View } from 'react-big-calendar';
import { format } from 'date-fns/format';
import { parse } from 'date-fns/parse';
import { startOfWeek } from 'date-fns/startOfWeek';
import { getDay } from 'date-fns/getDay';
import { enUS } from 'date-fns/locale/en-US';

import apiClient from '../api';
import { useAuth } from '../contexts/AuthContext';
import { appEmitter } from '../utils/eventEmitter';

// Import Modals
import CreateGroupModal from '../components/modals/CreateGroupModal';
import AddPropertyModal from '../components/modals/AddPropertyModal';
import CreateGroupCodeModal from '../components/modals/CreateGroupCodeModal';
import CreateBookingModal from '../components/modals/CreateBookingModal';
import DisplayGroupCodeModal from '../components/modals/DisplayGroupCodeModal';
import JoinGroupModal from '../components/modals/JoinGroupModal';

import { Group, Property, Booking } from '../models';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const HomePage: React.FC = () => {
    const { userId, token } = useAuth();

    const [groups, setGroups] = useState<Group[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);

    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

    const [isLoadingData, setIsLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
    const [isAddPropertyModalOpen, setIsAddPropertyModalOpen] = useState(false);
    const [isCreateGroupCodeModalOpen, setIsCreateGroupCodeModalOpen] = useState(false);
    const [isCreateBookingModalOpen, setIsCreateBookingModalOpen] = useState(false);
    const [bookingModalInitialDate, setBookingModalInitialDate] = useState<Date | null>(null);
    const [isDisplayGroupCodeModalOpen, setIsDisplayGroupCodeModalOpen] = useState(false);
    const [isJoinGroupModalOpen, setIsJoinGroupModalOpen] = useState(false);
    const [generatedGroupCode, setGeneratedGroupCode] = useState<string | null>(null);
    const [generatedCodeForGroupName, setGeneratedCodeForGroupName] = useState<string | null>(null);

    const currentGroup = useMemo(() => groups.find(g => g.id === selectedGroupId) || null, [groups, selectedGroupId]);
    const currentGroupProperties = useMemo(() => {
        if (!selectedGroupId) return [];
        return properties.filter(p => p.groupId === selectedGroupId);
    }, [properties, selectedGroupId]);
    const currentProperty = useMemo(() => currentGroupProperties.find(p => p.id === selectedPropertyId) || null, [currentGroupProperties, selectedPropertyId]);
    const calendarEvents = useMemo(() => {
        if (!selectedPropertyId) return [];
        return bookings.filter(b => b.propertyId === selectedPropertyId);
    }, [bookings, selectedPropertyId]);

    const { defaultDate } = useMemo(() => ({
        defaultDate: new Date(),
    }), [])

    const [currentView, setCurrentView] = useState<View>('month');
    const [currentDate, setCurrentDate] = useState<Date | undefined>(new Date());

    const handleGroupCodeCreated = (code: string, groupName: string) => {
        setGeneratedGroupCode(code);
        setGeneratedCodeForGroupName(groupName);
        setIsDisplayGroupCodeModalOpen(true);
    };

    const fetchGroups = useCallback(async (shouldAutoSelect = false) => {
        if (!userId || !token) { setGroups([]); return []; }
        try {
            const response = await apiClient.get(`/groups/${userId}`);
            const fetchedGroups: Group[] = response.data || [];
            setGroups(fetchedGroups);
            if (shouldAutoSelect && fetchedGroups.length > 0 && !selectedGroupId) {
                setSelectedGroupId(fetchedGroups[0].id);
            }
            return fetchedGroups;
        } catch (err) {
            console.error('Failed to fetch groups:', err);
            setError('Failed to load groups.');
            setGroups([]);
            return [];
        }
    }, [userId, token, selectedGroupId]);

    const fetchPropertiesForGroup = useCallback(async (groupId: string, shouldAutoSelect = false) => {
        if (!groupId || !token) { setProperties(prev => prev.filter(p => p.groupId !== groupId)); return []; }
        try {
            const response = await apiClient.get(`/properties/group/${groupId}`);
            const fetchedProperties: Property[] = (response.data || []).map((p: any) => ({ ...p, groupId }));
            setProperties(prevProps => {
                const otherGroupProps = prevProps.filter(p => p.groupId !== groupId);
                return [...otherGroupProps, ...fetchedProperties];
            });
            if (shouldAutoSelect && fetchedProperties.length > 0 &&
                (!selectedPropertyId || !fetchedProperties.find(p => p.id === selectedPropertyId))) {
                setSelectedPropertyId(fetchedProperties[0].id);
            } else if (fetchedProperties.length === 0 && selectedGroupId === groupId) {
                setSelectedPropertyId(null);
            }
            return fetchedProperties;
        } catch (err) {
            console.error(`Failed to fetch properties for group ${groupId}:`, err);
            setError(`Failed to load properties.`);
            setProperties(prev => prev.filter(p => p.groupId !== groupId));
            return [];
        }
    }, [token, selectedPropertyId, selectedGroupId]);

    const fetchBookingsForProperty = useCallback(async (propertyId: string) => {
        if (!propertyId || !token) { setBookings(prev => prev.filter(b => b.propertyId !== propertyId)); return []; }
        console.log("Fetching bookings for property:", propertyId);
        try {
            const response = await apiClient.get(`/bookings/property/${propertyId}`);
            const fetchedBookings: Booking[] = (response.data || []).map((b: any) => ({
                id: b.id.toString(),
                createdAt: new Date(b.created_at),
                cratedBy: b.created_by,
                propertyId: b.property_id,
                startDate: new Date(b.start_date),
                endDate: new Date(b.end_date),
                guestName: b.guest_name,
            }));
            setBookings(prevBookings => {
                const otherPropBookings = prevBookings.filter(b => b.propertyId !== propertyId);
                return [...otherPropBookings, ...fetchedBookings];
            });
            return fetchedBookings;
        } catch (err) {
            console.error(`Failed to fetch bookings for property ${propertyId}:`, err);
            setError(`Failed to load bookings.`);
            setBookings(prev => prev.filter(b => b.propertyId !== propertyId));
            return [];
        }
    }, [token]);

    useEffect(() => {
        const loadInitialData = async () => {
            if (!userId || !token) {
                setIsLoadingData(false);
                setGroups([]); setProperties([]); setBookings([]);
                setSelectedGroupId(null); setSelectedPropertyId(null);
                return;
            }
            setIsLoadingData(true);
            setError(null);
            const fetchedGroups = await fetchGroups(true);
            setIsLoadingData(false);
        };
        loadInitialData();
    }, [userId, token, fetchGroups]);

    useEffect(() => {
        if (selectedGroupId) {
            setIsLoadingData(true);
            fetchPropertiesForGroup(selectedGroupId, true).finally(() => setIsLoadingData(false));
        } else {
            setProperties([]);
            setSelectedPropertyId(null);
        }
    }, [selectedGroupId, fetchPropertiesForGroup]);

    useEffect(() => {
        if (selectedPropertyId) {
            setIsLoadingData(true);
            fetchBookingsForProperty(selectedPropertyId).finally(() => setIsLoadingData(false));
        } else {
            setBookings([]);
        }
    }, [selectedPropertyId, fetchBookingsForProperty]);

    useEffect(() => {
        const subs = [
            appEmitter.on('openCreateGroupModal', () => setIsCreateGroupModalOpen(true)),
            appEmitter.on('openAddPropertyModal', () => {
                if (currentGroup) setIsAddPropertyModalOpen(true);
                else alert("Please select a group first to add a property.");
            }),
            appEmitter.on('openCreateGroupCodeModal', () => {
                if (currentGroup) setIsCreateGroupCodeModalOpen(true);
                else alert("Please select a group first to create an invite code.");
            }),
            appEmitter.on('openCreateBookingModalFromSidebar', () => {
                if (currentProperty) {
                    setBookingModalInitialDate(new Date());
                    setIsCreateBookingModalOpen(true);
                } else {
                    alert("Please select a property first to create a booking.");
                }
            })
        ];
        appEmitter.on('openJoinGroupModal', () => setIsJoinGroupModalOpen(true))
        return () => subs.forEach(unsub => unsub());
    }, [currentGroup, currentProperty]);


    const handleSelectSlot = useCallback(({ start }: { start: Date, end: Date }) => {
        if (!currentProperty) {
            alert("Please select a property to create a booking for.");
            return;
        }
        setBookingModalInitialDate(start);
        setIsCreateBookingModalOpen(true);
    }, [currentProperty]);

    const handleSelectEvent = useCallback((event: Booking) => {
        alert(`Starts: ${event.startDate.toLocaleString()}\nEnds: ${event.endDate.toLocaleString()}`);
        // TODO: Implement view/edit booking modal
    }, []);

    const handleGroupJoined = () => {
        setIsLoadingData(true);
        fetchGroups(true).finally(() => setIsLoadingData(false));
    };

    const refreshDataAfterAction = async () => {
        setIsLoadingData(true);
        await fetchGroups();
        if (selectedGroupId) await fetchPropertiesForGroup(selectedGroupId);
        if (selectedPropertyId) await fetchBookingsForProperty(selectedPropertyId);
        setIsLoadingData(false);
    };

    const refreshDataForCurrentSelections = async () => {
        setIsLoadingData(true);
        await fetchGroups();
        if (selectedGroupId) await fetchPropertiesForGroup(selectedGroupId);
        if (selectedPropertyId) await fetchBookingsForProperty(selectedPropertyId);
        setIsLoadingData(false);
    };

    if (isLoadingData && (!groups.length || (selectedGroupId && !properties.length) || (selectedPropertyId && !bookings.length))) {
        return <div className="flex items-center justify-center h-screen"><p className="text-xl text-gray-500">Loading your data...</p></div>;
    }

    return (
        <div className="flex flex-col h-[calc(100vh-theme(space.16))]">
            <CreateGroupModal isOpen={isCreateGroupModalOpen} onClose={() => setIsCreateGroupModalOpen(false)} onGroupCreated={refreshDataForCurrentSelections} />
            <AddPropertyModal isOpen={isAddPropertyModalOpen} onClose={() => setIsAddPropertyModalOpen(false)} currentSelectedGroup={currentGroup} onPropertyAdded={refreshDataForCurrentSelections} />
            <CreateGroupCodeModal isOpen={isCreateGroupCodeModalOpen} onClose={() => { setIsCreateGroupCodeModalOpen(false); }} groups={currentGroup ? [currentGroup] : []} onCodeCreated={handleGroupCodeCreated} />
            <CreateBookingModal isOpen={isCreateBookingModalOpen} onClose={() => setIsCreateBookingModalOpen(false)} property={currentProperty} initialDate={bookingModalInitialDate} onBookingCreated={refreshDataForCurrentSelections} />
            <DisplayGroupCodeModal
                isOpen={isDisplayGroupCodeModalOpen}
                onClose={() => {
                    setIsDisplayGroupCodeModalOpen(false);
                    setGeneratedGroupCode(null);
                    setGeneratedCodeForGroupName(null);
                }}
                code={generatedGroupCode}
                groupName={generatedCodeForGroupName}
            />
            <JoinGroupModal
                isOpen={isJoinGroupModalOpen}
                onClose={() => setIsJoinGroupModalOpen(false)}
                onGroupJoined={handleGroupJoined}
            />

            <header className="bg-white p-3 sm:p-4 border-b border-gray-200 sticky top-16 z-30 shadow-sm">
                <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto">
                        <select
                            id="group-select"
                            title="Select Group"
                            value={selectedGroupId || ""}
                            onChange={(e) => setSelectedGroupId(e.target.value || null)}
                            className="w-full sm:min-w-[180px] px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                            disabled={isLoadingData || groups.length === 0}
                        >
                            <option value="">{isLoadingData && !groups.length ? "Loading Groups..." : groups.length === 0 ? "No Groups Yet" : "-- Select Group --"}</option>
                            {groups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
                        </select>

                        <select
                            id="property-select"
                            title="Select Property"
                            value={selectedPropertyId || ""}
                            onChange={(e) => setSelectedPropertyId(e.target.value || null)}
                            className="w-full sm:min-w-[180px] px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                            disabled={isLoadingData || !selectedGroupId || currentGroupProperties.length === 0}
                        >
                            <option value="">
                                {!selectedGroupId ? "Select Group First" : isLoadingData && !currentGroupProperties.length ? "Loading Properties..." : currentGroupProperties.length === 0 ? "No Properties in Group" : "-- Select Property --"}
                            </option>
                            {currentGroupProperties.map(prop => <option key={prop.id} value={prop.id}>{prop.name}</option>)}
                        </select>
                    </div>

                    <div className="flex gap-2 mt-2 sm:mt-0 flex-shrink-0">
                        {currentProperty && <button onClick={() => { setBookingModalInitialDate(new Date()); setIsCreateBookingModalOpen(true); }}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm disabled:opacity-70 cursor-pointer">
                            New Booking
                        </button>}
                    </div>
                </div>
            </header >

            <div className="flex-grow p-2 sm:p-4 overflow-auto">
                {error && (
                    <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
                        <p className="font-bold">An error occurred:</p>
                        <p>{error}</p>
                        <button onClick={refreshDataForCurrentSelections} className="mt-1 text-xs text-red-700 hover:text-red-900 underline">Try again</button>
                    </div>
                )}

                {!selectedGroupId ? (
                    <div className="flex items-center justify-center h-full"><p className="text-gray-500">Please select a group to get started.</p></div>
                ) : !selectedPropertyId ? (
                    <div className="flex items-center justify-center h-full"><p className="text-gray-500">Please select a property to view its calendar.</p></div>
                ) : (
                    <div className="h-[calc(100%-1rem)]">
                        <Calendar
                            showMultiDayTimes
                            step={60}
                            defaultDate={defaultDate}
                            views={[Views.MONTH, Views.WEEK, Views.DAY]}
                            localizer={localizer}
                            events={calendarEvents}
                            startAccessor="startDate"
                            endAccessor="endDate"
                            style={{ height: '100%' }}
                            selectable
                            onSelectEvent={handleSelectEvent}
                            onSelectSlot={handleSelectSlot}
                            defaultView={Views.MONTH}
                            components={{ event: CustomEventComponent }}
                            className="rounded-lg shadow bg-white"
                            onView={setCurrentView}
                            view={currentView}
                            date={currentDate}
                            onNavigate={date => setCurrentDate(date)}
                        />
                    </div>
                )}
            </div>
        </div >
    );
};

const CustomEventComponent: React.FC<RBCEventProps<Booking>> = ({ event }) => (
    <div title={event.guestName} className="p-1 text-xs leading-tight">
        <strong className="block truncate">{event.guestName}</strong>
    </div>
);

export default HomePage;
