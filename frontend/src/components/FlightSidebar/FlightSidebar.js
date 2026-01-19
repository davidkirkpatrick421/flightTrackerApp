import React from 'react';
import './FlightSidebar.css';

function FlightSidebar({ flight, onClose, onShowTrail }) {
    if (!flight) return null;

    return (
        <>
            <div className={`sidebar-overlay ${flight ? 'visible' : ''}`} onClick={onClose} />
            <aside className={`flight-sidebar ${flight ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="flight-callsign">
                        {flight.callsign || flight.icao24}
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className="sidebar-content">
                    {/* Aircraft Info */}
                    <div className="info-section">
                        <div className="section-title">AIRCRAFT</div>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">ICAO24</span>
                                <span className="info-value">{flight.icao24}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Country</span>
                                <span className="info-value">{flight.originCountry || 'Unknown'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Position */}
                    <div className="info-section">
                        <div className="section-title">POSITION</div>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Latitude</span>
                                <span className="info-value">{flight.latitude?.toFixed(4)}°</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Longitude</span>
                                <span className="info-value">{flight.longitude?.toFixed(4)}°</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Altitude</span>
                                <span className="info-value">
                  {flight.altitude ? `${Math.round(flight.altitude)} m` : 'N/A'}
                                    {flight.altitude && (
                                        <span className="info-subvalue">
                      ({Math.round(flight.altitude * 3.281)} ft)
                    </span>
                                    )}
                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Heading</span>
                                <span className="info-value">
                  {flight.heading ? `${Math.round(flight.heading)}°` : 'N/A'}
                                    {flight.heading !== null && (
                                        <span className="info-subvalue">
                      {getCardinalDirection(flight.heading)}
                    </span>
                                    )}
                </span>
                            </div>
                        </div>
                    </div>

                    {/* Flight Data */}
                    <div className="info-section">
                        <div className="section-title">FLIGHT DATA</div>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Speed</span>
                                <span className="info-value">
                  {flight.velocity ? `${Math.round(flight.velocity)} m/s` : 'N/A'}
                                    {flight.velocity && (
                                        <span className="info-subvalue">
                      ({Math.round(flight.velocity * 1.944)} kts)
                    </span>
                                    )}
                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Vertical Rate</span>
                                <span className="info-value">
                  {flight.verticalRate !== null && flight.verticalRate !== undefined
                      ? `${flight.verticalRate > 0 ? '↑' : flight.verticalRate < 0 ? '↓' : '→'} ${Math.abs(flight.verticalRate)} m/s`
                      : 'N/A'}
                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Status</span>
                                <span className={`info-value status-${flight.onGround ? 'ground' : 'air'}`}>
                  {flight.onGround ? '⬤ On Ground' : '⬤ In Air'}
                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Last Update</span>
                                <span className="info-value">
                  {flight.timestamp ? formatTime(flight.timestamp) : 'N/A'}
                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="sidebar-actions">
                        <button
                            className="action-btn primary"
                            onClick={() => {
                                if (window.showFlightTrail) {
                                    window.showFlightTrail(flight.icao24);
                                }
                                onClose(); // Close sidebar after showing trail
                            }}
                        >
                            🛤️ SHOW FLIGHT TRAIL
                        </button>
                        <button
                            className="action-btn secondary"
                            onClick={() => copyToClipboard(flight.icao24)}
                        >
                            📋 COPY ICAO24
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}

// Helper functions
function getCardinalDirection(heading) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(heading / 45) % 8;
    return directions[index];
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    console.log('📋 Copied:', text);
}

export default FlightSidebar;