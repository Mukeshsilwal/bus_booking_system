import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ApiService from '../../services/api.service';
import API_CONFIG from '../../config/api';
import { DataTable } from './DataTable';

export function TicketManager() {
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    useEffect(() => {
        fetchBookings();
    }, []);

    async function fetchBookings() {
        setIsLoading(true);
        try {
            const res = await ApiService.get(API_CONFIG.ENDPOINTS.GET_ALL_BOOKINGS);
            if (res.ok) {
                const data = await res.json();
                const list = Array.isArray(data) ? data : (data.bookings || data.data || []);
                setBookings(list);
            } else {
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

    // Filter bookings
    const filteredBookings = bookings.filter(booking => {
        // Status filter
        if (filterStatus !== 'all' && booking.status !== filterStatus) {
            return false;
        }

        // Date range filter
        if (dateRange.start && booking.date) {
            const bookingDate = new Date(booking.date);
            const startDate = new Date(dateRange.start);
            if (bookingDate < startDate) return false;
        }
        if (dateRange.end && booking.date) {
            const bookingDate = new Date(booking.date);
            const endDate = new Date(dateRange.end);
            if (bookingDate > endDate) return false;
        }

        return true;
    });

    const ticketColumns = [
        {
            key: 'id',
            label: 'Booking ID',
            sortable: true,
            render: (id) => (
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    #{id?.toString().slice(-6) || 'N/A'}
                </span>
            )
        },
        {
            key: 'fullName',
            label: 'Passenger',
            sortable: true,
            render: (name, booking) => (
                <div>
                    <p className="font-medium text-gray-900">{name || booking.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{booking.email || 'N/A'}</p>
                </div>
            )
        },
        {
            key: 'ticketNo',
            label: 'Ticket No',
            sortable: true,
            render: (ticketNo) => (
                <span className="font-mono text-sm">{ticketNo || '-'}</span>
            )
        },
        {
            key: 'date',
            label: 'Travel Date',
            sortable: true,
            render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A'
        },
        {
            key: 'totalPrice',
            label: 'Amount',
            sortable: true,
            render: (price, booking) => (
                <span className="font-semibold text-green-600">
                    Rs. {price || booking.price || booking.amount || 0}
                </span>
            )
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (status) => {
                const statusColors = {
                    'CONFIRMED': 'bg-green-100 text-green-700 border-green-200',
                    'CANCELLED': 'bg-red-100 text-red-700 border-red-200',
                    'PENDING': 'bg-yellow-100 text-yellow-700 border-yellow-200'
                };
                const statusIcons = {
                    'CONFIRMED': '✓',
                    'CANCELLED': '✕',
                    'PENDING': '⏱'
                };
                const currentStatus = status || 'PENDING';
                return (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[currentStatus] || statusColors.PENDING}`}>
                        {statusIcons[currentStatus]} {currentStatus}
                    </span>
                );
            }
        },
        {
            key: 'actions',
            label: 'Actions',
            sortable: false,
            render: (_, booking) => (
                <button
                    onClick={() => deleteTicket(booking.id)}
                    className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete Ticket"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            )
        }
    ];

    // Calculate statistics
    const stats = {
        total: bookings.length,
        confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
        pending: bookings.filter(b => b.status === 'PENDING').length,
        cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
        revenue: bookings.reduce((sum, b) => sum + (b.totalPrice || b.price || b.amount || 0), 0)
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Ticket Bookings
                    </h2>
                    <p className="text-gray-600 mt-1">Manage and track all ticket bookings</p>
                </div>
                <button
                    onClick={fetchBookings}
                    className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-500 font-medium">Total Bookings</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-500 font-medium">Confirmed</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{stats.confirmed}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-500 font-medium">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-500 font-medium">Cancelled</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">{stats.cancelled}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-500 font-medium">Total Revenue</p>
                    <p className="text-2xl font-bold text-indigo-600 mt-1">Rs. {stats.revenue.toLocaleString()}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Filter by Status</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="all">All Status</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="PENDING">Pending</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <button
                        onClick={() => {
                            setFilterStatus('all');
                            setDateRange({ start: '', end: '' });
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Bookings Table */}
            {isLoading ? (
                <div className="bg-white p-12 rounded-2xl text-center border border-gray-100">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="text-gray-500 mt-4">Loading bookings...</p>
                </div>
            ) : filteredBookings.length > 0 ? (
                <DataTable
                    columns={ticketColumns}
                    data={filteredBookings}
                    itemsPerPage={15}
                    searchable={true}
                    exportable={true}
                />
            ) : (
                <div className="bg-white p-12 rounded-2xl text-center border border-gray-100">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No bookings found</h3>
                    <p className="text-gray-500">Bookings will appear here once users purchase tickets.</p>
                </div>
            )}
        </div>
    );
}
