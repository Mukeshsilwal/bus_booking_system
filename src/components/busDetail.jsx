import React, { useContext, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import SelectedBusContext from "../context/selectedbus";

const BusDetail = ({ bus }) => {
  const navigate = useNavigate();
  const { setSelectedBus } = useContext(SelectedBusContext);

const handleClick = useCallback(() => {
  // safely get existing bus list details
  const stored = JSON.parse(localStorage.getItem("busListDetails")) || { busList: [] };

  // save selected bus (keep existing structure)
  const newData = {
    ...stored,
    selectedBus: bus,
  };

  try {
    localStorage.setItem("busListDetails", JSON.stringify(newData));
  } catch (err) {
    // ignore localStorage errors in older browsers
    console.warn("Could not persist selected bus:", err);
  }

  setSelectedBus(bus);
  navigate("/ticket-details");
}, [bus, setSelectedBus, navigate]);


  const departure = bus?.departureDateTime ? new Date(bus.departureDateTime) : null;
  const departureDate = departure ? departure.toLocaleDateString() : "TBD";
  const departureTime = departure ? departure.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "TBD";

  // compute available seats if seats array exists
  const seats = Array.isArray(bus?.seats) ? bus.seats : [];
  const availableSeats = seats.filter((s) => !s.reserved).length;

  // compute duration if available
  const duration = useMemo(() => {
    if (bus?.duration) return bus.duration; // assume already human-friendly
    if (bus?.arrivalDateTime && bus?.departureDateTime) {
      try {
        const a = new Date(bus.arrivalDateTime);
        const d = new Date(bus.departureDateTime);
        const mins = Math.round((a - d) / 60000);
        if (!Number.isFinite(mins)) return null;
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${h}h ${m}m`;
      } catch (err) {
        return null;
      }
    }
    return null;
  }, [bus?.duration, bus?.arrivalDateTime, bus?.departureDateTime]);

  const stopsCount = useMemo(() => {
    if (Array.isArray(bus?.stops)) return bus.stops.length;
    if (Array.isArray(bus?.routeStops)) return bus.routeStops.length;
    return null;
  }, [bus?.stops, bus?.routeStops]);

  const priceFormatted = useMemo(() => {
    try {
      return new Intl.NumberFormat().format(bus?.basePrice ?? 0);
    } catch (_){
      return bus?.basePrice ?? 0;
    }
  }, [bus?.basePrice]);

  return (
    <article
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" ? handleClick() : null)}
      className="bus-detail bg-white rounded-lg shadow-md p-4 md:p-6 cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-102 border border-gray-100"
      onClick={handleClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-3">
            <img
              src={bus?.image || '/logo192.png'}
              alt={bus?.busName || 'bus image'}
              className="w-12 h-12 rounded-md object-cover border"
            />
            <div>
              <h3 className="bus-name text-lg md:text-xl font-bold text-gray-800">{bus?.busName || 'Unnamed Bus'}</h3>
              <p className="text-sm text-gray-500 mt-1">{bus?.busType || 'Standard'}</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Departs</p>
          <p className="text-sm font-semibold text-gray-700">{departureDate}</p>
          <p className="text-lg font-bold text-blue-600">{departureTime}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-500">Route</p>
          <p className="text-base font-medium text-gray-800">{bus?.routeName || bus?.route || 'Route info'}</p>
          <div className="text-sm text-gray-500 mt-1">
            {duration && <span className="mr-3">Duration: {duration}</span>}
            {stopsCount !== null && <span>{stopsCount} stops</span>}
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-500">Available seats</p>
          <p className="text-base font-medium text-gray-800">{availableSeats}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="bus-price text-xl font-bold text-green-600">Rs. {priceFormatted}/-</p>
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-200"
          onClick={(e) => {
            // prevent the div's onClick from firing twice
            e.stopPropagation();
            handleClick();
          }}
          aria-label={`Book ${bus?.busName || 'bus'}`}
        >
          Book
        </button>
      </div>
    </article>
  );
};

BusDetail.propTypes = {
  bus: PropTypes.object.isRequired,
};

export default BusDetail;
