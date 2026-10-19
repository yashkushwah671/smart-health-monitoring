package com.smarthealth.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ObservationRequest {

    @NotNull(message = "Village ID is required")
    private Long villageId;

    private LocalDate observationDate;

    @NotNull(message = "Rainfall amount is required")
    @DecimalMin(value = "0.0", message = "Rainfall cannot be negative")
    @DecimalMax(value = "1000.0", message = "Rainfall value is out of realistic range")
    private BigDecimal rainfallMm;

    @NotBlank(message = "Water source type is required")
    private String waterSourceType;

    @NotNull(message = "Turbidity is required")
    @DecimalMin(value = "0.0", message = "Turbidity cannot be negative")
    private BigDecimal turbidityNtu;

    @NotNull(message = "pH level is required")
    @DecimalMin(value = "0.0", message = "pH cannot be negative")
    @DecimalMax(value = "14.0", message = "pH cannot exceed 14.0")
    private BigDecimal phLevel;

    @Builder.Default
    private Boolean eColiDetected = false;

    @DecimalMin(value = "0.0", message = "Residual chlorine cannot be negative")
    @Builder.Default
    private BigDecimal residualChlorinePpm = BigDecimal.ZERO;

    @Builder.Default
    private Boolean chlorinationDone = false;

    @DecimalMin(value = "0.0", message = "Latrine coverage cannot be negative")
    @DecimalMax(value = "100.0", message = "Latrine coverage cannot exceed 100%")
    @Builder.Default
    private BigDecimal latrineCoveragePct = new BigDecimal("65.00");

    @Builder.Default
    private Boolean openDrainageFlag = false;

    @Min(value = 0, message = "Diarrhea cases cannot be negative")
    @Builder.Default
    private Integer reportedDiarrheaCases = 0;

    @Min(value = 0, message = "Cholera suspects cannot be negative")
    @Builder.Default
    private Integer reportedCholeraSuspects = 0;

    @Min(value = 0, message = "Typhoid suspects cannot be negative")
    @Builder.Default
    private Integer reportedTyphoidSuspects = 0;

    private String notes;

    @Builder.Default
    private String submissionChannel = "ONLINE_WEB"; // ONLINE_WEB, OFFLINE_SYNC, CSV_BULK
}
