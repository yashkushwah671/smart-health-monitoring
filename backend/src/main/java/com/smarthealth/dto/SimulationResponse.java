package com.smarthealth.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SimulationResponse {
    private Long id;
    private Long villageId;
    private String villageName;
    private BigDecimal baseRainfallMm;
    private BigDecimal simulatedRainfallMm;
    private BigDecimal rainfallDeltaPct;
    private BigDecimal baseRiskScore;
    private String baseRiskCategory;
    private BigDecimal simulatedRiskScore;
    private String simulatedRiskCategory;
    private BigDecimal deltaScore;
    private String simulationNote;
    private PredictionResponse basePrediction;
    private PredictionResponse simulatedPrediction;
    private LocalDateTime createdAt;
}
