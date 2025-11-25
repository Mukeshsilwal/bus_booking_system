import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ApiService from "../services/api.service";
import API_CONFIG from "../config/api";

export default function AdminPanel() {
  const today = new Date().toISOString().split("T")[0];
  const navigate = useNavigate(); 

  const [busStop, setBusStop] = useState("");
  const [busStops, setBusStops] = useState([]);
  const [isCreatingStop, setIsCreatingStop] = useState(false);
  const [routeCityOne, setRouteCityOne] = useState("");
  const [routeCityTwo, setRouteCityTwo] = useState("");
  const [isCreatingRoute, setIsCreatingRoute] = useState(false);
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
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch data on component mount
  useEffect(() => {
    getBusStops();
    getAllRoutes();
    getAllBuses();
    // Uncomment for authentication check
     if (!localStorage.getItem("token")) {
       navigate("/admin/login");
   }
  }, []);

  const stats = [
    { label: "Total Routes", value: allRoutes.length, color: "bg-blue-500" },
    { label: "Active Buses", value: allBuses.length, color: "bg-green-500" },
    { label: "Bus Stops", value: busStops.length, color: "bg-purple-500" },
    { label: "Total Seats", value: allBuses.reduce((acc, bus) => acc + (bus.seats?.length || 0), 0), color: "bg-orange-500" }
  ];

  async function getBusStops() {
    try {
      const busStopRes = await ApiService.get(API_CONFIG.ENDPOINTS.GET_BUS_STOPS);
      if (busStopRes.ok) {
        const busStops = await busStopRes.json();
        setBusStops(busStops);
      }
    } catch (error) {
      console.error("Error fetching bus stops:", error);
    }
  }

  async function getAllRoutes() {
    try {
       const allroutesRes = await ApiService.get(API_CONFIG.ENDPOINTS.GET_ROUTES);
      if (allroutesRes.ok) {
        const allRoutesLoad = await allroutesRes.json();
        setAllRoutes(allRoutesLoad);
      }
    } catch (error) {
      console.error("Error fetching routes:", error);
    }
  }

  async function getAllBuses() {
    try {
      const allBusesRes = await ApiService.get(API_CONFIG.ENDPOINTS.GET_ALL_BUSES);
      if (allBusesRes.ok) {
        const allBusesLoad = await allBusesRes.json();
        setAllBuses(allBusesLoad);
      }
    } catch (error) {
      console.error("Error fetching buses:", error);
    }
  }

  async function createBusStop() {
    if (!busStop) {
       toast.error("Bus Stop name cannot be empty!");
      return;
    }
    setIsCreatingStop(true);
    try {
     const res = await ApiService.post(API_CONFIG.ENDPOINTS.CREATE_BUS_STOP, { name: busStop });

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
          alert(err.message || "Error while creating Bus Stop. Please Retry!");
        }
      }
    } catch (error) {
      console.error("Error creating bus stop:", error);
      alert("Failed to create bus stop");
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

      const res = await ApiService.post(`${API_CONFIG.ENDPOINTS.CREATE_ROUTE}/${source.id}/${dest.id}`, {});

      if (res && res.ok) {
        toast.success("New Route created!");
        setRouteCityOne("");
        setRouteCityTwo("");
        getAllRoutes();
      } else {
        if (res && res.status === 401) {
          toast.error("Session timeout. Login again!");
          navigate("/admin/login");
        } else {
          const err = res ? await res.json().catch(() => ({})) : {};
          alert(err.message || "Error while creating new route. Please Retry!");
        }
      }
    } catch (error) {
      console.error("Error creating route:", error);
      alert(error.message || "Failed to create route");
    } finally {
      setIsCreatingRoute(false);
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
        getAllBuses();
      } else {
        if (busRouteRes && busRouteRes.status === 401) {
          toast.error("Session timeout. Login again!");
          navigate("/admin/login");
        } else {
          const err = busRouteRes ? await busRouteRes.json().catch(() => ({})) : {};
          alert(err.message || "Error while creating new bus. Please Retry!");
        }
      }
    } catch (error) {
      console.error("Error creating bus:", error);
      alert("Failed to create bus");
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
        alert("A seat with this number already exists for the selected bus.");
        return;
      }
    }

    try {
      setIsCreatingSeat(true);
      const seatRes = await ApiService.post(`${API_CONFIG.ENDPOINTS.CREATE_SEAT}/${seatBusId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seatNumber: seatNumTrim,
          reserved: false,
        })
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
          alert(err.message || "Error while creating new seat. Please Retry!");
        }
      }
    } catch (error) {
      console.error("Error creating seat:", error);
      alert("Failed to create seat");
    } finally {
      setIsCreatingSeat(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <span className="text-white text-xl font-bold">🚌</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Bus Ticketing Management System</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              <span className="text-sm font-medium">⚙️ Settings</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <span className="text-white text-2xl font-bold">{stat.value}</span>
                </div>
                <span className="text-green-500 text-sm">↑</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex overflow-x-auto">
            {[
              { id: "overview", label: "Overview", icon: "📊" },
              { id: "stops", label: "Bus Stops", icon: "📍" },
              { id: "routes", label: "Routes", icon: "🛣️" },
              { id: "buses", label: "Buses", icon: "🚌" },
              { id: "seats", label: "Seats", icon: "💺" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Welcome to Admin Dashboard</h2>
              <p className="text-gray-600 mb-4">Manage your bus ticketing system efficiently. Use the tabs above to navigate between different sections.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h3 className="font-semibold text-blue-900 mb-2">Quick Actions</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Create new bus stops and routes</li>
                    <li>• Schedule buses for routes</li>
                    <li>• Manage seat availability</li>
                  </ul>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <h3 className="font-semibold text-green-900 mb-2">System Status</h3>
                  <p className="text-sm text-green-700">All systems operational</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "stops" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">📍</span>
              <h2 className="text-xl font-semibold text-gray-900">Create New Bus Stop</h2>
            </div>
            <p className="text-gray-600 mb-6">Add a new city or stop where buses will operate</p>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Name of Bus Stop (e.g., Kathmandu)"
                value={busStop}
                onChange={(e) => setBusStop(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={createBusStop}
                disabled={isCreatingStop}
                className={`px-8 py-3 bg-blue-600 text-white rounded-lg font-medium transition-all ${
                  isCreatingStop ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700 hover:shadow-md"
                }`}
              >
                {isCreatingStop ? "Creating..." : "Create Stop"}
              </button>
            </div>
            
            {busStops.length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold text-gray-900 mb-4">Existing Bus Stops ({busStops.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {busStops.map((stop) => (
                    <div key={stop.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2">
                      <span>📍</span>
                      <span className="text-gray-800">{stop.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "routes" && busStops.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">🛣️</span>
              <h2 className="text-xl font-semibold text-gray-900">Create New Route</h2>
            </div>
            <p className="text-gray-600 mb-6">Connect two bus stops to form a route</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={routeCityOne}
                onChange={(e) => setRouteCityOne(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Source</option>
                {busStops.map((city) => (
                  <option key={city.id} value={city.name}>{city.name}</option>
                ))}
              </select>
              <select
                value={routeCityTwo}
                onChange={(e) => setRouteCityTwo(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Destination</option>
                {busStops.map((city) => (
                  <option key={city.id} value={city.name}>{city.name}</option>
                ))}
              </select>
              <button
                onClick={createRoute}
                disabled={isCreatingRoute}
                className={`px-8 py-3 bg-blue-600 text-white rounded-lg font-medium transition-all ${
                  isCreatingRoute ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700 hover:shadow-md"
                }`}
              >
                {isCreatingRoute ? "Creating..." : "Create Route"}
              </button>
            </div>
            
            {allRoutes.length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold text-gray-900 mb-4">Active Routes ({allRoutes.length})</h3>
                <div className="space-y-2">
                  {allRoutes.map((route) => (
                    <div key={route.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-3">
                      <span>🛣️</span>
                      <span className="text-gray-800">{route.sourceBusStop.name}</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-gray-800">{route.destinationBusStop.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "buses" && allRoutes.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">🚌</span>
              <h2 className="text-xl font-semibold text-gray-900">Create New Bus</h2>
            </div>
            <p className="text-gray-600 mb-6">Add a scheduled bus for a selected route</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                placeholder="Bus Name"
                value={busName}
                onChange={(e) => setBusName(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Max Price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Base Price"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={busRoute}
                onChange={(e) => setBusRoute(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Route</option>
                {allRoutes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.sourceBusStop.name} - {route.destinationBusStop.name}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={busDate}
                onChange={(e) => setBusDate(e.target.value)}
                min={today}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="time"
                value={busTime}
                onChange={(e) => setBusTime(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={createNewBus}
              disabled={isCreatingBus}
              className={`w-full px-8 py-3 bg-blue-600 text-white rounded-lg font-medium transition-all ${
                isCreatingBus ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700 hover:shadow-md"
              }`}
            >
              {isCreatingBus ? "Creating Bus..." : "Create Bus"}
            </button>
            
            {allBuses.length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold text-gray-900 mb-4">Active Buses ({allBuses.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {allBuses.map((bus) => (
                    <div key={bus.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span>🚌</span>
                        <span className="font-semibold text-gray-800">{bus.busName}</span>
                      </div>
                      <p className="text-sm text-gray-600">Seats: {bus.seats?.length || 0}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "seats" && allBuses.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">💺</span>
              <h2 className="text-xl font-semibold text-gray-900">Create New Seat</h2>
            </div>
            <p className="text-gray-600 mb-6">Add individual seats to a bus</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Seat Number (e.g., A12)"
                value={seatNumber}
                onChange={(e) => setSeatNumber(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={seatBusId}
                onChange={(e) => setSeatBusId(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Bus</option>
                {allBuses.map((bus) => (
                  <option key={bus.id} value={bus.id}>{bus.busName}</option>
                ))}
              </select>
              <button
                onClick={createNewSeat}
                disabled={isCreatingSeat}
                className={`px-8 py-3 bg-blue-600 text-white rounded-lg font-medium transition-all ${
                  isCreatingSeat ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700 hover:shadow-md"
                }`}
              >
                {isCreatingSeat ? "Adding..." : "Create Seat"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}