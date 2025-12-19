import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

console.log('🔧 API Service initialized with base URL:', API_BASE_URL);

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Fetch current flights
export const getCurrentFlights = async () => {
    try {
        console.log('📡 Fetching current flights...');
        const response = await api.get('/api/flights/current');
        console.log('✅ Flights fetched:', response.data.length, 'flights');
        return response.data;
    } catch (error) {
        console.error('❌ Error fetching flights:', error);
        throw error;
    }
};

// Fetch flight statistics
export const getFlightStats = async () => {
    try {
        console.log('📡 Fetching flight stats...');
        const response = await api.get('/api/flights/stats');
        console.log('✅ Stats fetched:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error fetching stats:', error);
        throw error;
    }
};

// Fetch trail for specific flight
export const getFlightTrail = async (icao24) => {
    try {
        const response = await api.get(`/api/flights/${icao24}/trail`);
        return response.data;
    } catch (error) {
        console.error('❌ Error fetching trail:', error);
        throw error;
    }
};

// Search flights by callsign
export const searchFlights = async (callsign) => {
    try {
        const response = await api.get('/api/flights/search', {
            params: { callsign }
        });
        return response.data;
    } catch (error) {
        console.error('❌ Error searching flights:', error);
        throw error;
    }
};

export default api;