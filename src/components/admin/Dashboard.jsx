import React, { useState, useEffect } from 'react';
import ApiService from '../../services/api.service';
import API_CONFIG from '../../config/api';
import { RevenueChart } from './RevenueChart';

export function Dashboard() {
    const [stats, setStats] = useState([
        { label: 'Total Buses', value: '0', color: 'bg-blue-500' },
        { label: 'Total Routes', value: '0', color: 'bg-green-500' },
        { label: 'Bookings Today', value: '0', color: 'bg-purple-500' },
        { label: 'Revenue', value: 'Rs. 0', color: 'bg-orange-500' },
    ]);
    const [revenueData, setRevenueData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    async function fetchDashboardData() {
        try {
            const [busesRes, routesRes, bookingsRes] = await Promise.all([
                ApiService.get(API_CONFIG.ENDPOINTS.GET_ALL_BUSES),
                ApiService.get(API_CONFIG.ENDPOINTS.GET_ROUTES),
                ApiService.get(API_CONFIG.ENDPOINTS.GET_ALL_BOOKINGS)
            ]);

            let totalBuses = 0;
            let totalRoutes = 0;
            let bookingsToday = 0;
            let revenue = 0;
            let dailyRevenue = {};

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

                // Calculate today's bookings and total revenue
                const today = new Date().toISOString().split('T')[0];

                // Initialize last 7 days for chart
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const dateStr = d.toISOString().split('T')[0];
                    dailyRevenue[dateStr] = 0;
                }

                bookings.forEach(booking => {
                    const bookingDate = booking.date ? booking.date.split('T')[0] :
                        (booking.createdAt ? booking.createdAt.split('T')[0] : null);

                    const price = Number(booking.totalPrice || booking.price || booking.amount || 0);

                    if (bookingDate === today) {
                        bookingsToday++;
                    }

                    revenue += price;

                    // Aggregate for chart
                    if (bookingDate && dailyRevenue[bookingDate] !== undefined) {
                        dailyRevenue[bookingDate] += price;
                    }
                });
            }

            // Format data for chart
            const chartData = Object.keys(dailyRevenue).map(date => ({
                date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                revenue: dailyRevenue[date]
            }));

            setRevenueData(chartData);

            setStats([
                { label: 'Total Buses', value: totalBuses.toString(), color: 'bg-blue-500' },
                { label: 'Total Routes', value: totalRoutes.toString(), color: 'bg-green-500' },
                { label: 'Total Bookings', value: bookingsToday.toString(), color: 'bg-purple-500' },
                { label: 'Total Revenue', value: `Rs. ${revenue.toLocaleString()}`, color: 'bg-orange-500' },
            ]);

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
                <button
                    onClick={fetchDashboardData}
                    className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center gap-1"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-transform hover:scale-105 duration-200">
                        <div className={`w-12 h-12 ${stat.color} rounded-lg mb-4 opacity-10`}></div>
                        <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-800 mt-1">
                            {isLoading ? '...' : stat.value}
                        </p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Revenue Overview</h3>
                    <div className="h-80">
                        <RevenueChart data={revenueData} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h3>
                    <div className="flex items-center justify-center h-full text-gray-400">
                        <p>Coming Soon</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
