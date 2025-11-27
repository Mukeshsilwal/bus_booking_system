import React, { useState } from "react";
import { toast } from "react-toastify";

const MovieSearchComponent = () => {
    const [movieName, setMovieName] = useState("");
    const [city, setCity] = useState("");
    const [date, setDate] = useState("");
    const [tickets, setTickets] = useState(1);
    const [isSearching, setIsSearching] = useState(false);

    const today = new Date().toISOString().split("T")[0];

    const handleSearch = (e) => {
        e.preventDefault();

        if (!city || !date) {
            toast.error("Please select city and date.");
            return;
        }

        setIsSearching(true);

        // Simulate API call
        setTimeout(() => {
            setIsSearching(false);
            toast.info("Movie booking feature coming soon!");
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-600 to-purple-900 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden transform transition-all duration-500 hover:scale-102">

                {/* Left Side Image/Icon */}
                <div className="md:w-1/2 p-8 flex items-center justify-center bg-red-50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
                    <div className="relative z-10 text-center">
                        <svg className="w-32 h-32 text-red-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                        </svg>
                        <h3 className="text-2xl font-bold text-red-900">Blockbuster Deals</h3>
                        <p className="text-red-700 mt-2">Book the best seats for the latest hits</p>
                    </div>
                </div>

                {/* Right Side Form */}
                <div className="md:w-1/2 p-8 space-y-6">
                    <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center animate-pulse">
                        Book Movies
                    </h1>

                    <div className="space-y-4">

                        {/* Movie Name (Optional) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Movie Name (Optional)</label>
                            <input
                                type="text"
                                value={movieName}
                                onChange={(e) => setMovieName(e.target.value)}
                                placeholder="Search by movie title..."
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                            />
                        </div>

                        {/* City */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                            <select
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                            >
                                <option value="">Select City</option>
                                <option value="Kathmandu">Kathmandu</option>
                                <option value="Pokhara">Pokhara</option>
                                <option value="Lalitpur">Lalitpur</option>
                                <option value="Chitwan">Chitwan</option>
                            </select>
                        </div>

                        {/* Date & Tickets */}
                        <div className="flex space-x-4">
                            <div className="w-2/3">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    min={today}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                                />
                            </div>
                            <div className="w-1/3">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tickets</label>
                                <select
                                    value={tickets}
                                    onChange={(e) => setTickets(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                        <option key={num} value={num}>{num}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Search Button */}
                        <button
                            onClick={handleSearch}
                            disabled={isSearching}
                            className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            {isSearching ? 'Searching...' : 'Find Shows'}
                        </button>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default MovieSearchComponent;
