import React, { useEffect, useState } from 'react';
import Map from './components/Map/Map';
import { getCurrentFlights, getFlightStats } from './services/api';
import './App.css';

function App() {
    const [isConnected, setIsConnected] = useState(false);
    const [flightCount, setFlightCount] = useState(0);
    const [error, setError] = useState(null);

    useEffect(() => {
        const testConnection = async () => {
            try {
                console.log('🔌 Attempting to connect to backend...');
                console.log('📍 API URL:', process.env.REACT_APP_API_URL || 'http://localhost:8080');

                const stats = await getFlightStats();

                console.log('✅ Backend connected successfully!');
                console.log('📊 Stats:', stats);

                setIsConnected(true);
                setFlightCount(stats.currentlyFlying);
                setError(null);

            } catch (err) {
                console.error('❌ Backend connection failed:', err);
                console.error('📍 Error details:', {
                    message: err.message,
                    response: err.response,
                    code: err.code
                });

                setIsConnected(false);
                setError(err.message);
            }
        };

        testConnection();

        // Retry every 10 seconds if failed
        const interval = setInterval(() => {
            if (!isConnected) {
                console.log('🔄 Retrying backend connection...');
                testConnection();
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [isConnected]);

    return (
        <div className="App">
            <header className="app-header">
                <div className="logo">FLIGHT TRACKER</div>
                <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
                    <span className="status-dot"></span>
                    {isConnected ? `LIVE (${flightCount.toLocaleString()} flights)` : 'CONNECTING...'}
                </div>
                {error && (
                    <div className="error-badge" title={error}>
                        ⚠️ {error}
                    </div>
                )}
            </header>

            <main className="app-main">
                <Map />
            </main>
        </div>
    );
}

export default App;