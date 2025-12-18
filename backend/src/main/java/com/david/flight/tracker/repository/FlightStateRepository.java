package com.david.flight.tracker.repository;

import com.david.flight.tracker.model.entity.FlightState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FlightStateRepository extends JpaRepository<FlightState, Long> {

    // Spring Data JPA automatically provides these methods:
    // - save(FlightState entity)
    // - saveAll(List<FlightState> entities)
    // - findById(Long id)
    // - findAll()
    // - deleteById(Long id)
    // - count()

    // We'll add custom queries here later
    // For now, the basic CRUD operations are enough
}