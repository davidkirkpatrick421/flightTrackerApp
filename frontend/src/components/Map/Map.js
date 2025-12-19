import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './Map.css';

// Set token
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

function Map() {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [lng] = useState(-20);
    const [lat] = useState(30);
    const [zoom] = useState(2);

    useEffect(() => {
        if (map.current) return;

        console.log('🗺️ Initializing map...');

        try {
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/dark-v11',
                center: [lng, lat],
                zoom: zoom,
                // Add these options to help with initialization
                attributionControl: false,
                refreshExpiredTiles: false,
                maxBounds: [[-180, -85], [180, 85]]
            });

            // Add controls
            map.current.addControl(
                new mapboxgl.NavigationControl({
                    visualizePitch: true
                }),
                'top-right'
            );

            // Simpler load handler
            map.current.on('load', () => {
                console.log('✅ Map loaded!');

                // Set projection after load
                map.current.setProjection('globe');

                // Add atmosphere
                map.current.setFog({
                    color: 'rgb(186, 210, 235)',
                    'high-color': 'rgb(36, 92, 223)',
                    'horizon-blend': 0.02,
                    'space-color': 'rgb(11, 11, 25)',
                    'star-intensity': 0.6
                });
            });

            // Better error handling
            map.current.on('error', (e) => {
                console.error('❌ Map error:', e.error);
            });

            map.current.on('style.load', () => {
                console.log('✅ Style loaded!');
            });

        } catch (err) {
            console.error('❌ Failed to initialize:', err);
        }

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, [lng, lat, zoom]);

    return (
        <div className="map-wrapper">
            <div ref={mapContainer} className="map-container" />
        </div>
    );
}

export default Map;