package com.smarthealth.controller;

import com.smarthealth.dto.PredictionResponse;
import com.smarthealth.exception.ResourceNotFoundException;
import com.smarthealth.model.Prediction;
import com.smarthealth.repository.PredictionRepository;
import com.smarthealth.service.MlPredictionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/predictions")
@RequiredArgsConstructor
@Tag(name = "AI/ML Risk Predictions", description = "Risk scoring, XAI factor contributions, and history endpoints")
public class PredictionController {

    private final PredictionRepository predictionRepository;
    private final MlPredictionService mlPredictionService;

    @GetMapping("/{id}")
    @Operation(summary = "Get prediction result and XAI explainability factors by ID")
    public ResponseEntity<PredictionResponse> getPredictionById(@PathVariable Long id) {
        Prediction prediction = predictionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prediction not found with id: " + id));
        return ResponseEntity.ok(mlPredictionService.mapToResponse(prediction));
    }

    @GetMapping("/village/{villageId}")
    @Operation(summary = "Get prediction history for a specific village")
    public ResponseEntity<List<PredictionResponse>> getVillagePredictions(@PathVariable Long villageId) {
        List<PredictionResponse> list = predictionRepository.findByVillageIdOrderByCreatedAtDesc(villageId).stream()
                .map(mlPredictionService::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/latest")
    @Operation(summary = "Get latest risk prediction snapshot for all villages")
    public ResponseEntity<List<PredictionResponse>> getLatestPredictions() {
        List<PredictionResponse> list = predictionRepository.findLatestPredictionsForEachVillage().stream()
                .map(mlPredictionService::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }
}
