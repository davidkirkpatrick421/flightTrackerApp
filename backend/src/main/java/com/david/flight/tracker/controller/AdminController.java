package com.david.flight.tracker.controller;

import com.david.flight.tracker.repository.FlightStateRepository;
import com.david.flight.tracker.service.OpenSkyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private OpenSkyService openSkyService;

    @Autowired
    private FlightStateRepository flightStateRepository;

    /**
     * Manually trigger a flight fetch
     */
    @PostMapping("/fetch-now")
    public Map<String, Object> fetchNow() {
        Map<String, Object> response = new HashMap<>();

        try {
            int count = openSkyService.fetchAndSaveFlights();
            long total = flightStateRepository.count();

            response.put("success", true);
            response.put("flightsFetched", count);
            response.put("totalInDatabase", total);
            response.put("timestamp", LocalDateTime.now().toString());

        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }

        return response;
    }

    /**
     * Clean up old data manually
     */
    @PostMapping("/cleanup")
    public Map<String, Object> cleanup(@RequestParam(defaultValue = "24") int hours) {
        Map<String, Object> response = new HashMap<>();

        try {
            LocalDateTime cutoff = LocalDateTime.now().minusHours(hours);
            long countBefore = flightStateRepository.count();

            flightStateRepository.deleteByTimestampBefore(cutoff);

            long countAfter = flightStateRepository.count();
            long deleted = countBefore - countAfter;

            response.put("success", true);
            response.put("recordsDeleted", deleted);
            response.put("recordsRemaining", countAfter);
            response.put("cutoffTime", cutoff.toString());

        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }

        return response;
    }

    /**
     * Get system health status
     */
    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> health = new HashMap<>();

        long totalRecords = flightStateRepository.count();
        LocalDateTime fiveMinAgo = LocalDateTime.now().minusMinutes(5);
        long activeFlights = flightStateRepository.countByOnGroundFalseAndTimestampAfter(fiveMinAgo);

        // Calculate database size estimate
        double estimatedSizeMB = (totalRecords * 0.0005); // ~500 bytes per record

        health.put("status", "healthy");
        health.put("totalRecords", totalRecords);
        health.put("activeFlights", activeFlights);
        health.put("estimatedDatabaseSizeMB", String.format("%.2f", estimatedSizeMB));
        health.put("timestamp", LocalDateTime.now().toString());

        return health;
    }

    /**
     * Clear entire database (use with caution!)
     */
    @PostMapping("/clear-all")
    public Map<String, Object> clearAll() {
        Map<String, Object> response = new HashMap<>();

        long count = flightStateRepository.count();
        flightStateRepository.deleteAll();

        response.put("success", true);
        response.put("recordsDeleted", count);
        response.put("message", "Database cleared completely");

        return response;
    }
}