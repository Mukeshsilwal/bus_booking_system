import React, { useState } from 'react';
import { DataTable } from './DataTable';

export function HotelManager() {
    // Dummy data for demonstration since no API is available yet
    const [hotels] = useState([
        { id: 1, name: 'Hotel Himalaya', location: 'Kathmandu', rating: 4.5, rooms: 50, priceRange: 'Rs. 5000 - 15000' },
        { id: 2, name: 'Pokhara Grande', location: 'Pokhara', rating: 5.0, rooms: 120, priceRange: 'Rs. 8000 - 25000' },
        { id: 3, name: 'Hotel Mystic Mountain', location: 'Nagarkot', rating: 4.8, rooms: 35, priceRange: 'Rs. 12000 - 30000' },
        { id: 4, name: 'Tiger Palace Resort', location: 'Bhairahawa', rating: 5.0, rooms: 100, priceRange: 'Rs. 10000 - 40000' },
        { id: 5, name: 'Hotel Barahi', location: 'Pokhara', rating: 4.2, rooms: 80, priceRange: 'Rs. 6000 - 18000' },
    ]);

    const hotelColumns = [
        { key: 'id', label: 'ID', sortable: true },
        {
            key: 'name',
            label: 'Hotel Name',
            sortable: true,
            render: (name) => <span className="font-medium text-indigo-900">{name}</span>
        },
        { key: 'location', label: 'Location', sortable: true },
        {
            key: 'rating',
            label: 'Rating',
            sortable: true,
            render: (rating) => (
                <div className="flex items-center gap-1">
                    <span className="font-bold text-gray-700">{rating}</span>
                    <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                </div>
            )
        },
        { key: 'rooms', label: 'Total Rooms', sortable: true },
        { key: 'priceRange', label: 'Price Range', sortable: false }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                        Hotel Management
                    </h2>
                    <p className="text-gray-600 mt-1">Manage hotels and room inventory</p>
                </div>
                <button
                    className="px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Hotel
                </button>
            </div>

            {/* Hotel List */}
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Registered Hotels</h3>
                <DataTable
                    columns={hotelColumns}
                    data={hotels}
                    itemsPerPage={10}
                    searchable={true}
                    exportable={true}
                />
            </div>
        </div>
    );
}
