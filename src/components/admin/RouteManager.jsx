import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ApiService from '../../services/api.service';
import API_CONFIG from '../../config/api';
import { useNavigate } from 'react-router-dom';

export function RouteManager() {
    const navigate = useNavigate();
    const [busStop, setBusStop] = useState("");
    const [busStops, setBusStops] = useState([]);
    const [isCreatingStop, setIsCreatingStop] = useState(false);
    const [routeCityOne, setRouteCityOne] = useState("");
    const [routeCityTwo, setRouteCityTwo] = useState("");
    const [isCreatingRoute, setIsCreatingRoute] = useState(false);

    useEffect(() => {
        getBusStops();
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

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Route Management</h2>

            {/* Create New Bus Stop */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Create New Bus Stop</h3>
                <p className="text-sm text-gray-500 mb-4">Add a new city or stop where buses will operate.</p>
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Name of Bus Stop (e.g., Kathmandu)"
                        value={busStop}
                        onChange={(e) => setBusStop(e.target.value)}
                        className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                    <button
                        onClick={createBusStop}
                        disabled={isCreatingStop}
                        className={`bg-indigo-600 text-white px-6 py-2 rounded-lg transition-colors font-medium ${isCreatingStop ? 'opacity-80 cursor-not-allowed' : 'hover:bg-indigo-700'}`}
                    >
                        {isCreatingStop ? 'Creating...' : 'Create Stop'}
                    </button>
                </div>
            </div>

            {/* Create New Route */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Create New Route</h3>
                <p className="text-sm text-gray-500 mb-4">Connect two bus stops to form a route.</p>

                {busStops.length > 0 ? (
                    <div className="flex gap-4 items-center">
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Source</label>
                            <select
                                value={routeCityOne}
                                onChange={(e) => setRouteCityOne(e.target.value)}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Select Source</option>
                                {busStops.map((city) => (
                                    <option key={city.id} value={city.name}>
                                        {city.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center justify-center pt-6">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </div>

                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Destination</label>
                            <select
                                value={routeCityTwo}
                                onChange={(e) => setRouteCityTwo(e.target.value)}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Select Destination</option>
                                {busStops.map((city) => (
                                    <option key={city.id} value={city.name}>
                                        {city.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="pt-6">
                            <button
                                onClick={createRoute}
                                disabled={isCreatingRoute}
                                className={`bg-indigo-600 text-white px-6 py-3 rounded-lg transition-colors font-medium ${isCreatingRoute ? 'opacity-80 cursor-not-allowed' : 'hover:bg-indigo-700'}`}
                            >
                                {isCreatingRoute ? 'Creating...' : 'Create Route'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-500">No bus stops available. Create a bus stop first.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
