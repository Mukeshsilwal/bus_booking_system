import { useEffect, useState } from "react";
import NavigationBar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ApiService from "../services/api.service";
import API_CONFIG from "../config/api";


export function AdminPanel() {
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

  // Fetch bus stops, routes, and buses on component mount
  useEffect(() => {
    getBusStops();
    getAllRoutes();
    getAllBuses();
    if (!localStorage.getItem("token")) {
      navigate("/admin/login");
    }
  }, []);

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

  // Fetch all routes
  async function getAllRoutes() {
    const allroutesRes = await ApiService.get(API_CONFIG.ENDPOINTS.GET_ROUTES);
    if (allroutesRes.ok) {
      const allRoutesLoad = await allroutesRes.json();
      setAllRoutes(allRoutesLoad);
    }
  }

  // Fetch all buses
  async function getAllBuses() {
    const allBusesRes = await ApiService.get(API_CONFIG.ENDPOINTS.GET_ALL_BUSES);
    if (allBusesRes.ok) {
      const allBusesLoad = await allBusesRes.json();
      setAllBuses(allBusesLoad);
    }
  }

  // Create a new bus stop
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
  // Create a new route
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
        getAllRoutes();
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

  // Create a new bus
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

  // Create a new seat
   async function createNewSeat() {
    if (!seatNumber || !seatBusId) {
      toast.error("Seat Number and Bus ID are required!");
      return;
    }

    // normalize seat number and check duplicates locally before API call
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


  return (
    <div className="min-h-screen bg-gray-100">
      <NavigationBar />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Panel</h1>

        {/* Create New Bus Stop */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 border-l-4 border-blue-500">
          <h2 className="text-xl font-semibold text-gray-700 mb-1">Create New Bus Stop</h2>
          <p className="text-sm text-gray-500 mb-4">Add a new city or stop where buses will operate.</p>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Name of Bus Stop (e.g., Kathmandu)"
              value={busStop}
              onChange={(e) => setBusStop(e.target.value)}
              className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={createBusStop}
              disabled={isCreatingStop}
              className={`bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors ${isCreatingStop ? 'opacity-80 cursor-not-allowed' : 'hover:bg-blue-700'}`}
            >
              {isCreatingStop ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>

        {/* Create New Route */}
        {busStops.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-1">Create New Route</h2>
            <p className="text-sm text-gray-500 mb-3">Connect two bus stops to form a route.</p>
            <div className="flex gap-4 items-center">
              <select
                value={routeCityOne}
                onChange={(e) => setRouteCityOne(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Source</option>
                {busStops.map((city) => (
                  <option key={city.id} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
              <select
                value={routeCityTwo}
                onChange={(e) => setRouteCityTwo(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Destination</option>
                {busStops.map((city) => (
                  <option key={city.id} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
              <button
                onClick={createRoute}
                disabled={isCreatingRoute}
                className={`bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors ${isCreatingRoute ? 'opacity-80 cursor-not-allowed' : 'hover:bg-blue-700'}`}
              >
                {isCreatingRoute ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        )}

        {/* Create New Bus */}
        {allRoutes.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-1">Create New Bus</h2>
            <p className="text-sm text-gray-500 mb-3">Add a scheduled bus for a selected route.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
              <input
                type="text"
                placeholder="Bus Name"
                value={busName}
                onChange={(e) => setBusName(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Max Price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Base Price"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={busRoute}
                onChange={(e) => setBusRoute(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="time"
                value={busTime}
                onChange={(e) => setBusTime(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={createNewBus}
                disabled={isCreatingBus}
                className={`col-span-full bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors ${isCreatingBus ? 'opacity-80 cursor-not-allowed' : 'hover:bg-blue-700'}`}
              >
                {isCreatingBus ? 'Creating Bus...' : 'Create Bus'}
              </button>
            </div>
          </div>
        )}

        {/* Create New Seat */}
        {allBuses.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-1">Create New Seat</h2>
            <p className="text-sm text-gray-500 mb-3">Add individual seats to a bus.</p>
            <div className="flex gap-4 items-center">
              <input
                type="text"
                placeholder="Seat Number (e.g., A12)"
                value={seatNumber}
                onChange={(e) => setSeatNumber(e.target.value)}
                className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <select
                value={seatBusId}
                onChange={(e) => setSeatBusId(e.target.value)}
                className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select Bus</option>
                {allBuses.map((bus) => (
                  <option key={bus.id} value={bus.id}>
                    {bus.busName}
                  </option>
                ))}
              </select>
              <button
                onClick={createNewSeat}
                disabled={isCreatingSeat}
                className={`bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors ${isCreatingSeat ? 'opacity-80 cursor-not-allowed' : 'hover:bg-blue-700'}`}
              >
                {isCreatingSeat ? 'Adding...' : 'Create Seat'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}