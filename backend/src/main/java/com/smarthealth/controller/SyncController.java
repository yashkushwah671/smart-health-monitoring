package com.smarthealth.controller;

import com.smarthealth.dto.SyncRequest;
import com.smarthealth.dto.SyncResponse;
import com.smarthealth.model.User;
import com.smarthealth.service.AuthService;
import com.smarthealth.service.SyncService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sync")
@RequiredArgsConstructor
@Tag(name = "Low-Connectivity Sync", description = "Offline observation queue batch synchronization endpoints")
public class SyncController {

    private final SyncService syncService;
    private final AuthService authService;

    @PostMapping
    @Operation(summary = "Reconcile and sync queued offline field observations")
    public ResponseEntity<SyncResponse> syncOfflineBatch(@Valid @RequestBody SyncRequest request) {
        User currentUser = authService.getCurrentUser();
        SyncResponse response = syncService.syncOfflineObservations(request, currentUser);
        return ResponseEntity.ok(response);
    }
}
