import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, EventProps as RBCEventProps, Views, View } from 'react-big-calendar';
import { Users, Building, PlusCircle } from 'lucide-react';
import { format } from 'date-fns/format';
import { parse } from 'date-fns/parse';
import { startOfWeek } from 'date-fns/startOfWeek';
import { getDay } from 'date-fns/getDay';
import { enUS } from 'date-fns/locale/en-US';

import apiClient from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { appEmitter } from '../utils/eventEmitter';

import CreateGroupModal from '../components/modals/CreateGroupModal';
import AddPropertyModal from '../components/modals/AddPropertyModal';
import CreateGroupCodeModal from '../components/modals/CreateGroupCodeModal';
import CreateBookingModal from '../components/modals/CreateBookingModal';
import DisplayGroupCodeModal from '../components/modals/DisplayGroupCodeModal';
import JoinGroupModal from '../components/modals/JoinGroupModal';
import ViewEditBookingModal from '../components/modals/ViewEditBookingModal';
import SelectPropertyModal from '../components/modals/SelectPropertyModal';
import EditPropertyModal from '../components/modals/EditPropertyModal';
import { Button, Select, Spinner, Alert } from '../components/ui';
import { ColorLegend } from '../components/ColorLegend';

import { Group, Property, Booking } from '../models';
import { generatePropertyColors, PropertyColor } from '../utils/colorGenerator';

const ALL_PROPERTIES_VALUE = '__ALL__';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const HomePage: React.FC = () => {
    const { userId, token } = useAuth();
    const { showToast } = useToast();

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
    const [isViewEditBookingModalOpen, setIsViewEditBookingModalOpen] = useState(false);
    const [selectedBookingForEdit, setSelectedBookingForEdit] = useState<Booking | null>(null);
    const [isSelectPropertyModalOpen, setIsSelectPropertyModalOpen] = useState(false);
    const [propertyForNewBooking, setPropertyForNewBooking] = useState<string | null>(null);
    const [isEditPropertyModalOpen, setIsEditPropertyModalOpen] = useState(false);
    const [propertyToEdit, setPropertyToEdit] = useState<Property | null>(null);

    const currentGroup = useMemo(() => groups.find(g => g.id === selectedGroupId) || null, [groups, selectedGroupId]);
    const currentGroupProperties = useMemo(() => {
        if (!selectedGroupId) return [];
        return properties.filter(p => p.groupId === selectedGroupId);
    }, [properties, selectedGroupId]);
    const currentProperty = useMemo(() => currentGroupProperties.find(p => p.id === selectedPropertyId) || null, [currentGroupProperties, selectedPropertyId]);

    // Generate colors for properties
    const propertyColors = useMemo(() => {
        return generatePropertyColors(currentGroupProperties);
    }, [currentGroupProperties]);

    const calendarEvents = useMemo(() => {
        if (!selectedPropertyId) return [];
        if (selectedPropertyId === ALL_PROPERTIES_VALUE) {
            // Show all bookings for all properties in the group
            return bookings.filter(b =>
                currentGroupProperties.some(p => p.id === b.propertyId)
            );
        }
        return bookings.filter(b => b.propertyId === selectedPropertyId);
    }, [bookings, selectedPropertyId, currentGroupProperties]);

    const isAllPropertiesView = selectedPropertyId === ALL_PROPERTIES_VALUE;

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
        try {
            const response = await apiClient.get(`/bookings/property/${propertyId}`);
            const fetchedBookings: Booking[] = (response.data || []).map((b: any) => ({
                id: b.id.toString(),
                createdAt: new Date(b.created_at),
                createdBy: b.created_by,
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

    const fetchBookingsForGroup = useCallback(async (groupId: string) => {
        if (!groupId || !token) { setBookings([]); return []; }
        try {
            const response = await apiClient.get(`/bookings/group/${groupId}`);
            const fetchedBookings: Booking[] = (response.data || []).map((b: any) => ({
                id: b.id.toString(),
                createdAt: new Date(b.created_at),
                createdBy: b.created_by,
                propertyId: b.property_id,
                startDate: new Date(b.start_date),
                endDate: new Date(b.end_date),
                guestName: b.guest_name,
            }));
            setBookings(fetchedBookings);
            return fetchedBookings;
        } catch (err) {
            console.error(`Failed to fetch bookings for group ${groupId}:`, err);
            setError(`Failed to load bookings.`);
            setBookings([]);
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
            fetchPropertiesForGroup(selectedGroupId, false).then((fetchedProperties) => {
                // Auto-select "All Properties" view only if no property is currently selected
                if (fetchedProperties.length > 0 && !selectedPropertyId) {
                    setSelectedPropertyId(ALL_PROPERTIES_VALUE);
                } else if (fetchedProperties.length === 0) {
                    setSelectedPropertyId(null);
                }
                setIsLoadingData(false);
            });
        } else {
            setProperties([]);
            setSelectedPropertyId(null);
        }
    }, [selectedGroupId, fetchPropertiesForGroup, selectedPropertyId]);

    useEffect(() => {
        if (!selectedPropertyId) {
            setBookings([]);
            return;
        }

        if (selectedPropertyId === ALL_PROPERTIES_VALUE && selectedGroupId) {
            // Fetch all bookings for the group
            setIsLoadingData(true);
            fetchBookingsForGroup(selectedGroupId).finally(() => setIsLoadingData(false));
        } else if (selectedPropertyId !== ALL_PROPERTIES_VALUE) {
            // Fetch bookings for specific property
            setIsLoadingData(true);
            fetchBookingsForProperty(selectedPropertyId).finally(() => setIsLoadingData(false));
        }
    }, [selectedPropertyId, selectedGroupId, fetchBookingsForProperty, fetchBookingsForGroup]);

    useEffect(() => {
        const subs = [
            appEmitter.on('openCreateGroupModal', () => setIsCreateGroupModalOpen(true)),
            appEmitter.on('openAddPropertyModal', () => {
                if (currentGroup) setIsAddPropertyModalOpen(true);
                else showToast('warning', 'Please select a group first to add a property.');
            }),
            appEmitter.on('openCreateGroupCodeModal', () => {
                if (currentGroup) setIsCreateGroupCodeModalOpen(true);
                else showToast('warning', 'Please select a group first to create an invite code.');
            }),
            appEmitter.on('openCreateBookingModalFromSidebar', () => {
                if (currentProperty) {
                    setBookingModalInitialDate(new Date());
                    setIsCreateBookingModalOpen(true);
                } else {
                    showToast('warning', 'Please select a property first to create a booking.');
                }
            }),
            appEmitter.on('openJoinGroupModal', () => setIsJoinGroupModalOpen(true))
        ];
        return () => subs.forEach(unsub => unsub());
    }, [currentGroup, currentProperty, showToast]);


    const handleSelectSlot = useCallback(({ start }: { start: Date, end: Date }) => {
        if (isAllPropertiesView) {
            setBookingModalInitialDate(start);
            setIsSelectPropertyModalOpen(true);
            return;
        }
        if (!currentProperty) {
            showToast('warning', 'Please select a property to create a booking for.');
            return;
        }
        setBookingModalInitialDate(start);
        setIsCreateBookingModalOpen(true);
    }, [currentProperty, showToast, isAllPropertiesView]);

    const handlePropertySelectedForBooking = useCallback((propertyId: string) => {
        setPropertyForNewBooking(propertyId);
        setIsSelectPropertyModalOpen(false);
        setIsCreateBookingModalOpen(true);
    }, []);

    const handleSelectEvent = useCallback((event: Booking) => {
        setSelectedBookingForEdit(event);
        setIsViewEditBookingModalOpen(true);
    }, []);

    const handleEditPropertyColor = useCallback((propertyId: string) => {
        const property = currentGroupProperties.find(p => p.id === propertyId);
        if (property) {
            setPropertyToEdit(property);
            setIsEditPropertyModalOpen(true);
        }
    }, [currentGroupProperties]);

    const handleGroupJoined = () => {
        setIsLoadingData(true);
        fetchGroups(true).finally(() => setIsLoadingData(false));
    };

    const refreshDataAfterAction = async () => {
        setIsLoadingData(true);
        await fetchGroups();
        if (selectedGroupId) await fetchPropertiesForGroup(selectedGroupId);
        if (selectedPropertyId === ALL_PROPERTIES_VALUE && selectedGroupId) {
            await fetchBookingsForGroup(selectedGroupId);
        } else if (selectedPropertyId) {
            await fetchBookingsForProperty(selectedPropertyId);
        }
        setIsLoadingData(false);
    };

    const handleBookingDeleted = () => {
        if (selectedPropertyId === ALL_PROPERTIES_VALUE && selectedGroupId) {
            setIsLoadingData(true);
            fetchBookingsForGroup(selectedGroupId).finally(() => setIsLoadingData(false));
        } else if (selectedPropertyId) {
            setIsLoadingData(true);
            fetchBookingsForProperty(selectedPropertyId).finally(() => setIsLoadingData(false));
        }
        setSelectedBookingForEdit(null);
    };

    const handleBookingUpdated = () => {
        if (selectedPropertyId === ALL_PROPERTIES_VALUE && selectedGroupId) {
            setIsLoadingData(true);
            fetchBookingsForGroup(selectedGroupId).finally(() => setIsLoadingData(false));
        } else if (selectedPropertyId) {
            setIsLoadingData(true);
            fetchBookingsForProperty(selectedPropertyId).finally(() => setIsLoadingData(false));
        }
    };

    const refreshDataForCurrentSelections = async () => {
        setIsLoadingData(true);
        await fetchGroups();
        if (selectedGroupId) await fetchPropertiesForGroup(selectedGroupId);
        if (selectedPropertyId === ALL_PROPERTIES_VALUE && selectedGroupId) {
            await fetchBookingsForGroup(selectedGroupId);
        } else if (selectedPropertyId) {
            await fetchBookingsForProperty(selectedPropertyId);
        }
        setIsLoadingData(false);
    };

    const CustomEventComponent: React.FC<RBCEventProps<Booking>> = useCallback(({ event }) => {
        const property = properties.find(p => p.id === event.propertyId);
        const propertyColor = propertyColors.get(event.propertyId);

        return (
            <div
                title={`${event.guestName}${property ? ` - ${property.name}` : ''}`}
                className="p-1 text-xs leading-tight overflow-hidden"
                style={{
                    backgroundColor: propertyColor ? propertyColor.backgroundColor : undefined,
                    color: propertyColor ? propertyColor.textColor : undefined,
                    border: propertyColor ? `2px solid ${propertyColor.backgroundColor}` : undefined,
                    borderRadius: '4px',
                }}
            >
                <strong className="block truncate">{event.guestName}</strong>
            </div>
        );
    }, [properties, propertyColors]);

    if (isLoadingData && (!groups.length || (selectedGroupId && !properties.length) || (selectedPropertyId && !bookings.length))) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <Spinner size="lg" />
                <p className="text-gray-600">Loading your data...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-theme(space.16))]">
            <CreateGroupModal isOpen={isCreateGroupModalOpen} onClose={() => setIsCreateGroupModalOpen(false)} onGroupCreated={refreshDataForCurrentSelections} />
            <AddPropertyModal isOpen={isAddPropertyModalOpen} onClose={() => setIsAddPropertyModalOpen(false)} currentSelectedGroup={currentGroup} onPropertyAdded={refreshDataForCurrentSelections} />
            <CreateGroupCodeModal isOpen={isCreateGroupCodeModalOpen} onClose={() => { setIsCreateGroupCodeModalOpen(false); }} groups={currentGroup ? [currentGroup] : []} onCodeCreated={handleGroupCodeCreated} />
            <SelectPropertyModal
                isOpen={isSelectPropertyModalOpen}
                onClose={() => {
                    setIsSelectPropertyModalOpen(false);
                }}
                properties={currentGroupProperties}
                onPropertySelected={handlePropertySelectedForBooking}
            />
            <CreateBookingModal
                isOpen={isCreateBookingModalOpen}
                onClose={() => {
                    setIsCreateBookingModalOpen(false);
                    setPropertyForNewBooking(null);
                }}
                property={propertyForNewBooking ? currentGroupProperties.find(p => p.id === propertyForNewBooking) || currentProperty : currentProperty}
                initialDate={bookingModalInitialDate}
                onBookingCreated={refreshDataForCurrentSelections}
            />
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
            <ViewEditBookingModal
                isOpen={isViewEditBookingModalOpen}
                onClose={() => {
                    setIsViewEditBookingModalOpen(false);
                    setSelectedBookingForEdit(null);
                }}
                booking={selectedBookingForEdit}
                property={currentProperty}
                onBookingUpdated={handleBookingUpdated}
                onBookingDeleted={handleBookingDeleted}
            />
            <EditPropertyModal
                isOpen={isEditPropertyModalOpen}
                onClose={() => {
                    setIsEditPropertyModalOpen(false);
                    setPropertyToEdit(null);
                }}
                property={propertyToEdit}
                onPropertyUpdated={refreshDataForCurrentSelections}
            />

            <header className="bg-white border-b border-gray-200 sticky top-16 z-30 shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Filters Section */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                            <div className="w-full sm:w-64">
                                <Select
                                    value={selectedGroupId || ""}
                                    onChange={(e) => setSelectedGroupId(e.target.value || null)}
                                    options={[
                                        {
                                            value: "",
                                            label: isLoadingData && !groups.length
                                                ? "Loading Groups..."
                                                : groups.length === 0
                                                    ? "No Groups Yet"
                                                    : "-- Select Group --"
                                        },
                                        ...groups.map(group => ({ value: group.id, label: group.name }))
                                    ]}
                                    disabled={isLoadingData || groups.length === 0}
                                    icon={<Users size={18} />}
                                />
                            </div>

                            <div className="w-full sm:w-64">
                                <Select
                                    value={selectedPropertyId || ""}
                                    onChange={(e) => setSelectedPropertyId(e.target.value || null)}
                                    options={[
                                        {
                                            value: "",
                                            label: !selectedGroupId
                                                ? "Select Group First"
                                                : isLoadingData && !currentGroupProperties.length
                                                    ? "Loading Properties..."
                                                    : currentGroupProperties.length === 0
                                                        ? "No Properties in Group"
                                                        : "-- Select Property --"
                                        },
                                        ...(currentGroupProperties.length > 0 ? [{
                                            value: ALL_PROPERTIES_VALUE,
                                            label: "📅 All Properties"
                                        }] : []),
                                        ...currentGroupProperties.map(prop => ({ value: prop.id, label: prop.name }))
                                    ]}
                                    disabled={isLoadingData || !selectedGroupId || currentGroupProperties.length === 0}
                                    icon={<Building size={18} />}
                                />
                            </div>
                        </div>

                        {/* Actions Section */}
                        <div className="flex items-center gap-2">
                            {(currentProperty || isAllPropertiesView) && (
                                <Button
                                    onClick={() => {
                                        setBookingModalInitialDate(new Date());
                                        if (isAllPropertiesView) {
                                            setIsSelectPropertyModalOpen(true);
                                        } else {
                                            setIsCreateBookingModalOpen(true);
                                        }
                                    }}
                                    icon={<PlusCircle size={18} />}
                                    size="md"
                                >
                                    New Booking
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-grow p-2 sm:p-4 overflow-auto">
                {error && (
                    <div className="mb-4">
                        <Alert
                            variant="error"
                            title="An error occurred"
                            message={
                                <div className="flex items-center justify-between">
                                    <span>{error}</span>
                                    <button
                                        onClick={refreshDataForCurrentSelections}
                                        style={{ color: '#b91c1c' }}
                                        className="ml-4 text-sm font-medium underline cursor-pointer"
                                        onMouseEnter={(e) => { e.currentTarget.style.color = '#7f1d1d'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.color = '#b91c1c'; }}
                                    >
                                        Try again
                                    </button>
                                </div>
                            }
                            onDismiss={() => setError(null)}
                        />
                    </div>
                )}

                {!selectedGroupId ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center max-w-md px-4">
                            <div className="mb-6">
                                <div
                                    className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
                                    style={{ backgroundColor: '#e0e7ff' }}
                                >
                                    <Users size={40} style={{ color: '#4f46e5' }} />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Group Selected</h3>
                                <p className="text-gray-600 mb-6">
                                    {groups.length === 0
                                        ? "Create your first group to start managing properties and bookings."
                                        : "Please select a group from the dropdown above to get started."}
                                </p>
                            </div>
                            {groups.length === 0 && (
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <Button
                                        onClick={() => setIsCreateGroupModalOpen(true)}
                                        icon={<Users size={18} />}
                                        variant="primary"
                                    >
                                        Create Group
                                    </Button>
                                    <Button
                                        onClick={() => setIsJoinGroupModalOpen(true)}
                                        icon={<PlusCircle size={18} />}
                                        variant="secondary"
                                    >
                                        Join Group
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : !selectedPropertyId ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center max-w-md px-4">
                            <div className="mb-6">
                                <div
                                    className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
                                    style={{ backgroundColor: '#e0e7ff' }}
                                >
                                    <Building size={40} style={{ color: '#4f46e5' }} />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Property Selected</h3>
                                <p className="text-gray-600 mb-6">
                                    {currentGroupProperties.length === 0
                                        ? "Add your first property to this group to start tracking bookings."
                                        : "Please select a property from the dropdown above to view its calendar."}
                                </p>
                            </div>
                            {currentGroupProperties.length === 0 && currentGroup && (
                                <Button
                                    onClick={() => setIsAddPropertyModalOpen(true)}
                                    icon={<Building size={18} />}
                                    variant="primary"
                                >
                                    Add Property
                                </Button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col h-[calc(100%-1rem)] gap-4">
                        {isAllPropertiesView && propertyColors.size > 0 && (
                            <ColorLegend
                                propertyColors={propertyColors}
                                onEditColor={handleEditPropertyColor}
                            />
                        )}
                        <div className="flex-1 min-h-0">
                            <Calendar
                                showAllEvents
                                step={60}
                                defaultDate={defaultDate}
                                views={[Views.MONTH, Views.WEEK, Views.DAY]}
                                localizer={localizer}
                                events={calendarEvents}
                                startAccessor="startDate"
                                endAccessor="endDate"
                                dayLayoutAlgorithm="no-overlap"
                                style={{ height: '100%', minHeight: '600px' }}
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
                    </div>
                )}
            </div>
        </div >
    );
};

export default HomePage;
