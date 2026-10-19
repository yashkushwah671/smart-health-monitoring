package com.smarthealth.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SyncResponse {
    private String clientSyncId;
    private Integer totalReceived;
    private Integer successfullySynced;
    private Integer conflictsResolved;
    private List<ObservationResponse> syncedRecords;
    private List<String> syncErrors;
    private String status;
}
