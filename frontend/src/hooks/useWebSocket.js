import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export const useWebSocket = (onFlightUpdate) => {
    const [wsConnected, setWsConnected] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);
    const clientRef = useRef(null);

    useEffect(() => {
        const wsUrl = 'http://localhost:8080/ws-flights';
        console.log('🔌 Setting up WebSocket');

        const client = new Client({
            webSocketFactory: () => new SockJS(wsUrl),
            reconnectDelay: 5000,

            onConnect: () => {
                console.log('✅ Connected');
                setWsConnected(true);

                client.subscribe('/topic/flight-updates', (message) => {
                    console.log('📡 Update received');
                    setLastUpdate(new Date());
                    if (onFlightUpdate) {
                        onFlightUpdate(JSON.parse(message.body));
                    }
                });
            },

            onDisconnect: () => {
                console.log('❌ Disconnected');
                setWsConnected(false);
            },
        });

        client.activate();
        clientRef.current = client;

        return () => {
            console.log('🧹 Cleanup');
            if (clientRef.current) {
                clientRef.current.deactivate();
            }
        };
    }, [onFlightUpdate]);

    return { wsConnected, lastUpdate };
};