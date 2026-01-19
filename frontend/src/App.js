import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Map from './components/Map/Map';
import SearchBar from './components/SearchBar/SearchBar';
import FlightSidebar from './components/FlightSidebar/FlightSidebar';
import { getFlightStats } from './services/api';
import { useFlights } from './hooks/useFlights';
import { useWebSocket } from './hooks/useWebSocket';
import './App.css';

function App() {
    const [backendConnected, setBackendConnected] = useState(false);
    const { flights, loading, refetch } = useFlights();

    // Search & Filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');

    // Selected flight for sidebar
    const [selectedFlight, setSelectedFlight] = useState(null);

    const handleFlightUpdate = useCallback(() => {
        console.log('🔄 Refetching flights...');
        refetch();
    }, [refetch]);

    const { wsConnected, lastUpdate } = useWebSocket(handleFlightUpdate);

    const [secondsSinceUpdate, setSecondsSinceUpdate] = useState(0);

    useEffect(() => {
        const testConnection = async () => {
            try {
                await getFlightStats();
                setBackendConnected(true);
            } catch (err) {
                setBackendConnected(false);
            }
        };
        testConnection();
    }, []);

    useEffect(() => {
        if (!lastUpdate) return;
        setSecondsSinceUpdate(0);

        const interval = setInterval(() => {
            setSecondsSinceUpdate(s => s + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [lastUpdate]);

    // Filter and search flights
    const filteredFlights = useMemo(() => {
        let result = flights;

        // Apply region filter
        if (activeFilter === 'europe') {
            const europeanCountries = [
                'United Kingdom', 'Germany', 'France', 'Spain', 'Italy',
                'Netherlands', 'Ireland', 'Belgium', 'Switzerland', 'Austria',
                'Poland', 'Portugal', 'Norway', 'Sweden', 'Denmark', 'Finland',
                'Greece', 'Czech Republic', 'Romania', 'Hungary', 'Bulgaria',
                'Croatia', 'Slovakia', 'Luxembourg', 'Iceland', 'Estonia',
                'Latvia', 'Lithuania', 'Slovenia', 'Malta', 'Cyprus'
            ];
            result = result.filter(f =>
                f.originCountry && europeanCountries.includes(f.originCountry)
            );
        } else if (activeFilter === 'americas') {
            const americanCountries = [
                'United States', 'Canada', 'Mexico', 'Brazil', 'Argentina',
                'Chile', 'Colombia', 'Peru', 'Venezuela', 'Ecuador',
                'Bolivia', 'Paraguay', 'Uruguay', 'Costa Rica', 'Panama',
                'Guatemala', 'Honduras', 'Nicaragua', 'El Salvador', 'Jamaica',
                'Dominican Republic', 'Cuba', 'Haiti', 'Trinidad and Tobago'
            ];
            result = result.filter(f =>
                f.originCountry && americanCountries.includes(f.originCountry)
            );
        } else if (activeFilter === 'asia') {
            const asianCountries = [
                'China', 'Japan', 'India', 'South Korea', 'Singapore',
                'Thailand', 'Malaysia', 'Indonesia', 'Philippines', 'Vietnam',
                'Hong Kong', 'Taiwan', 'Pakistan', 'Bangladesh', 'Myanmar',
                'Sri Lanka', 'Nepal', 'Cambodia', 'Laos', 'Mongolia',
                'Australia', 'New Zealand', 'United Arab Emirates', 'Qatar',
                'Saudi Arabia', 'Kuwait', 'Oman', 'Bahrain', 'Israel', 'Turkey'
            ];
            result = result.filter(f =>
                f.originCountry && asianCountries.includes(f.originCountry)
            );
        }

        // Apply search
        if (searchQuery) {
            result = result.filter(f =>
                (f.callsign && f.callsign.toUpperCase().includes(searchQuery)) ||
                (f.icao24 && f.icao24.toUpperCase().includes(searchQuery))
            );
        }

        return result;
    }, [flights, activeFilter, searchQuery]);

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    const handleFilterChange = (filter) => {
        setActiveFilter(filter);
        console.log('🔍 Filter changed to:', filter);
    };

    const handleFlightClick = (flight) => {
        console.log('🎯 handleFlightClick called');
        console.log('🎯 Flight data:', flight);
        console.log('🎯 Setting selectedFlight');
        setSelectedFlight(flight);
        console.log('🎯 selectedFlight state should update now');
    };

    const handleCloseSidebar = () => {
        setSelectedFlight(null);
    };

    const handleShowTrail = (icao24) => {
        console.log('🛤️ Show trail for:', icao24);
        // This will be handled by Map component
        // You can pass a ref or callback to trigger trail display
    };

    return (
        <div className="App">
            <header className="app-header">
                <div className="logo">FLIGHT TRACKER</div>

                <div className="header-stats">
                    <span className="stat-label">TRACKING</span>
                    <span className="stat-value">{filteredFlights.length.toLocaleString()}</span>
                    <span className="stat-label">AIRCRAFT</span>
                </div>

                <div className="header-right">
                    {lastUpdate && (
                        <div className="last-update">
                            <span className="update-label">UPDATED</span>
                            <span className="update-time">{secondsSinceUpdate}s ago</span>
                        </div>
                    )}

                    <button
                        className="refresh-button"
                        onClick={() => {
                            console.log('🔄 Manual refresh triggered');
                            refetch();
                        }}
                        disabled={loading}
                    >
                        {loading ? '⟳' : '↻'} REFRESH
                    </button>

                    <div className={`status-indicator ${wsConnected ? 'connected' : 'disconnected'}`}>
                        <span className="status-dot"></span>
                        {wsConnected ? 'LIVE' : 'CONNECTING...'}
                    </div>
                </div>
            </header>

            <SearchBar
                onSearch={handleSearch}
                onFilterChange={handleFilterChange}
                activeFilter={activeFilter}
            />

            <main className="app-main">
                {loading && (
                    <div className="map-loading">
                        LOADING FLIGHT DATA
                    </div>
                )}
                {!loading && searchQuery && filteredFlights.length === 0 && (
                    <div className="no-results">
                        <div className="no-results-content">
                            <div className="no-results-icon">✈</div>
                            <div className="no-results-text">NO FLIGHTS FOUND</div>
                            <div className="no-results-subtext">
                                No flights match "{searchQuery}"
                            </div>
                        </div>
                    </div>
                )}
                <Map
                    flights={filteredFlights}
                    onFlightClick={handleFlightClick}
                />
            </main>

            <FlightSidebar
                flight={selectedFlight}
                onClose={handleCloseSidebar}
                onShowTrail={handleShowTrail}
            />
        </div>
    );
}

export default App;