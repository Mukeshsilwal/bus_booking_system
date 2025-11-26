import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ApiService from '../../services/api.service';
import API_CONFIG from '../../config/api';

export function TicketManager() {
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    async function fetchBookings() {
        setIsLoading(true);
        try {
            const res = await ApiService.get(API_CONFIG.ENDPOINTS.GET_ALL_BOOKINGS);
            if (res.ok) {
                const data = await res.json();
                // Handle different response structures
                const list = Array.isArray(data) ? data : (data.bookings || data.data || []);
                setBookings(list);
            } else {
                // If 404, it might mean the endpoint doesn't exist yet.
                if (res.status === 404) {
                    console.warn("GET_ALL_BOOKINGS endpoint not found.");
                }
            }
        } catch (error) {
            console.error("Error fetching bookings:", error);
            toast.error("Failed to fetch bookings");
        } finally {
            setIsLoading(false);
        }
    }

    async function deleteTicket(ticketId) {
        if (!window.confirm("Are you sure you want to delete this ticket?")) return;

        try {
            const res = await ApiService.delete(`${API_CONFIG.ENDPOINTS.DELETE_TICKET}/${ticketId}`);
            if (res.ok) {
                toast.success("Ticket deleted successfully");
                fetchBookings();
            } else {
                const err = await res.json().catch(() => ({}));
                toast.error(err.message || "Failed to delete ticket");
            }
        } catch (error) {
            console.error("Error deleting ticket:", error);
            toast.error("Failed to delete ticket");
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Ticket Bookings</h2>
                <button
                    onClick={fetchBookings}
                    className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center gap-1"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading bookings...</div>
                ) : bookings.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Booking ID</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Passenger</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Email</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Ticket No</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {bookings.map((booking, index) => (
                                    <tr key={booking.id || index} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 text-gray-800 font-medium text-sm">#{booking.id?.toString().slice(-6) || 'N/A'}</td>
                                        <td className="p-4 text-gray-600 text-sm">{booking.fullName || booking.name || 'Unknown'}</td>
                                        <td className="p-4 text-gray-600 text-sm">{booking.email || 'N/A'}</td>
                                        <td className="p-4 text-gray-600 text-sm font-mono">{booking.ticketNo || '-'}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                                    booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {booking.status || 'PENDING'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => deleteTicket(booking.id)}
                                                className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                                title="Delete Ticket"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No bookings found</h3>
                        <p className="text-gray-500 mt-1">Bookings will appear here once users purchase tickets.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
