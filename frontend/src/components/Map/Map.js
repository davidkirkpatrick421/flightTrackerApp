import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './Map.css';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

function Map({ flights }) {
    const mapContainer = useRef(null);
    const map = useRef(null);

    // Initialize map
    useEffect(() => {
        if (map.current) return;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/navigation-night-v1',
            center: [-20, 30],
            zoom: 2,
            projection: 'globe'
        });

        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        map.current.on('load', () => {
            console.log('Map loaded');

            // Add source for flight data
            map.current.addSource('flights', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: []
                },
                cluster: true,
                clusterMaxZoom: 10,
                clusterRadius: 50
            });

            // Cluster circles
            map.current.addLayer({
                id: 'clusters',
                type: 'circle',
                source: 'flights',
                filter: ['has', 'point_count'],
                paint: {
                    'circle-color': [
                        'step',
                        ['get', 'point_count'],
                        '#fbbf24',
                        50,
                        '#f59e0b',
                        100,
                        '#d97706'
                    ],
                    'circle-radius': [
                        'step',
                        ['get', 'point_count'],
                        15,
                        50,
                        20,
                        100,
                        25
                    ],
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#fff',
                    'circle-opacity': 0.8
                }
            });

            // Cluster count labels
            map.current.addLayer({
                id: 'cluster-count',
                type: 'symbol',
                source: 'flights',
                filter: ['has', 'point_count'],
                layout: {
                    'text-field': '{point_count_abbreviated}',
                    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                    'text-size': 12
                },
                paint: {
                    'text-color': '#ffffff'
                }
            });

            // Individual flight points
            map.current.addLayer({
                id: 'unclustered-point',
                type: 'circle',
                source: 'flights',
                filter: ['!', ['has', 'point_count']],
                paint: {
                    'circle-color': [
                        'case',
                        ['get', 'onGround'],
                        '#64748b',
                        '#fbbf24'
                    ],
                    'circle-radius': 6,
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#fff',
                    'circle-opacity': 0.9
                }
            });

            // Click on cluster to zoom
            map.current.on('click', 'clusters', (e) => {
                const features = map.current.queryRenderedFeatures(e.point, {
                    layers: ['clusters']
                });
                const clusterId = features[0].properties.cluster_id;
                map.current.getSource('flights').getClusterExpansionZoom(
                    clusterId,
                    (err, zoom) => {
                        if (err) return;

                        map.current.easeTo({
                            center: features[0].geometry.coordinates,
                            zoom: zoom
                        });
                    }
                );
            });

            // Show popup on individual flight click
            map.current.on('click', 'unclustered-point', (e) => {
                const coordinates = e.features[0].geometry.coordinates.slice();
                const props = e.features[0].properties;

                const popup = new mapboxgl.Popup()
                    .setLngLat(coordinates)
                    .setHTML(`
            <div style="font-family: 'Inter', sans-serif; color: #f1f5f9; padding: 4px;">
              <div style="
                font-family: 'JetBrains Mono', monospace;
                font-weight: 700;
                font-size: 14px;
                color: #fbbf24;
                margin-bottom: 8px;
                padding-bottom: 8px;
                border-bottom: 1px solid #334155;
                letter-spacing: 1px;
              ">
                ${props.callsign || props.icao24}
              </div>
              <div style="font-size: 12px; line-height: 1.8;">
                <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                  <span style="color: #94a3b8; font-size: 10px; text-transform: uppercase; font-weight: 600;">Country</span>
                  <span>${props.originCountry || 'Unknown'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                  <span style="color: #94a3b8; font-size: 10px; text-transform: uppercase; font-weight: 600;">Altitude</span>
                  <span>${props.altitude ? Math.round(props.altitude) + ' m' : 'N/A'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                  <span style="color: #94a3b8; font-size: 10px; text-transform: uppercase; font-weight: 600;">Speed</span>
                  <span>${props.velocity ? Math.round(props.velocity * 3.6) + ' km/h' : 'N/A'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin: 4px 0;">
                  <span style="color: #94a3b8; font-size: 10px; text-transform: uppercase; font-weight: 600;">Status</span>
                  <span style="color: ${props.onGround ? '#64748b' : '#10b981'};">
                    ${props.onGround ? 'On Ground' : 'In Air'}
                  </span>
                </div>
                <button 
                  id="show-trail-${props.icao24}" 
                  style="
                    width: 100%;
                    margin-top: 8px;
                    padding: 8px;
                    background: transparent;
                    border: 1px solid #fbbf24;
                    color: #fbbf24;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 10px;
                    font-weight: 700;
                    cursor: pointer;
                    border-radius: 4px;
                    text-transform: uppercase;
                  "
                >
                  Show Flight Trail
                </button>
              </div>
            </div>
          `)
                    .addTo(map.current);

                setTimeout(() => {
                    const trailButton = document.getElementById(`show-trail-${props.icao24}`);
                    if (trailButton) {
                        trailButton.onclick = () => {
                            showFlightTrail(props.icao24);
                            popup.remove();
                        };
                    }
                }, 100);
            });

            // Cursor changes
            map.current.on('mouseenter', 'clusters', () => {
                map.current.getCanvas().style.cursor = 'pointer';
            });
            map.current.on('mouseleave', 'clusters', () => {
                map.current.getCanvas().style.cursor = '';
            });
            map.current.on('mouseenter', 'unclustered-point', () => {
                map.current.getCanvas().style.cursor = 'pointer';
            });
            map.current.on('mouseleave', 'unclustered-point', () => {
                map.current.getCanvas().style.cursor = '';
            });
        });

    }, []);

    // Show flight trail function
    const showFlightTrail = async (icao24) => {
        try {
            console.log('🛤️ Fetching trail for:', icao24);

            const response = await fetch(`http://localhost:8080/api/flights/${icao24}/trail`);
            const trail = await response.json();

            console.log('✅ Trail data:', trail.length, 'positions');

            if (trail.length < 2) {
                alert('Not enough position data to show trail');
                return;
            }

            const coordinates = trail.map(pos => [pos.longitude, pos.latitude]);

            const trailData = {
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: coordinates
                }
            };

            // Remove old trail
            if (map.current.getLayer('flight-trail')) {
                map.current.removeLayer('flight-trail');
            }
            if (map.current.getSource('trail')) {
                map.current.removeSource('trail');
            }

            // Add new trail
            map.current.addSource('trail', {
                type: 'geojson',
                data: trailData
            });

            map.current.addLayer({
                id: 'flight-trail',
                type: 'line',
                source: 'trail',
                paint: {
                    'line-color': '#fbbf24',
                    'line-width': 3,
                    'line-opacity': 0.8
                }
            });

            // Zoom to trail
            const bounds = coordinates.reduce((bounds, coord) => {
                return bounds.extend(coord);
            }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

            map.current.fitBounds(bounds, {
                padding: 100,
                duration: 1000
            });

        } catch (error) {
            console.error('❌ Error fetching trail:', error);
            alert('Error loading flight trail');
        }
    };

    // Update flights data
    useEffect(() => {
        if (!map.current || !flights || flights.length === 0) return;

        if (!map.current.isStyleLoaded()) {
            map.current.once('load', () => updateFlights());
            return;
        }

        updateFlights();

        function updateFlights() {
            console.log('Updating', flights.length, 'flights with clustering');

            const geojson = {
                type: 'FeatureCollection',
                features: flights
                    .filter(f => f.latitude && f.longitude)
                    .map(flight => ({
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [flight.longitude, flight.latitude]
                        },
                        properties: {
                            icao24: flight.icao24,
                            callsign: flight.callsign,
                            originCountry: flight.originCountry,
                            altitude: flight.altitude,
                            velocity: flight.velocity,
                            heading: flight.heading,
                            onGround: flight.onGround
                        }
                    }))
            };

            const source = map.current.getSource('flights');
            if (source) {
                source.setData(geojson);
                console.log('✅ Clustered data updated');
            }
        }

    }, [flights]);

    return <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />;
}

export default Map;