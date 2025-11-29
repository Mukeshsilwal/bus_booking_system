import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../components/Navbar";
import Footer from "../components/Footer";

const PlaneTicketConfirm = () => {
    const navigate = useNavigate();

    // Initialize state with localStorage data directly (lazy initialization)
    const [bookingData, setBookingData] = useState(() => {
        try {
            const data = JSON.parse(localStorage.getItem("planeListDetails"));
            return data && data.selectedFlight ? data : null;
        } catch (error) {
            console.error("Error parsing localStorage:", error);
            return null;
        }
    });

    // Separate effect ONLY for navigation check
    useEffect(() => {
        if (!bookingData) {
            navigate("/plane-list");
        }
    }, [bookingData, navigate]);

    if (!bookingData) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <NavigationBar />

            <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
                    {/* Header */}
                    <div className="bg-sky-600 px-8 py-6 text-white text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold">Booking Confirmed!</h1>
                        <p className="text-sky-100 mt-2">Your flight ticket has been successfully booked.</p>
                    </div>

                    {/* Ticket Body */}
                    <div className="p-8">
                        <div className="flex justify-between items-start mb-8 pb-8 border-b border-slate-100">
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Booking ID</p>
                                <p className="text-xl font-mono font-bold text-slate-900">{bookingData.bookingId}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-slate-500 mb-1">Date</p>
                                <p className="font-medium text-slate-900">{new Date(bookingData.date).toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* Flight Info */}
                        <div className="bg-slate-50 rounded-xl p-6 mb-8 border border-slate-100">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                        <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{bookingData.flight.airline}</h3>
                                        <p className="text-xs text-slate-500">{bookingData.flight.flightNumber}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-slate-900">{bookingData.flight.classType}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {new Date(bookingData.flight.departureDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <p className="text-sm text-slate-500">{bookingData.flight.source}</p>
                                </div>
                                <div className="flex-1 px-8 flex flex-col items-center">
                                    <div className="w-full h-px bg-slate-300 relative top-3"></div>
                                    <svg className="w-5 h-5 text-slate-400 relative z-10 bg-slate-50 px-1 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                    </svg>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-slate-900">
                                        {new Date(bookingData.flight.arrivalDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <p className="text-sm text-slate-500">{bookingData.flight.destination}</p>
                                </div>
                            </div>
                        </div>

                        {/* Passenger & Seat Info */}
                        <div className="grid grid-cols-2 gap-8 mb-8">
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Passenger</p>
                                <p className="font-medium text-slate-900">{bookingData.passenger.name}</p>
                                <p className="text-xs text-slate-500">{bookingData.passenger.email}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-slate-500 mb-1">Seats</p>
                                <p className="font-medium text-slate-900">{bookingData.seats.map(s => s.seatNumber).join(", ")}</p>
                            </div>
                        </div>

                        {/* Total */}
                        <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                            <span className="text-slate-600">Total Paid</span>
                            <span className="text-2xl font-bold text-sky-600">NPR {bookingData.totalCost}</span>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="bg-slate-50 px-8 py-6 border-t border-slate-200 flex justify-center gap-4">
                        <button
                            onClick={() => window.print()}
                            className="px-6 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                        >
                            Print Ticket
                        </button>
                        <button
                            onClick={() => navigate("/")}
                            className="px-6 py-2 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 transition-colors"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PlaneTicketConfirm;