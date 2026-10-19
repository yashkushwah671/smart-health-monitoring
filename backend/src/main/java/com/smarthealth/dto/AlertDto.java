package com.smarthealth.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertDto {
    private Long id;
    private Long predictionId;
    private Long villageId;
    private String villageName;
    private String districtName;
    private String alertCode;
    private String alertLevel;
    private String triggerReason;
    private String recommendedActions;
    private String status; // NEW, REVIEWED, RESOLVED
    private Long reviewedByUserId;
    private String reviewedByUserName;
    private LocalDateTime reviewedAt;
    private String resolutionNotes;
    private LocalDateTime createdAt;
}
