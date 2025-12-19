package com.david.flight.tracker.repository;

import com.david.flight.tracker.model.entity.FlightState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Repository
public interface FlightStateRepository extends JpaRepository<FlightState, Long> {

    /**
     * Find the latest position for each unique aircraft
     */
    @Query("""
        SELECT f FROM FlightState f
        WHERE f.timestamp = (
            SELECT MAX(f2.timestamp)
            FROM FlightState f2
            WHERE f2.icao24 = f.icao24
        )
        AND f.timestamp > :since
        AND f.onGround = false
        ORDER BY f.timestamp DESC
        """)
    List<FlightState> findLatestPositions(@Param("since") LocalDateTime since);

    /**
     * Find all positions for a specific aircraft (for trail visualization)
     */
    @Query("""
        SELECT f FROM FlightState f
        WHERE f.icao24 = :icao24
        AND f.timestamp > :since
        ORDER BY f.timestamp DESC
        """)
    List<FlightState> findFlightTrail(
            @Param("icao24") String icao24,
            @Param("since") LocalDateTime since
    );

    /**
     * Find flights by callsign (flight number search)
     */
    List<FlightState> findByCallsignContainingIgnoreCase(String callsign);

    /**
     * Count flights currently in the air
     */
    long countByOnGroundFalseAndTimestampAfter(LocalDateTime since);

    /**
     * Delete old flight data (cleanup)
     */
    @Transactional
    @Modifying
    @Query("DELETE FROM FlightState f WHERE f.timestamp < :before")
    void deleteByTimestampBefore(@Param("before") LocalDateTime before);

    /**
     * Delete recent records for specific aircraft (prevents duplicates)
     * Only deletes records from the last few minutes
     */
    @Transactional
    @Modifying
    @Query("DELETE FROM FlightState f WHERE f.icao24 IN :icao24Set AND f.timestamp > :since")
    int deleteRecentByIcao24Set(@Param("icao24Set") Set<String> icao24Set, @Param("since") LocalDateTime since);
}