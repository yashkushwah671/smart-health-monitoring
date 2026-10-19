package com.smarthealth.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SyncRequest {
    private String clientSyncId;
    private List<ObservationRequest> offlineObservations;
}
