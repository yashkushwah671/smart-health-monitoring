package com.smarthealth.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PredictionResponse {
    private Long id;
    private Long observationId;
    private Long villageId;
    private String villageName;
    private String districtName;
    private BigDecimal riskScore;
    private String riskCategory;
    private BigDecimal confidencePct;
    private String modelVersion;
    private String modelType;
    private BigDecimal rainfallFactorPct;
    private BigDecimal waterQualityFactorPct;
    private BigDecimal caseTrendFactorPct;
    private BigDecimal sanitationFactorPct;
    private String summaryRecommendation;
    private List<ExplanationDto> explanations;
    private AlertDto triggeredAlert;
    private LocalDateTime createdAt;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ExplanationDto {
        private String factorKey;
        private String factorName;
        private String factorValue;
        private String impactDirection;
        private BigDecimal contributionWeight;
        private String explanationText;
    }
}
