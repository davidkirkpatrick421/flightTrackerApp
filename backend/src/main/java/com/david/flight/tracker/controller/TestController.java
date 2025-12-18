package com.david.flight.tracker.controller;

import com.david.flight.tracker.model.entity.FlightState;
import com.david.flight.tracker.repository.FlightStateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @Autowired
    private FlightStateRepository flightStateRepository;

    @GetMapping("/create")
    public String createTestFlight() {
        FlightState testFlight = new FlightState();
        testFlight.setIcao24("abc123");
        testFlight.setCallsign("TEST001");
        testFlight.setOriginCountry("United Kingdom");
        testFlight.setLatitude(54.5973);  // Belfast coordinates
        testFlight.setLongitude(-5.9301);
        testFlight.setAltitude(10000.0);
        testFlight.setVelocity(250.0);
        testFlight.setHeading(90.0);
        testFlight.setVerticalRate(0.0);
        testFlight.setOnGround(false);
        testFlight.setTimestamp(LocalDateTime.now());

        flightStateRepository.save(testFlight);

        return "✈️ Test flight created! ID: " + testFlight.getId();
    }

    @GetMapping("/all")
    public List<FlightState> getAllFlights() {
        return flightStateRepository.findAll();
    }

    @GetMapping("/count")
    public String getCount() {
        long count = flightStateRepository.count();
        return "Total flights in database: " + count;
    }
}