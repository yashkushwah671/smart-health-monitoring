package com.smarthealth.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ObservationResponse {
    private Long id;
    private Long villageId;
    private String villageName;
    private String villageCode;
    private String districtName;
    private String state;
    private Long recordedByUserId;
    private String recordedByUserName;
    private LocalDate observationDate;
    private BigDecimal rainfallMm;
    private String waterSourceType;
    private BigDecimal turbidityNtu;
    private BigDecimal phLevel;
    private Boolean eColiDetected;
    private BigDecimal residualChlorinePpm;
    private Boolean chlorinationDone;
    private BigDecimal latrineCoveragePct;
    private Boolean openDrainageFlag;
    private Integer reportedDiarrheaCases;
    private Integer reportedCholeraSuspects;
    private Integer reportedTyphoidSuspects;
    private Integer totalGastroCases;
    private String notes;
    private String submissionChannel;
    private String syncStatus;
    private LocalDateTime createdAt;
    private PredictionResponse prediction;
}
