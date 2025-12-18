package com.david.flight.tracker.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "flight_states")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlightState {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 6)
    private String icao24;

    @Column(length = 8)
    private String callsign;

    @Column(name = "origin_country", length = 100)
    private String originCountry;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    private Double altitude;

    private Double velocity;

    private Double heading;

    @Column(name = "vertical_rate")
    private Double verticalRate;

    @Column(nullable = false)
    private Boolean onGround = false;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
}