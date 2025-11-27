import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

// Actually, I should probably check if hotel.svg exists or use a different icon. 
// For now, I'll use a placeholder SVG in the code if I can't find one, or just reuse the structure.
// I'll use an inline SVG for the icon to be safe.

const HotelSearchComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [city, setCity] = useState("");
    const [checkInDate, setCheckInDate] = useState("");
    const [checkOutDate, setCheckOutDate] = useState("");
    const [guests, setGuests] = useState(1);
    const [isSearching, setIsSearching] = useState(false);

    const today = new Date().toISOString().split("T")[0];

    const handleSearch = (e) => {
        e.preventDefault();

        if (!city || !checkInDate || !checkOutDate) {
            toast.error("Please fill in all fields.");
            return;
        }

        setIsSearching(true);

        // Simulate API call or navigation
        setTimeout(() => {
            setIsSearching(false);
            toast.info("Hotel search feature coming soon!");
            // Here we would navigate to a hotel list page
            // navigate("/hotels", { state: { city, checkInDate, checkOutDate, guests } });
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-800 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden transform transition-all duration-500 hover:scale-102">

                {/* Left Side Image/Icon */}
                <div className="md:w-1/2 p-8 flex items-center justify-center bg-indigo-50">
                    <svg className="w-full h-64 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </div>

                {/* Right Side Form */}
                <div className="md:w-1/2 p-8 space-y-6">
                    <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center animate-pulse">
                        Find Your Stay
                    </h1>

                    <div className="space-y-4">

                        {/* City */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">City / Location</label>
                            <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="Where are you going?"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            />
                        </div>

                        {/* Dates */}
                        <div className="flex space-x-4">
                            <div className="w-1/2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Check-in</label>
                                <input
                                    type="date"
                                    value={checkInDate}
                                    onChange={(e) => setCheckInDate(e.target.value)}
                                    min={today}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                />
                            </div>
                            <div className="w-1/2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Check-out</label>
                                <input
                                    type="date"
                                    value={checkOutDate}
                                    onChange={(e) => setCheckOutDate(e.target.value)}
                                    min={checkInDate || today}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* Guests */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Guests</label>
                            <select
                                value={guests}
                                onChange={(e) => setGuests(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            >
                                {[1, 2, 3, 4, 5, 6].map(num => (
                                    <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                                ))}
                            </select>
                        </div>

                        {/* Search Button */}
                        <button
                            onClick={handleSearch}
                            disabled={isSearching}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSearching ? 'Searching...' : 'Search Hotels'}
                        </button>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default HotelSearchComponent;
