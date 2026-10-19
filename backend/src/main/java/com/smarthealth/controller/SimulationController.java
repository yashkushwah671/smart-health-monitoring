package com.smarthealth.controller;

import com.smarthealth.dto.SimulationRequest;
import com.smarthealth.dto.SimulationResponse;
import com.smarthealth.model.User;
import com.smarthealth.service.AuthService;
import com.smarthealth.service.SimulationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/simulations")
@RequiredArgsConstructor
@Tag(name = "What-If Simulations", description = "Rainfall anomaly scenario sandbox endpoints")
public class SimulationController {

    private final SimulationService simulationService;
    private final AuthService authService;

    @PostMapping("/run")
    @Operation(summary = "Execute What-If counterfactual simulation with customized rainfall delta")
    public ResponseEntity<SimulationResponse> runSimulation(@Valid @RequestBody SimulationRequest request) {
        User currentUser = authService.getCurrentUser();
        SimulationResponse response = simulationService.runSimulation(request, currentUser);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/recent")
    @Operation(summary = "Get recent simulation experiments")
    public ResponseEntity<List<SimulationResponse>> getRecentSimulations() {
        return ResponseEntity.ok(simulationService.getRecentSimulations());
    }
}
