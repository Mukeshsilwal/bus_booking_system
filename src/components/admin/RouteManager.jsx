import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ApiService from '../../services/api.service';
import API_CONFIG from '../../config/api';
import { useNavigate } from 'react-router-dom';
import { DataTable } from './DataTable';

export function RouteManager() {
    const navigate = useNavigate();
    const [busStop, setBusStop] = useState("");
    const [busStops, setBusStops] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [isCreatingStop, setIsCreatingStop] = useState(false);
    const [routeCityOne, setRouteCityOne] = useState("");
    const [routeCityTwo, setRouteCityTwo] = useState("");
    const [isCreatingRoute, setIsCreatingRoute] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);

    useEffect(() => {
        getBusStops();
        getRoutes();
    }, []);

    async function getBusStops() {
        try {
            const busStopRes = await ApiService.get(API_CONFIG.ENDPOINTS.GET_BUS_STOPS);
            if (busStopRes.ok) {
                const busStopsData = await busStopRes.json();
                setBusStops(busStopsData);
            }
        } catch (error) {
            console.error("Error fetching bus stops:", error);
        }
    }

    async function getRoutes() {
        try {
            const routesRes = await ApiService.get(API_CONFIG.ENDPOINTS.GET_ROUTES);
            if (routesRes.ok) {
                const routesData = await routesRes.json();
                setRoutes(routesData);
            }
        } catch (error) {
            console.error("Error fetching routes:", error);
        }
    }

    async function createBusStop() {
        if (!busStop) {
            toast.error("Bus Stop name cannot be empty!");
            return;
        }
        setIsCreatingStop(true);
        try {
            const res = await ApiService.post(API_CONFIG.ENDPOINTS.CREATE_BUS_STOP, {
                name: busStop,
            });

            if (res && res.ok) {
                toast.success("Bus Stop created!");
                setBusStop("");
                getBusStops();
            } else {
                if (res && res.status === 401) {
                    toast.error("Session timeout. Login again!");
                    navigate("/admin/login");
                } else {
                    const err = res ? await res.json().catch(() => ({})) : {};
                    toast.error(err.message || "Error while creating Bus Stop. Please Retry!");
                }
            }
        } catch (error) {
            console.error("Error creating bus stop:", error);
            toast.error("Failed to create bus stop");
        } finally {
            setIsCreatingStop(false);
        }
    }

    async function createRoute() {
        if (!routeCityOne || !routeCityTwo) {
            toast.error("Fill both the routes!");
            return;
        }
        setIsCreatingRoute(true);
        try {
            const source = busStops.find((city) => city.name === routeCityOne);
            const dest = busStops.find((city) => city.name === routeCityTwo);
            if (!source || !dest) throw new Error("Selected cities are invalid");

            const res = await ApiService.post(
                `${API_CONFIG.ENDPOINTS.CREATE_ROUTE}/${source.id}/${dest.id}`,
                {}
            );

            if (res && res.ok) {
                toast.success("New Route created!");
                setRouteCityOne("");
                setRouteCityTwo("");
                getRoutes();
            } else {
                if (res && res.status === 401) {
                    toast.error("Session timeout. Login again!");
                    navigate("/admin/login");
                } else {
                    const err = res ? await res.json().catch(() => ({})) : {};
                    toast.error(err.message || "Error while creating new route. Please Retry!");
                }
            }
        } catch (error) {
            console.error("Error creating route:", error);
            toast.error(error.message || "Failed to create route");
        } finally {
            setIsCreatingRoute(false);
        }
    }

    const busStopColumns = [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'name', label: 'Bus Stop Name', sortable: true },
        {
            key: 'routes',
            label: 'Routes',
            sortable: false,
            render: (_, stop) => {
                const stopRoutes = routes.filter(r =>
                    r.sourceBusStop?.id === stop.id || r.destinationBusStop?.id === stop.id
                );
                return (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                        {stopRoutes.length} routes
                    </span>
                );
            }
        }
    ];

    const routeColumns = [
        { key: 'id', label: 'ID', sortable: true },
        {
            key: 'source',
            label: 'Source',
            sortable: false,
            render: (_, route) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <span className="font-medium">{route.sourceBusStop?.name || 'N/A'}</span>
                </div>
            )
        },
        {
            key: 'destination',
            label: 'Destination',
            sortable: false,
            render: (_, route) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <span className="font-medium">{route.destinationBusStop?.name || 'N/A'}</span>
                </div>
            )
        },
        {
            key: 'visual',
            label: 'Route Visual',
            sortable: false,
            render: (_, route) => (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">{route.sourceBusStop?.name}</span>
                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <span className="font-medium">{route.destinationBusStop?.name}</span>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Route Management
                    </h2>
                    <p className="text-gray-600 mt-1">Manage bus stops and routes</p>
                </div>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {showCreateForm ? 'Hide Forms' : 'Create New'}
                </button>
            </div>

            {/* Create Forms */}
            {showCreateForm && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Create New Bus Stop */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            Create New Bus Stop
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">Add a new city or stop where buses will operate</p>
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Name of Bus Stop (e.g., Kathmandu)"
                                value={busStop}
                                onChange={(e) => setBusStop(e.target.value)}
                                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <button
                                onClick={createBusStop}
                                disabled={isCreatingStop}
                                className={`w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl ${isCreatingStop ? 'opacity-80 cursor-not-allowed' : ''}`}
                            >
                                {isCreatingStop ? 'Creating...' : 'Create Stop'}
                            </button>
                        </div>
                    </div>

                    {/* Create New Route */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                            </div>
                            Create New Route
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">Connect two bus stops to form a route</p>

                        {busStops.length > 0 ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Source</label>
                                    <select
                                        value={routeCityOne}
                                        onChange={(e) => setRouteCityOne(e.target.value)}
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">Select Source</option>
                                        {busStops.map((city) => (
                                            <option key={city.id} value={city.name}>
                                                {city.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center justify-center">
                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                    </svg>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Destination</label>
                                    <select
                                        value={routeCityTwo}
                                        onChange={(e) => setRouteCityTwo(e.target.value)}
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">Select Destination</option>
                                        {busStops.map((city) => (
                                            <option key={city.id} value={city.name}>
                                                {city.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    onClick={createRoute}
                                    disabled={isCreatingRoute}
                                    className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl ${isCreatingRoute ? 'opacity-80 cursor-not-allowed' : ''}`}
                                >
                                    {isCreatingRoute ? 'Creating...' : 'Create Route'}
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <p className="text-gray-500">No bus stops available. Create a bus stop first.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Bus Stops Table */}
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">All Bus Stops</h3>
                <DataTable
                    columns={busStopColumns}
                    data={busStops}
                    itemsPerPage={10}
                    searchable={true}
                    exportable={true}
                />
            </div>

            {/* Routes Table */}
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">All Routes</h3>
                <DataTable
                    columns={routeColumns}
                    data={routes}
                    itemsPerPage={10}
                    searchable={true}
                    exportable={true}
                />
            </div>
        </div>
    );
}
