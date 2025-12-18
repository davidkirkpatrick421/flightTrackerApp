package com.david.flight.tracker.service;

import com.david.flight.tracker.dto.OpenSkyResponse;
import com.david.flight.tracker.model.entity.FlightState;
import com.david.flight.tracker.repository.FlightStateRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

@Service
public class OpenSkyService {

    private static final Logger logger = LoggerFactory.getLogger(OpenSkyService.class);

    @Value("${opensky.api.url}")
    private String openSkyApiUrl;

    @Autowired
    private FlightStateRepository flightStateRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Fetch flight data from OpenSky API and save to database
     * @return Number of flights saved
     */
    public int fetchAndSaveFlights() {
        logger.info("Fetching flight data from OpenSky API...");

        try {
            // Call OpenSky API
            OpenSkyResponse response = restTemplate.getForObject(
                    openSkyApiUrl,
                    OpenSkyResponse.class
            );

            if (response == null || response.getStates() == null) {
                logger.warn("No data received from OpenSky API");
                return 0;
            }

            logger.info("Received {} flights from OpenSky API", response.getStates().size());

            // Convert to FlightState entities
            List<FlightState> flightStates = parseFlightData(response);

            // Save to database
            flightStateRepository.saveAll(flightStates);

            logger.info("Successfully saved {} flights to database", flightStates.size());
            return flightStates.size();

        } catch (Exception e) {
            logger.error("Error fetching flights from OpenSky API", e);
            return 0;
        }
    }

    /**
     * Parse OpenSky response into FlightState entities
     */
    private List<FlightState> parseFlightData(OpenSkyResponse response) {
        List<FlightState> flightStates = new ArrayList<>();

        for (List<Object> state : response.getStates()) {
            try {
                FlightState flight = parseFlightState(state);
                if (flight != null) {
                    flightStates.add(flight);
                }
            } catch (Exception e) {
                logger.warn("Error parsing flight state: {}", e.getMessage());
            }
        }

        return flightStates;
    }

    /**
     * Parse a single flight state array into FlightState object
     *
     * OpenSky array format:
     * [0]  icao24          - string
     * [1]  callsign        - string
     * [2]  origin_country  - string
     * [3]  time_position   - int (unix timestamp)
     * [4]  last_contact    - int (unix timestamp)
     * [5]  longitude       - double
     * [6]  latitude        - double
     * [7]  baro_altitude   - double (meters)
     * [8]  on_ground       - boolean
     * [9]  velocity        - double (m/s)
     * [10] true_track      - double (heading in degrees)
     * [11] vertical_rate   - double (m/s)
     */
    private FlightState parseFlightState(List<Object> state) {
        // Must have at least 12 elements
        if (state.size() < 12) {
            return null;
        }

        // Skip if latitude or longitude is null (aircraft not transmitting position)
        if (state.get(5) == null || state.get(6) == null) {
            return null;
        }

        FlightState flight = new FlightState();

        // Required fields
        flight.setIcao24(getString(state.get(0)));
        flight.setLatitude(getDouble(state.get(6)));
        flight.setLongitude(getDouble(state.get(5)));
        flight.setOnGround(getBoolean(state.get(8)));

        // Optional fields
        flight.setCallsign(cleanString(getString(state.get(1))));
        flight.setOriginCountry(getString(state.get(2)));
        flight.setAltitude(getDouble(state.get(7)));
        flight.setVelocity(getDouble(state.get(9)));
        flight.setHeading(getDouble(state.get(10)));
        flight.setVerticalRate(getDouble(state.get(11)));

        // Timestamp - use last_contact (index 4)
        Long lastContact = getLong(state.get(4));
        if (lastContact != null) {
            flight.setTimestamp(
                    LocalDateTime.ofInstant(
                            Instant.ofEpochSecond(lastContact),
                            ZoneId.systemDefault()
                    )
            );
        } else {
            flight.setTimestamp(LocalDateTime.now());
        }

        return flight;
    }

    // Helper methods to safely parse values

    private String getString(Object value) {
        return value != null ? value.toString() : null;
    }

    private String cleanString(String value) {
        return value != null ? value.trim() : null;
    }

    private Double getDouble(Object value) {
        if (value == null) return null;
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }
        try {
            return Double.parseDouble(value.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Boolean getBoolean(Object value) {
        if (value == null) return false;
        if (value instanceof Boolean) {
            return (Boolean) value;
        }
        return Boolean.parseBoolean(value.toString());
    }

    private Long getLong(Object value) {
        if (value == null) return null;
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        try {
            return Long.parseLong(value.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }
}