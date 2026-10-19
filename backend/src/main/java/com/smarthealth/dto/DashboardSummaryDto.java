package com.smarthealth.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryDto {
    private Long totalVillagesMonitored;
    private Long lowRiskVillagesCount;
    private Long mediumRiskVillagesCount;
    private Long highRiskVillagesCount;
    private Long activeAlertsCount;
    private Long totalObservationsRecorded;
    
    // Average parameters across latest readings
    private BigDecimal averageRainfallMm;
    private BigDecimal averageTurbidityNtu;
    private Integer totalActiveGastroCases;
    
    private List<ObservationResponse> recentObservations;
    private List<AlertDto> activeAlerts;
    private List<VillageRiskSummaryDto> villageRiskMap;
    private List<TrendPointDto> temporalTrends;
    private Map<String, Long> riskDistribution;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VillageRiskSummaryDto {
        private Long villageId;
        private String villageName;
        private String villageCode;
        private String districtName;
        private String state;
        private BigDecimal latitude;
        private BigDecimal longitude;
        private Integer estimatedPopulation;
        private String primaryWaterSource;
        private BigDecimal latestRiskScore;
        private String latestRiskCategory;
        private String latestObservationDate;
        private Boolean hasActiveAlert;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TrendPointDto {
        private String date;
        private BigDecimal rainfallMm;
        private BigDecimal averageTurbidity;
        private Integer reportedCases;
        private BigDecimal averageRiskScore;
    }
}
