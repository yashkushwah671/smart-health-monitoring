package com.smarthealth.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkUploadResultDto {
    private Integer totalRows;
    private Integer successfulImports;
    private Integer failedRows;
    private List<String> errorMessages;
    private List<ObservationResponse> importedObservations;
}
