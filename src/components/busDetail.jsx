import React, { useContext, useMemo, useCallback, useState } from "react";
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

  // seat layout preview: build a simple grid
  const [showSeatPreview, setShowSeatPreview] = useState(false);

  const seatPreview = useMemo(() => {
    const list = Array.isArray(bus?.seats) ? bus.seats : [];
    // If bus defines seatLayout { cols }, respect it; otherwise fall back
    const cols = bus?.seatLayout?.cols || 4;
    const rows = Math.ceil(list.length / cols) || 0;
    const grid = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        const seat = list[idx] || null;
        row.push(seat);
      }
      grid.push(row);
    }
    return { grid, cols, rows };
  }, [bus?.seats, bus?.seatLayout]);

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

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
        <div className="flex-1">
          <p className="text-sm text-gray-500">Route</p>
          <p className="text-base font-medium text-gray-800">{bus?.routeName || bus?.route || 'Route info'}</p>
          <div className="text-sm text-gray-500 mt-1">
            {duration && <span className="mr-3">Duration: {duration}</span>}
            {stopsCount !== null && <span className="mr-3">{stopsCount} stops</span>}
            {bus?.arrivalDateTime && (
              <span className="text-gray-500">Arrives: {new Date(bus.arrivalDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            )}
          </div>

          {/* feature badges */}
          <div className="mt-3 flex flex-wrap gap-2">
            {(bus?.features || []).slice(0, 5).map((f) => (
              <span key={f} className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full border">
                {f}
              </span>
            ))}
            {!bus?.features && bus?.isAc && <span className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full border">AC</span>}
            {!bus?.features && bus?.isSleeper && <span className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full border">Sleeper</span>}
          </div>
        </div>

        <div className="text-right w-full md:w-48">
          <p className="text-sm text-gray-500">Available seats</p>
          <p className="text-base font-medium text-gray-800">{availableSeats}</p>
          <button
            onClick={(e) => { e.stopPropagation(); setShowSeatPreview((s) => !s); }}
            className="mt-3 w-full bg-white border border-gray-200 text-gray-700 py-2 rounded-md hover:shadow-sm"
            aria-expanded={showSeatPreview}
            aria-controls={`seat-preview-${bus?.id || 'unknown'}`}
          >
            {showSeatPreview ? 'Hide seats' : 'Preview seats'}
          </button>
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

      {/* seat preview grid */}
      {showSeatPreview && (
        <div id={`seat-preview-${bus?.id || 'unknown'}`} className="mt-4">
          <div className="text-sm text-gray-600 mb-2">Seat layout preview</div>
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${seatPreview.cols}, minmax(0,1fr))` }}>
            {seatPreview.grid.flat().map((seat, idx) => (
              <div key={idx} className={`p-2 text-center text-xs rounded border ${seat ? (seat.reserved ? 'bg-red-100 border-red-300 text-red-700' : 'bg-green-50 border-green-200 text-green-700') : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                {seat ? seat.seatNumber || `S${idx+1}` : ''}
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-gray-500">Green = available, Red = reserved</div>
        </div>
      )}
    </article>
  );
};

BusDetail.propTypes = {
  bus: PropTypes.object.isRequired,
};

export default BusDetail;
