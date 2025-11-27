
import React from "react";
import { useContext, useEffect, useState } from "react";
import busIcon from "../assets/bus.svg";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import BusListContext from "../context/busdetails";
import ApiService from "../services/api.service";
import API_CONFIG from "../config/api";

const ImageSearchComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setBusList } = useContext(BusListContext);

  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [busStops, setBusStops] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const handleSearch = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    setFetchError("");

    // Force Login Check
    const token = localStorage.getItem("token");
    if (!token) {
      toast.info("Please login to search for buses.");
      navigate("/", { state: { from: location } });
      return;
    }

    // basic validation
    if (!source || !destination || !date) {
      setFetchError("Please select source, destination and date.");
      return;
    }

    if (source === destination) {
      setFetchError("Source and destination cannot be the same.");
      return;
    }

    setIsSearching(true);
    try {
      const res = await ApiService.get(
        `${API_CONFIG.ENDPOINTS.SEARCH_BUSES}?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&date=${encodeURIComponent(date)}`
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err.message || `Search failed: ${res.status}`;
        setFetchError(msg);
        toast.error(msg);
        setIsSearching(false);
        return;
      }

      const response = await res.json();

      // keep consistent structure: assume response is array of buses
      const buses = Array.isArray(response) ? response : (response?.busList || []);

      localStorage.setItem("searchDetails", JSON.stringify({ source, destination, date }));
      localStorage.setItem("busListDetails", JSON.stringify({ busList: buses }));

      setBusList(buses);

      if (!buses || buses.length === 0) {
        toast.info("No buses found for the selected route/date.");
      }

      navigate("/buslist");
    } catch (error) {
      console.error("Search failed:", error);
      setFetchError("Search failed. Please try again.");
      toast.error("Search failed. Please check your network or try later.");
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const getBusStops = async () => {
      try {
        const response = await ApiService.get(`${API_CONFIG.ENDPOINTS.GET_BUS_STOPS}`);

        if (response.ok) {
          const data = await response.json();
          setBusStops(data);
        }
      } catch (error) {
        console.error("Failed to fetch bus stops:", error);
      }
    };
    getBusStops();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-600 to-blue-800 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden transform transition-all duration-500 hover:scale-102">

        {/* Left Side Image */}
        <div className="md:w-1/2 p-8 flex items-center justify-center bg-blue-50">
          <img
            src={busIcon}
            alt="Bus travel"
            className="rounded-lg shadow-md w-full h-64 object-contain transform transition-all duration-500 hover:scale-105"
          />
        </div>

        {/* Right Side Form */}
        <div className="md:w-1/2 p-8 space-y-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center animate-pulse">
            Find Your Bus
          </h1>

          <div className="space-y-4">

            {/* From City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
              <select
                onChange={(e) => setSource(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={source}
              >
                <option value="">Select source city</option>
                {busStops.map((city) => (
                  <option key={city.name} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            {/* To City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
              <select
                onChange={(e) => setDestination(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={destination}
              >
                <option value="">Select destination city</option>
                {busStops.map((city) => (
                  <option key={city.name} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Travel Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={today}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Search Button */}
            {fetchError && (
              <div className="text-sm text-red-600 mb-2" role="alert">{fetchError}</div>
            )}
            <button
              onClick={handleSearch}
              disabled={!source || !destination || !date || isSearching}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? 'Searching...' : 'Search Buses'}
            </button>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ImageSearchComponent;
