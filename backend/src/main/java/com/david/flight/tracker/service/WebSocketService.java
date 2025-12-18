package com.david.flight.tracker.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
public class WebSocketService {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketService.class);

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private int messagesSent = 0;

    /**
     * Broadcast flight update to all connected WebSocket clients
     * @param flightCount Number of flights updated
     */
    public void broadcastFlightUpdate(int flightCount) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("type", "FLIGHT_UPDATE");
            message.put("flightCount", flightCount);
            message.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            message.put("message", "New flight data available");

            // Send to all clients subscribed to /topic/flight-updates
            messagingTemplate.convertAndSend("/topic/flight-updates", (Object) message);

            messagesSent++;
            logger.info("📡 WebSocket broadcast sent: {} flights updated | Total broadcasts: {}",
                    flightCount, messagesSent);

        } catch (Exception e) {
            logger.error("❌ Failed to broadcast WebSocket message: {}", e.getMessage());
        }
    }

    /**
     * Send statistics update
     */
    public void broadcastStatistics(long totalRecords, long activeFlights) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("type", "STATISTICS_UPDATE");
            message.put("totalRecords", totalRecords);
            message.put("activeFlights", activeFlights);
            message.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

            messagingTemplate.convertAndSend("/topic/statistics", (Object) message);

            logger.debug("📊 Statistics broadcast sent");

        } catch (Exception e) {
            logger.error("❌ Failed to broadcast statistics: {}", e.getMessage());
        }
    }

    /**
     * Send system notification
     */
    public void broadcastNotification(String message, String level) {
        try {
            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "NOTIFICATION");
            notification.put("level", level);  // INFO, WARNING, ERROR
            notification.put("message", message);
            notification.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

            messagingTemplate.convertAndSend("/topic/notifications", (Object) notification);

            logger.info("🔔 Notification broadcast: {} - {}", level, message);

        } catch (Exception e) {
            logger.error("❌ Failed to broadcast notification: {}", e.getMessage());
        }
    }

    /**
     * Get statistics about WebSocket service
     */
    public int getMessagesSent() {
        return messagesSent;
    }
}