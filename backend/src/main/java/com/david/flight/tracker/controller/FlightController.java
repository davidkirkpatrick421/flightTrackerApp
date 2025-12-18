package com.david.flight.tracker.controller;

import com.david.flight.tracker.model.entity.FlightState;
import com.david.flight.tracker.repository.FlightStateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/flights")
@CrossOrigin(origins = "*")  // Allow frontend to call this API
public class FlightController {

    @Autowired
    private FlightStateRepository flightStateRepository;

    /**
     * Get current positions of all flights
     * This is what your map will call
     */
    @GetMapping("/current")
    public List<FlightState> getCurrentFlights() {
        // Get flights updated in the last 5 minutes
        LocalDateTime fiveMinutesAgo = LocalDateTime.now().minusMinutes(5);
        return flightStateRepository.findLatestPositions(fiveMinutesAgo);
    }

    /**
     * Get flight trail for specific aircraft
     */
    @GetMapping("/{icao24}/trail")
    public List<FlightState> getFlightTrail(@PathVariable String icao24) {
        // Get trail from last 2 hours
        LocalDateTime twoHoursAgo = LocalDateTime.now().minusHours(2);
        return flightStateRepository.findFlightTrail(icao24, twoHoursAgo);
    }

    /**
     * Search flights by callsign
     */
    @GetMapping("/search")
    public List<FlightState> searchFlights(@RequestParam String callsign) {
        return flightStateRepository.findByCallsignContainingIgnoreCase(callsign);
    }

    /**
     * Get statistics
     */
    @GetMapping("/stats")
    public FlightStats getStats() {
        LocalDateTime fiveMinutesAgo = LocalDateTime.now().minusMinutes(5);
        long totalFlights = flightStateRepository.count();
        long currentlyFlying = flightStateRepository.countByOnGroundFalseAndTimestampAfter(fiveMinutesAgo);

        return new FlightStats(totalFlights, currentlyFlying);
    }

    // Inner class for stats response
    public static class FlightStats {
        public long totalRecords;
        public long currentlyFlying;

        public FlightStats(long totalRecords, long currentlyFlying) {
            this.totalRecords = totalRecords;
            this.currentlyFlying = currentlyFlying;
        }
    }
}