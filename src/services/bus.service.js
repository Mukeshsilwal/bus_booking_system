import apiService from './api.service';
import API_CONFIG from '../config/api';

class BusService {
    /**
     * Search for buses based on source, destination and date
     * @param {Object} params - Search parameters
     * @param {string} params.source - Source city
     * @param {string} params.destination - Destination city
     * @param {string} params.date - Travel date (YYYY-MM-DD)
     * @returns {Promise<Array>} List of available buses
     */
    async searchBuses({ source, destination, date, cursor = null, pageSize = 10 }) {
        const response = await apiService.post(API_CONFIG.ENDPOINTS.SEARCH_BUSES, {
            source,
            destination,
            date,
            cursor,
            pageSize
        });

        if (!response.ok) {
            throw new Error('Failed to search buses');
        }

        return await response.json();
    }

    /**
     * Get all available bus stops/cities
     * @returns {Promise<Array>} List of bus stops
     */
    async getBusStops() {
        const response = await apiService.get(API_CONFIG.ENDPOINTS.GET_BUS_STOPS);

        if (!response.ok) {
            throw new Error('Failed to fetch bus stops');
        }

        return await response.json();
    }

    /**
     * Get details for a specific bus
     * @param {string} busId - Bus ID
     * @returns {Promise<Object>} Bus details
     */
    async getBusDetails(busId) {
        // Assuming there's an endpoint for this, or we might need to implement it
        // For now, this is a placeholder to match the architecture plan
        const response = await apiService.get(`${API_CONFIG.ENDPOINTS.GET_BUS_BY_ID}/${busId}`);

        if (!response.ok) {
            throw new Error('Failed to fetch bus details');
        }

        return await response.json();
    }
}

export const busService = new BusService();
export default busService;
