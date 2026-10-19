package com.smarthealth.controller;

import com.smarthealth.dto.BulkUploadResultDto;
import com.smarthealth.dto.ObservationRequest;
import com.smarthealth.dto.ObservationResponse;
import com.smarthealth.model.User;
import com.smarthealth.service.AuthService;
import com.smarthealth.service.ObservationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/observations")
@RequiredArgsConstructor
@Tag(name = "Field Observations", description = "Water-quality, rainfall, and disease case collection endpoints")
public class ObservationController {

    private final ObservationService observationService;
    private final AuthService authService;

    @PostMapping
    @Operation(summary = "Submit a new field observation with automatic ML risk prediction and alert generation")
    public ResponseEntity<ObservationResponse> submitObservation(@Valid @RequestBody ObservationRequest request) {
        User currentUser = authService.getCurrentUser();
        ObservationResponse response = observationService.recordObservation(request, currentUser);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Retrieve surveillance observations filtered by village or district")
    public ResponseEntity<List<ObservationResponse>> getObservations(
            @RequestParam(required = false) Long villageId,
            @RequestParam(required = false) Long districtId) {
        if (villageId != null) {
            return ResponseEntity.ok(observationService.getObservationsByVillage(villageId));
        }
        if (districtId != null) {
            return ResponseEntity.ok(observationService.getObservationsByDistrict(districtId));
        }
        return ResponseEntity.ok(observationService.getAllObservations());
    }

    @PostMapping(value = "/bulk-upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Bulk import surveillance records via CSV file")
    public ResponseEntity<BulkUploadResultDto> uploadCsv(@RequestParam("file") MultipartFile file) {
        User currentUser = authService.getCurrentUser();
        BulkUploadResultDto result = observationService.processCsvBulkUpload(file, currentUser);
        return ResponseEntity.ok(result);
    }
}
