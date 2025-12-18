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

    private int successfulFetches = 0;
    private int failedFetches = 0;
    private LocalDateTime lastSuccessfulFetch = null;

    /**
     * Fetch flights every 3 minutes (180,000 milliseconds)
     * OpenSky allows ~400 calls per day = 1 every 3.6 minutes
     * We use 3 minutes to be safe
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
            } else {
                failedFetches++;
                logger.warn("⚠️ Fetch returned 0 flights | Failures: {}", failedFetches);
            }

        } catch (Exception e) {
            failedFetches++;
            logger.error("❌ Scheduled fetch failed: {} | Failures: {}", e.getMessage(), failedFetches);
        }

        logger.info("=== Scheduled flight fetch completed ===");
    }

    /**
     * Clean up old flight data every hour
     * Keep only last 24 hours of data
     */
    @Scheduled(cron = "0 0 * * * *")  // Every hour at minute 0
    public void cleanupOldFlights() {
        logger.info("=== Starting cleanup of old flight data ===");

        try {
            LocalDateTime cutoff = LocalDateTime.now().minusHours(24);
            long countBefore = flightStateRepository.count();

            flightStateRepository.deleteByTimestampBefore(cutoff);

            long countAfter = flightStateRepository.count();
            long deleted = countBefore - countAfter;

            logger.info("✅ Cleanup complete: Deleted {} old records | Remaining: {}", deleted, countAfter);

        } catch (Exception e) {
            logger.error("❌ Cleanup failed: {}", e.getMessage());
        }
    }

    /**
     * Log statistics every 10 minutes
     */
    @Scheduled(fixedDelay = 600000)  // 10 minutes
    public void logStatistics() {
        long totalFlights = flightStateRepository.count();
        LocalDateTime fiveMinAgo = LocalDateTime.now().minusMinutes(5);
        long activeFlights = flightStateRepository.countByOnGroundFalseAndTimestampAfter(fiveMinAgo);

        String lastFetch = lastSuccessfulFetch != null
                ? lastSuccessfulFetch.format(DateTimeFormatter.ofPattern("HH:mm:ss"))
                : "Never";

        logger.info("📊 STATS: Total records: {} | Active flights: {} | Last fetch: {} | Success/Fail: {}/{}",
                totalFlights, activeFlights, lastFetch, successfulFetches, failedFetches);
    }
}