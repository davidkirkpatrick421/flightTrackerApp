package com.david.flight.tracker.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class OpenSkyResponse {

    @JsonProperty("time")
    private Long time;

    @JsonProperty("states")
    private List<List<Object>> states;

    // OpenSky returns each flight as an array of values
    // We'll parse these arrays into FlightState objects
}