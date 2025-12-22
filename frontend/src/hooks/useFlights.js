import { useState, useEffect, useCallback } from 'react';
import { getCurrentFlights } from '../services/api';

export const useFlights = () => {
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchFlights = useCallback(async () => {
        try {
            setLoading(true);
            console.log('🛫 Fetching flights...');

            const data = await getCurrentFlights();

            console.log(`✅ Fetched ${data.length} flights`);
            setFlights(data);
            setError(null);

        } catch (err) {
            console.error('❌ Error fetching flights:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch on mount
    useEffect(() => {
        fetchFlights();
    }, [fetchFlights]);

    return {
        flights,
        loading,
        error,
        refetch: fetchFlights
    };
};