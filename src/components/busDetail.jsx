import React, { useContext, useMemo, useCallback, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import SelectedBusContext from "../context/selectedbus";
import busIcon from "../assets/bus.svg";
import { SeatIcon } from "./SeatIcon";

const BusDetail = ({ bus }) => {
  const navigate = useNavigate();
  const { setSelectedBus } = useContext(SelectedBusContext);

  const handleClick = useCallback(() => {
    const stored = JSON.parse(localStorage.getItem("busListDetails")) || { busList: [] };
    const newData = {
      ...stored,
      selectedBus: bus,
    };

    try {
      localStorage.setItem("busListDetails", JSON.stringify(newData));
    } catch (err) {
      console.warn("Could not persist selected bus:", err);
    }

    setSelectedBus(bus);
    navigate("/ticket-details");
  }, [bus, setSelectedBus, navigate]);

  const departure = bus?.departureDateTime ? new Date(bus.departureDateTime) : null;
  const departureDate = departure ? departure.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "TBD";
  const departureTime = departure ? departure.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "TBD";

  const seats = Array.isArray(bus?.seats) ? bus.seats : [];
  const availableSeats = seats.filter((s) => !s.reserved).length;

  const duration = useMemo(() => {
    if (bus?.duration) return bus.duration;
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

  const priceFormatted = useMemo(() => {
    try {
      return new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR' }).format(bus?.basePrice ?? 0);
    } catch (_) {
      return `Rs. ${bus?.basePrice ?? 0}`;
    }
  }, [bus?.basePrice]);

  const [showSeatPreview, setShowSeatPreview] = useState(false);

  const seatPreview = useMemo(() => {
    const list = Array.isArray(bus?.seats) ? bus.seats : [];
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
      className="group bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-300 mb-4"
    >
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Left Section: Bus Info */}
          <div className="flex-1">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <img
                  src={bus?.image || busIcon}
                  alt={bus?.busName || 'bus'}
                  className="w-10 h-10 object-contain opacity-80"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {bus?.busName || 'Unnamed Bus'}
                </h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                    {bus?.busType || 'Standard'}
                  </span>
                  {bus?.isAc && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      AC
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-8">
              <div>
                <p className="text-sm text-slate-500 mb-1">Departure</p>
                <p className="text-lg font-bold text-slate-900">{departureTime}</p>
                <p className="text-xs text-slate-500">{departureDate}</p>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <div className="w-full h-px bg-slate-200 relative top-3"></div>
                <p className="text-xs text-slate-400 bg-white px-2 relative z-10">
                  {duration || 'Direct'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500 mb-1">Arrival</p>
                <p className="text-lg font-bold text-slate-900">
                  {bus?.arrivalDateTime ? new Date(bus.arrivalDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </p>
                <p className="text-xs text-slate-500">
                  {bus?.arrivalDateTime ? new Date(bus.arrivalDateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'TBD'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Section: Price & Action */}
          <div className="flex flex-col justify-between items-end sm:border-l sm:border-slate-100 sm:pl-6 min-w-[140px]">
            <div className="text-right">
              <p className="text-sm text-slate-500">Starting from</p>
              <p className="text-2xl font-bold text-indigo-600">{priceFormatted}</p>
              <p className="text-xs text-emerald-600 font-medium mt-1">
                {availableSeats} seats left
              </p>
            </div>

            <div className="flex flex-col gap-2 w-full mt-4 sm:mt-0">
              <button
                onClick={handleClick}
                className="w-full btn-primary"
              >
                Select Seats
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setShowSeatPreview(!showSeatPreview); }}
                className="w-full text-sm text-slate-500 hover:text-indigo-600 transition-colors py-1"
              >
                {showSeatPreview ? 'Hide Layout' : 'View Layout'}
              </button>
            </div>
          </div>
        </div>

        {/* Seat Preview */}
        {showSeatPreview && (
          <div className="mt-6 pt-6 border-t border-slate-100 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-slate-900">Seat Layout</h4>
              <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <SeatIcon status="available" className="w-4 h-4" />
                  <span className="text-slate-600">Available</span>
                </div>
                <div className="flex items-center gap-1">
                  <SeatIcon status="booked" className="w-4 h-4" />
                  <span className="text-slate-400">Booked</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg overflow-x-auto">
              <div className="grid gap-2 min-w-max mx-auto" style={{ gridTemplateColumns: `repeat(${seatPreview.cols}, minmax(40px, 1fr))` }}>
                {seatPreview.grid.flat().map((seat, idx) => (
                  <div key={idx} className="aspect-square flex items-center justify-center">
                    {seat ? (
                      <SeatIcon
                        status={seat.reserved ? 'booked' : 'available'}
                        seatNumber={seat.seatNumber}
                        className="w-8 h-8"
                      />
                    ) : (
                      <div className="w-8 h-8 invisible" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

BusDetail.propTypes = {
  bus: PropTypes.object.isRequired,
};

export default BusDetail;
