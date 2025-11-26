import React, { useState, useEffect } from 'react';
import ApiService from '../../services/api.service';
import API_CONFIG from '../../config/api';

export function Dashboard() {
    const [stats, setStats] = useState([
        { label: 'Total Buses', value: '0', color: 'bg-blue-500' },
        { label: 'Total Routes', value: '0', color: 'bg-green-500' },
        { label: 'Bookings Today', value: '0', color: 'bg-purple-500' },
        { label: 'Revenue', value: 'Rs. 0', color: 'bg-orange-500' },
    ]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
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
                const bookings = Array.isArray(bookingsData) ? bookingsData : (bookingsData.bookings || []);

                // Calculate today's bookings and total revenue
                const today = new Date().toISOString().split('T')[0];
                bookings.forEach(booking => {
                    // Assuming booking has a date field, if not we count all or check created_at
                    // For now, let's count all bookings as "Bookings" if no date, or filter if date exists
                    // Also assuming booking has a price/cost field

                    // Check if booking date matches today (if available)
                    if (booking.date && booking.date.startsWith(today)) {
                        bookingsToday++;
                    } else if (booking.createdAt && booking.createdAt.startsWith(today)) {
                        bookingsToday++;
                    }

                    // Sum up revenue (assuming price is available in booking or we need to fetch it)
                    // If booking object has price, use it. Otherwise, we might need to look up bus price.
                    // For simplicity in this overview, we'll try to find a price field.
                    const price = Number(booking.totalPrice || booking.price || booking.amount || 0);
                    revenue += price;
                });

                // If we couldn't filter by today, just show total bookings for now or keep 0 if strict
                if (bookingsToday === 0 && bookings.length > 0) {
                    // Fallback: Show total bookings if no date field found to filter
                    bookingsToday = bookings.length;
                }
            }

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
            <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className={`w-12 h-12 ${stat.color} rounded-lg mb-4 opacity-10`}></div>
                        <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-800 mt-1">
                            {isLoading ? '...' : stat.value}
                        </p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-64 flex items-center justify-center text-gray-400">
                    Chart Placeholder
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-64 flex items-center justify-center text-gray-400">
                    Recent Activity Placeholder
                </div>
            </div>
        </div>
    );
}
