import React from 'react';

export function Dashboard() {
    const stats = [
        { label: 'Total Buses', value: '12', color: 'bg-blue-500' },
        { label: 'Total Routes', value: '8', color: 'bg-green-500' },
        { label: 'Bookings Today', value: '24', color: 'bg-purple-500' },
        { label: 'Revenue', value: 'Rs. 45,000', color: 'bg-orange-500' },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className={`w-12 h-12 ${stat.color} rounded-lg mb-4 opacity-10`}></div>
                        <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
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
