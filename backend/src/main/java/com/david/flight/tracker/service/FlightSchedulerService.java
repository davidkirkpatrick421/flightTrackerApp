package com.david.flight.tracker.service;

import com.david.flight.tracker.repository.FlightStateRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class FlightSchedulerService {

    private static final Logger logger = LoggerFactory.getLogger(FlightSchedulerService.class);

    @Autowired
    private OpenSkyService openSkyService;

    @Autowired
    private FlightStateRepository flightStateRepository;

    @Autowired
    private WebSocketService webSocketService;  // Add this

    private int successfulFetches = 0;
    private int failedFetches = 0;
    private LocalDateTime lastSuccessfulFetch = null;

    /**
     * Fetch flights every 3 minutes
     */
    @Scheduled(fixedDelay = 180000, initialDelay = 10000)
    public void scheduledFlightFetch() {
        logger.info("=== Scheduled flight fetch started ===");

        try {
            int flightCount = openSkyService.fetchAndSaveFlights();

            if (flightCount > 0) {
                successfulFetches++;
                lastSuccessfulFetch = LocalDateTime.now();

                long totalFlights = flightStateRepository.count();

                logger.info("✅ Fetch successful: {} new flights | Total in DB: {} | Success rate: {}/{}",
                        flightCount, totalFlights, successfulFetches, (successfulFetches + failedFetches));

                // Broadcast to all WebSocket clients
                webSocketService.broadcastFlightUpdate(flightCount);

            } else {
                failedFetches++;
                logger.warn("⚠️ Fetch returned 0 flights | Failures: {}", failedFetches);

                // Notify clients of failure
                webSocketService.broadcastNotification(
                        "Flight data fetch returned no results",
                        "WARNING"
                );
            }

        } catch (Exception e) {
            failedFetches++;
            logger.error("❌ Scheduled fetch failed: {} | Failures: {}", e.getMessage(), failedFetches);

            // Notify clients of error
            webSocketService.broadcastNotification(
                    "Flight data fetch failed: " + e.getMessage(),
                    "ERROR"
            );
        }

        logger.info("=== Scheduled flight fetch completed ===");
    }

    /**
     * Clean up old flight data every hour
     */
    @Scheduled(cron = "0 0 * * * *")
    public void cleanupOldFlights() {
        logger.info("=== Starting cleanup of old flight data ===");

        try {
            LocalDateTime cutoff = LocalDateTime.now().minusHours(24);
            long countBefore = flightStateRepository.count();

            flightStateRepository.deleteByTimestampBefore(cutoff);

            long countAfter = flightStateRepository.count();
            long deleted = countBefore - countAfter;

            logger.info("✅ Cleanup complete: Deleted {} old records | Remaining: {}", deleted, countAfter);

            // Notify clients about cleanup
            if (deleted > 0) {
                webSocketService.broadcastNotification(
                        String.format("Cleanup: Removed %d old records", deleted),
                        "INFO"
                );
            }

        } catch (Exception e) {
            logger.error("❌ Cleanup failed: {}", e.getMessage());
        }
    }

    /**
     * Log and broadcast statistics every 10 minutes
     */
    @Scheduled(fixedDelay = 600000)
    public void logStatistics() {
        long totalFlights = flightStateRepository.count();
        LocalDateTime fiveMinAgo = LocalDateTime.now().minusMinutes(5);
        long activeFlights = flightStateRepository.countByOnGroundFalseAndTimestampAfter(fiveMinAgo);

        String lastFetch = lastSuccessfulFetch != null
                ? lastSuccessfulFetch.format(DateTimeFormatter.ofPattern("HH:mm:ss"))
                : "Never";

        logger.info("📊 STATS: Total records: {} | Active flights: {} | Last fetch: {} | Success/Fail: {}/{}",
                totalFlights, activeFlights, lastFetch, successfulFetches, failedFetches);

        // Broadcast statistics to clients
        webSocketService.broadcastStatistics(totalFlights, activeFlights);
    }
}