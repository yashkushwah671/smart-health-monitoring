package com.smarthealth.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SimulationRequest {

    @NotNull(message = "Village ID is required")
    private Long villageId;

    @NotNull(message = "Rainfall delta percentage is required")
    @DecimalMin(value = "-100.0", message = "Rainfall reduction cannot exceed -100%")
    @DecimalMax(value = "500.0", message = "Rainfall increase cannot exceed +500%")
    private BigDecimal rainfallDeltaPct; // e.g. 10.0, 20.0, 30.0, -20.0

    // Optional base observation overrides
    private ObservationRequest customObservation;
}
