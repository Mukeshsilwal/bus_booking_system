import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API_CONFIG from "../config/api";
import apiService from "../services/api.service";

export default function AdminPanel() {
  const navigate = useNavigate();

  // ---------------------------
  // STATES
  // ---------------------------
  const [busStops, setBusStops] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [selectedTab, setSelectedTab] = useState("routes");

  // Route creation fields
  const [sourceName, setSourceName] = useState("");
  const [destinationName, setDestinationName] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Bus creation fields
  const [busSource, setBusSource] = useState("");
  const [busDestination, setBusDestination] = useState("");
  const [busDate, setBusDate] = useState("");
  const [busTime, setBusTime] = useState("");
  const [totalSeats, setTotalSeats] = useState("");

  // Seat creation fields
  const [seatNumber, setSeatNumber] = useState("");
  const [seatBusId, setSeatBusId] = useState("");

  // ---------------------------
  // HELPERS
  // ---------------------------
  const safeApi = async (call, successMsg, callback) => {
    try {
      const res = await call();
      if (res.error) throw res;

      if (successMsg) toast.success(successMsg);
      if (callback) callback(res);

      return res;
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong.";
      toast.error(msg);
      return null;
    }
  };

  // ---------------------------
  // FETCH FUNCTIONS
  // ---------------------------
  const getAllBusStops = () =>
    safeApi(
      () => apiService.get(API_CONFIG.ENDPOINTS.GET_ALL_STOPS),
      null,
      setBusStops
    );

  const getAllRoutes = () =>
    safeApi(
      () => apiService.get(API_CONFIG.ENDPOINTS.GET_ALL_ROUTES),
      null,
      setRoutes
    );

  const getAllBuses = () =>
    safeApi(
      () => apiService.get(API_CONFIG.ENDPOINTS.GET_ALL_BUSES),
      null,
      setBuses
    );

  // ---------------------------
  // useEffect → Load data
  // ---------------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/admin/login");

    getAllBusStops();
    getAllRoutes();
    getAllBuses();
  }, []);

  // ---------------------------
  // CREATE ROUTE
  // ---------------------------
  const createRoute = async () => {
    if (!sourceName || !destinationName || !basePrice || !maxPrice) {
      return toast.error("All fields are required!");
    }

    if (sourceName === destinationName) {
      return toast.error("Source and destination cannot be the same!");
    }

    await safeApi(
      () =>
        apiService.post(API_CONFIG.ENDPOINTS.CREATE_ROUTE, {
          source: sourceName,
          destination: destinationName,
          basePrice: Number(basePrice),
          maxPrice: Number(maxPrice),
        }),
      "Route created successfully!",
      () => {
        setSourceName("");
        setDestinationName("");
        setBasePrice("");
        setMaxPrice("");
        getAllRoutes();
      }
    );
  };

  // ---------------------------
  // CREATE BUS
  // ---------------------------
  const createBus = async () => {
    if (!busSource || !busDestination || !busDate || !busTime || !totalSeats) {
      return toast.error("All fields are required!");
    }

    const dateTime = `${busDate}T${busTime}`;

    await safeApi(
      () =>
        apiService.post(API_CONFIG.ENDPOINTS.CREATE_BUS, {
          source: busSource,
          destination: busDestination,
          totalSeats: Number(totalSeats),
          departureDateTime: dateTime,
        }),
      "Bus created successfully!",
      () => {
        setBusSource("");
        setBusDestination("");
        setBusDate("");
        setBusTime("");
        setTotalSeats("");
        getAllBuses();
      }
    );
  };

  // ---------------------------
  // CREATE SEAT
  // ---------------------------
  const createSeat = async () => {
    if (!seatNumber || !seatBusId) {
      return toast.error("Seat number & bus are required!");
    }

    const normalizedSeat = seatNumber.trim().toUpperCase();
    const bus = buses.find((b) => String(b.id) === String(seatBusId));

    if (!bus) return toast.error("Invalid bus selected!");

    // Duplicate seat validation
    if (bus.seats.some((s) => s.seatNumber.toUpperCase() === normalizedSeat)) {
      return toast.error("Seat already exists for this bus!");
    }

    await safeApi(
      () =>
        apiService.post(
          `${API_CONFIG.ENDPOINTS.CREATE_SEAT}/${seatBusId}`,
          {
            seatNumber: normalizedSeat,
            reserved: false,
          }
        ),
      "Seat created successfully!",
      () => {
        setSeatNumber("");
        setSeatBusId("");
        getAllBuses();
      }
    );
  };

  // ---------------------------
  // UI RETURN
  // ---------------------------
  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>

      {/* TAB CONTROLS */}
      <div className="tabs">
        <button onClick={() => setSelectedTab("routes")} className={selectedTab === "routes" ? "active" : ""}>
          Create Route
        </button>

        <button onClick={() => setSelectedTab("buses")} className={selectedTab === "buses" ? "active" : ""}>
          Create Bus
        </button>

        <button onClick={() => setSelectedTab("seats")} className={selectedTab === "seats" ? "active" : ""}>
          Create Seat
        </button>
      </div>

      {/* ROUTE CREATION */}
      {selectedTab === "routes" && (
        <div className="card">
          <h2>Create New Route</h2>

          <select value={sourceName} onChange={(e) => setSourceName(e.target.value)}>
            <option value="">Select Source</option>
            {busStops.map((stop) => (
              <option key={stop.id} value={stop.name}>
                {stop.name}
              </option>
            ))}
          </select>

          <select value={destinationName} onChange={(e) => setDestinationName(e.target.value)}>
            <option value="">Select Destination</option>
            {busStops.map((stop) => (
              <option key={stop.id} value={stop.name}>
                {stop.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Base Price"
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
          />

          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />

          <button onClick={createRoute}>Create Route</button>
        </div>
      )}

      {/* BUS CREATION */}
      {selectedTab === "buses" && (
        <div className="card">
          <h2>Create New Bus</h2>

          <select value={busSource} onChange={(e) => setBusSource(e.target.value)}>
            <option value="">Select Source</option>
            {busStops.map((stop) => (
              <option key={stop.id} value={stop.name}>
                {stop.name}
              </option>
            ))}
          </select>

          <select value={busDestination} onChange={(e) => setBusDestination(e.target.value)}>
            <option value="">Select Destination</option>
            {busStops.map((stop) => (
              <option key={stop.id} value={stop.name}>
                {stop.name}
              </option>
            ))}
          </select>

          <input type="date" value={busDate} onChange={(e) => setBusDate(e.target.value)} />

          <input type="time" value={busTime} onChange={(e) => setBusTime(e.target.value)} />

          <input
            type="number"
            placeholder="Total Seats"
            value={totalSeats}
            onChange={(e) => setTotalSeats(e.target.value)}
          />

          <button onClick={createBus}>Create Bus</button>
        </div>
      )}

      {/* SEAT CREATION */}
      {selectedTab === "seats" && (
        <div className="card">
          <h2>Create Seat</h2>

          <input
            type="text"
            placeholder="Seat Number"
            value={seatNumber}
            onChange={(e) => setSeatNumber(e.target.value)}
          />

          <select value={seatBusId} onChange={(e) => setSeatBusId(e.target.value)}>
            <option value="">Select Bus</option>
            {buses.map((bus) => (
              <option key={bus.id} value={bus.id}>
                {bus.source} → {bus.destination} ({bus.departureDateTime})
              </option>
            ))}
          </select>

          <button onClick={createSeat}>Add Seat</button>
        </div>
      )}
    </div>
  );
}
