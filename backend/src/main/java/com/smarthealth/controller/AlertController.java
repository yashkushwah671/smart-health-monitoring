package com.smarthealth.controller;

import com.smarthealth.dto.AlertDto;
import com.smarthealth.model.AlertStatus;
import com.smarthealth.model.User;
import com.smarthealth.service.AlertService;
import com.smarthealth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
@Tag(name = "Early-Warning Alerts", description = "Public health early-warning alerts and review workflow endpoints")
public class AlertController {

    private final AlertService alertService;
    private final AuthService authService;

    @GetMapping
    @Operation(summary = "Get all alerts with optional status filter (NEW, REVIEWED, RESOLVED)")
    public ResponseEntity<List<AlertDto>> getAlerts(
            @RequestParam(required = false) AlertStatus status) {
        return ResponseEntity.ok(alertService.getAllAlerts(status));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get alert details by ID")
    public ResponseEntity<AlertDto> getAlertById(@PathVariable Long id) {
        return ResponseEntity.ok(alertService.getAlertById(id));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISTRICT_OFFICER', 'ASHA_WORKER')")
    @Operation(summary = "Update alert status (NEW -> REVIEWED -> RESOLVED) with reviewer notes")
    public ResponseEntity<AlertDto> updateAlertStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        User currentUser = authService.getCurrentUser();
        AlertStatus status = AlertStatus.valueOf(payload.get("status"));
        String notes = payload.get("resolutionNotes");
        AlertDto updated = alertService.updateAlertStatus(id, status, currentUser, notes);
        return ResponseEntity.ok(updated);
    }
}
