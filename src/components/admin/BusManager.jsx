import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ApiService from '../../services/api.service';
import API_CONFIG from '../../config/api';
import { useNavigate } from 'react-router-dom';
import { DataTable } from './DataTable';

export function BusManager() {
    const navigate = useNavigate();
    const today = new Date().toISOString().split("T")[0];

    const [busName, setBusName] = useState("");
    const [busRoute, setBusRoute] = useState("");
    const [busDate, setBusDate] = useState("");
    const [allRoutes, setAllRoutes] = useState([]);
    const [basePrice, setBasePrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [busTime, setBusTime] = useState("");
    const [isCreatingBus, setIsCreatingBus] = useState(false);

    const [seatNumber, setSeatNumber] = useState("");
    const [seatBusId, setSeatBusId] = useState("");
    const [isCreatingSeat, setIsCreatingSeat] = useState(false);
    const [allBuses, setAllBuses] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);

    useEffect(() => {
        getAllRoutes();
        getAllBuses();
    }, []);

    async function getAllRoutes() {
        const allroutesRes = await ApiService.get(API_CONFIG.ENDPOINTS.GET_ROUTES);
        if (allroutesRes.ok) {
            const allRoutesLoad = await allroutesRes.json();
            setAllRoutes(allRoutesLoad);
        }
    }

    async function getAllBuses() {
        const allBusesRes = await ApiService.get(API_CONFIG.ENDPOINTS.GET_ALL_BUSES);
        if (allBusesRes.ok) {
            const allBusesLoad = await allBusesRes.json();
            setAllBuses(allBusesLoad);
        }
    }

    async function createNewBus() {
        if (!busName || !busRoute || !busDate || !maxPrice || !basePrice || !busTime) {
            toast.error("All fields are required!");
            return;
        }
        setIsCreatingBus(true);
        try {
            const payload = {
                busName,
                busType: "Deluxe",
                departureDateTime: `${busDate}T${busTime}`,
                date: busDate,
                maxPrice,
                basePrice,
            };

            const busRouteRes = await ApiService.post(`${API_CONFIG.ENDPOINTS.CREATE_BUS}/${busRoute}`, payload);

            if (busRouteRes && busRouteRes.ok) {
                toast.success("New Bus created!");
                setBusName("");
                setBusRoute("");
                setBusDate("");
                setMaxPrice("");
                setBasePrice("");
                setBusTime("");
                setShowCreateForm(false);
                getAllBuses();
            } else {
                if (busRouteRes && busRouteRes.status === 401) {
                    toast.error("Session timeout. Login again!");
                    navigate("/admin/login");
                } else {
                    const err = busRouteRes ? await busRouteRes.json().catch(() => ({})) : {};
                    toast.error(err.message || "Error while creating new bus. Please Retry!");
                }
            }
        } catch (error) {
            console.error("Error creating bus:", error);
            toast.error("Failed to create bus");
        } finally {
            setIsCreatingBus(false);
        }
    }

    async function createNewSeat() {
        if (!seatNumber || !seatBusId) {
            toast.error("Seat Number and Bus ID are required!");
            return;
        }

        const seatNumTrim = String(seatNumber).trim();
        const targetBus = allBuses.find((b) => String(b.id) === String(seatBusId));
        if (targetBus) {
            const existingSeats = Array.isArray(targetBus.seats) ? targetBus.seats : [];
            const duplicate = existingSeats.some((s) => String(s.seatNumber).toLowerCase() === seatNumTrim.toLowerCase());
            if (duplicate) {
                toast.error("A seat with this number already exists for the selected bus.");
                return;
            }
        }

        try {
            setIsCreatingSeat(true);
            const seatRes = await ApiService.post(`${API_CONFIG.ENDPOINTS.CREATE_SEAT}/${seatBusId}`, {
                seatNumber: seatNumTrim,
                reserved: false,
            });

            if (seatRes && seatRes.ok) {
                toast.success("New Seat added!");
                setSeatNumber("");
                setSeatBusId("");
                getAllBuses();
            } else {
                if (seatRes && seatRes.status === 401) {
                    toast.error("Session timeout. Login again!");
                    navigate("/admin/login");
                } else {
                    const err = seatRes ? await seatRes.json().catch(() => ({})) : {};
                    toast.error(err.message || "Error while creating new seat. Please Retry!");
                }
            }
        } catch (error) {
            console.error("Error creating seat:", error);
            toast.error("Failed to create seat");
        } finally {
            setIsCreatingSeat(false);
        }
    }

    const busColumns = [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'busName', label: 'Bus Name', sortable: true },
        {
            key: 'route',
            label: 'Route',
            sortable: false,
            render: (_, bus) => bus.route12 ? `${bus.route12.sourceBusStop?.name} → ${bus.route12.destinationBusStop?.name}` : 'N/A'
        },
        {
            key: 'date',
            label: 'Date',
            sortable: true,
            render: (date) => new Date(date).toLocaleDateString()
        },
        {
            key: 'departureDateTime',
            label: 'Departure Time',
            sortable: true,
            render: (dt) => dt ? new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'
        },
        {
            key: 'seats',
            label: 'Seats',
            sortable: false,
            render: (seats) => (
                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                    {Array.isArray(seats) ? seats.length : 0} seats
                </span>
            )
        },
        {
            key: 'basePrice',
            label: 'Base Price',
            sortable: true,
            render: (price) => `Rs. ${price}`
        },
        {
            key: 'maxPrice',
            label: 'Max Price',
            sortable: true,
            render: (price) => `Rs. ${price}`
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Bus Management
                    </h2>
                    <p className="text-gray-600 mt-1">Manage your fleet of buses and seats</p>
                </div>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {showCreateForm ? 'Hide Form' : 'Create New Bus'}
                </button>
            </div>

            {/* Create Forms */}
            {showCreateForm && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Create New Bus */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                            </div>
                            Create New Bus
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">Add a scheduled bus for a selected route</p>

                        {allRoutes.length > 0 ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Bus Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Deluxe Express"
                                        value={busName}
                                        onChange={(e) => setBusName(e.target.value)}
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Route</label>
                                    <select
                                        value={busRoute}
                                        onChange={(e) => setBusRoute(e.target.value)}
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">Select Route</option>
                                        {allRoutes.map((route) => (
                                            <option key={route.id} value={route.id}>
                                                {route.sourceBusStop.name} - {route.destinationBusStop.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                                        <input
                                            type="date"
                                            value={busDate}
                                            onChange={(e) => setBusDate(e.target.value)}
                                            min={today}
                                            className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Time</label>
                                        <input
                                            type="time"
                                            value={busTime}
                                            onChange={(e) => setBusTime(e.target.value)}
                                            className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Base Price (Rs)</label>
                                        <input
                                            type="number"
                                            placeholder="e.g. 1000"
                                            value={basePrice}
                                            onChange={(e) => setBasePrice(e.target.value)}
                                            className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Max Price (Rs)</label>
                                        <input
                                            type="number"
                                            placeholder="e.g. 1500"
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                            className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={createNewBus}
                                    disabled={isCreatingBus}
                                    className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl ${isCreatingBus ? 'opacity-80 cursor-not-allowed' : ''}`}
                                >
                                    {isCreatingBus ? 'Creating Bus...' : 'Create Bus'}
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <p className="text-gray-500">No routes available. Create a route first.</p>
                            </div>
                        )}
                    </div>

                    {/* Create New Seat */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            Add Seats to Bus
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">Add individual seats to a bus</p>

                        {allBuses.length > 0 ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Select Bus</label>
                                    <select
                                        value={seatBusId}
                                        onChange={(e) => setSeatBusId(e.target.value)}
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">Select Bus</option>
                                        {allBuses.map((bus) => (
                                            <option key={bus.id} value={bus.id}>
                                                {bus.busName} ({bus.date})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Seat Number</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. A1, B2"
                                        value={seatNumber}
                                        onChange={(e) => setSeatNumber(e.target.value)}
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <button
                                    onClick={createNewSeat}
                                    disabled={isCreatingSeat}
                                    className={`w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl ${isCreatingSeat ? 'opacity-80 cursor-not-allowed' : ''}`}
                                >
                                    {isCreatingSeat ? 'Adding Seat...' : 'Add Seat'}
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <p className="text-gray-500">No buses available. Create a bus first.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Bus List */}
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">All Buses</h3>
                <DataTable
                    columns={busColumns}
                    data={allBuses}
                    itemsPerPage={10}
                    searchable={true}
                    exportable={true}
                />
            </div>
        </div>
    );
}
