import React, { useState, useEffect } from 'react';
import ApiService from '../../services/api.service';
import API_CONFIG from '../../config/api';
import { RevenueChart } from './RevenueChart';
import { StatsCard } from './StatsCard';

export function Dashboard() {
    const [stats, setStats] = useState({
        totalBuses: 0,
        totalRoutes: 0,
        totalBookings: 0,

        revenue: 0,
        totalHotels: 0,
        totalMovies: 0
    });
    const [revenueData, setRevenueData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    async function fetchDashboardData() {
        try {
            const [busesRes, routesRes, bookingsRes, moviesRes] = await Promise.all([
                ApiService.get(API_CONFIG.ENDPOINTS.GET_ALL_BUSES),
                ApiService.get(API_CONFIG.ENDPOINTS.GET_ROUTES),

                ApiService.get(API_CONFIG.ENDPOINTS.GET_ALL_BOOKINGS),
                ApiService.get(API_CONFIG.ENDPOINTS.QFX_MOVIES_NOW_SHOWING)
            ]);

            let totalBuses = 0;
            let totalRoutes = 0;
            let totalBookings = 0;

            let revenue = 0;
            let totalMovies = 0;
            let totalHotels = 5; // Dummy data for now
            let dailyRevenue = {};
            let activities = [];

            if (busesRes.ok) {
                const buses = await busesRes.json();
                totalBuses = Array.isArray(buses) ? buses.length : 0;
            }

            if (routesRes.ok) {
                const routes = await routesRes.json();
                totalRoutes = Array.isArray(routes) ? routes.length : 0;
            }

            if (bookingsRes.ok) {
                const bookingsData = await bookingsRes.json();
                const bookings = Array.isArray(bookingsData) ? bookingsData : (bookingsData.bookings || bookingsData.data || []);

                totalBookings = bookings.length;

                // Initialize last 7 days for chart
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const dateStr = d.toISOString().split('T')[0];
                    dailyRevenue[dateStr] = 0;
                }

                // Get recent bookings for activity feed
                activities = bookings
                    .slice(0, 5)
                    .map(booking => ({
                        id: booking.id,
                        type: 'booking',
                        title: `New booking from ${booking.fullName || 'Customer'}`,
                        time: booking.createdAt || booking.date,
                        amount: booking.totalPrice || booking.price || booking.amount
                    }));

                bookings.forEach(booking => {
                    const bookingDate = booking.date ? booking.date.split('T')[0] :
                        (booking.createdAt ? booking.createdAt.split('T')[0] : null);

                    const price = Number(booking.totalPrice || booking.price || booking.amount || 0);
                    revenue += price;

                    // Aggregate for chart
                    if (bookingDate && dailyRevenue[bookingDate] !== undefined) {
                        dailyRevenue[bookingDate] += price;
                    }
                });
            }

            if (moviesRes.ok) {
                const moviesData = await moviesRes.json();
                const movieList = Array.isArray(moviesData) ? moviesData : (moviesData.data || []);
                totalMovies = movieList.length;
            }

            // Format data for chart
            const chartData = Object.keys(dailyRevenue).map(date => ({
                date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                revenue: dailyRevenue[date]
            }));

            setRevenueData(chartData);
            setRecentActivity(activities);
            setStats({
                totalBuses,
                totalRoutes,
                totalBookings,

                revenue,
                totalHotels,
                totalMovies
            });

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setIsLoading(false);
        }
    }

    const getTimeAgo = (dateString) => {
        if (!dateString) return 'Recently';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Dashboard Overview
                    </h2>
                    <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
                </div>
                <button
                    onClick={fetchDashboardData}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors shadow-sm hover:shadow-md font-medium"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    label="Total Buses"
                    value={stats.totalBuses}
                    color="indigo"
                    isLoading={isLoading}
                    trend={{ direction: 'up', value: 12 }}
                    icon={
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                    }
                />
                <StatsCard
                    label="Total Routes"
                    value={stats.totalRoutes}
                    color="green"
                    isLoading={isLoading}
                    trend={{ direction: 'up', value: 8 }}
                    icon={
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                    }
                />
                <StatsCard
                    label="Total Bookings"
                    value={stats.totalBookings}
                    color="purple"
                    isLoading={isLoading}
                    trend={{ direction: 'up', value: 23 }}
                    icon={
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                    }
                />
                <StatsCard
                    label="Total Revenue"
                    value={`Rs. ${stats.revenue.toLocaleString()}`}
                    color="orange"
                    isLoading={isLoading}
                    trend={{ direction: 'up', value: 15 }}
                    icon={
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
                <StatsCard
                    label="Total Hotels"
                    value={stats.totalHotels}
                    color="teal"
                    isLoading={isLoading}
                    trend={{ direction: 'up', value: 5 }}
                    icon={
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    }
                />
                <StatsCard
                    label="Now Showing"
                    value={stats.totalMovies}
                    color="pink"
                    isLoading={isLoading}
                    trend={{ direction: 'up', value: 2 }}
                    icon={
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                        </svg>
                    }
                />
            </div>

            {/* Charts and Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Revenue Overview</h3>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 text-sm bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg font-medium">7 Days</button>
                            <button className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">30 Days</button>
                        </div>
                    </div>
                    <div className="h-80">
                        <RevenueChart data={revenueData} />
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h3>
                    <div className="space-y-4">
                        {recentActivity.length > 0 ? (
                            recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{activity.title}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{getTimeAgo(activity.time)}</p>
                                            {activity.amount && (
                                                <>
                                                    <span className="text-gray-300 dark:text-gray-600">•</span>
                                                    <p className="text-xs font-semibold text-green-600 dark:text-green-400">Rs. {activity.amount}</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                                <p className="text-sm">No recent activity</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <div className="text-left">
                            <p className="font-semibold">Add New Bus</p>
                            <p className="text-sm text-indigo-100">Register a new bus</p>
                        </div>
                    </div>
                </button>

                <button className="p-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                        </div>
                        <div className="text-left">
                            <p className="font-semibold">Create Route</p>
                            <p className="text-sm text-green-100">Add a new route</p>
                        </div>
                    </div>
                </button>

                <button className="p-6 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div className="text-left">
                            <p className="font-semibold">View Reports</p>
                            <p className="text-sm text-orange-100">Analytics & insights</p>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    );
}
