import React from 'react';

export const SeatIcon = ({ status, seatNumber, price, onClick, className }) => {
    // Colors based on status
    const getColors = () => {
        switch (status) {
            case 'booked':
                return {
                    fill: '#e2e8f0', // slate-200
                    stroke: '#cbd5e1', // slate-300
                    text: '#94a3b8', // slate-400
                    cursor: 'cursor-not-allowed'
                };
            case 'selected':
                return {
                    fill: '#4f46e5', // indigo-600
                    stroke: '#4338ca', // indigo-700
                    text: '#ffffff', // white
                    cursor: 'cursor-pointer'
                };
            case 'available':
            default:
                return {
                    fill: '#ffffff', // white
                    stroke: '#cbd5e1', // slate-300
                    text: '#475569', // slate-600
                    cursor: 'cursor-pointer hover:fill-indigo-50 hover:stroke-indigo-400'
                };
        }
    };

    const colors = getColors();

    return (
        <div
            onClick={onClick}
            className={`relative flex flex-col items-center justify-center group ${colors.cursor} ${className || ''}`}
            title={status === 'booked' ? 'Booked' : `Seat ${seatNumber}`}
        >
            <svg
                viewBox="0 0 100 100"
                className={`w-full h-full transition-all duration-200 ${status === 'available' ? 'group-hover:drop-shadow-md' : ''}`}
            >
                {/* Backrest */}
                <path
                    d="M20 15 C20 8, 80 8, 80 15 L80 65 L20 65 Z"
                    fill={colors.fill}
                    stroke={colors.stroke}
                    strokeWidth="3"
                    className="transition-colors duration-200"
                />

                {/* Seat Cushion */}
                <path
                    d="M15 60 C15 60, 85 60, 85 60 C90 60, 90 85, 85 85 L15 85 C10 85, 10 60, 15 60 Z"
                    fill={colors.fill}
                    stroke={colors.stroke}
                    strokeWidth="3"
                    className="transition-colors duration-200"
                />

                {/* Armrests (optional detail) */}
                <path d="M15 60 L15 75" stroke={colors.stroke} strokeWidth="3" strokeLinecap="round" />
                <path d="M85 60 L85 75" stroke={colors.stroke} strokeWidth="3" strokeLinecap="round" />
            </svg>

            {/* Seat Number */}
            <span
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold transition-colors duration-200 pointer-events-none"
                style={{ color: colors.text, marginTop: '5px' }}
            >
                {seatNumber}
            </span>

            {/* Price Tag (only for available seats in booking view) */}
            {price && status !== 'booked' && (
                <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-[10px] font-medium text-slate-500 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    Rs.{price}
                </div>
            )}
        </div>
    );
};
