package com.smarthealth.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarthealth.dto.ObservationRequest;
import com.smarthealth.dto.SimulationRequest;
import com.smarthealth.dto.SimulationResponse;
import com.smarthealth.exception.ResourceNotFoundException;
import com.smarthealth.model.*;
import com.smarthealth.repository.ObservationRepository;
import com.smarthealth.repository.SimulationRunRepository;
import com.smarthealth.repository.VillageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SimulationService {

    @Value("${smarthealth.ml.service-url:http://localhost:5000}")
    private String mlServiceUrl;

    private final VillageRepository villageRepository;
    private final ObservationRepository observationRepository;
    private final SimulationRunRepository simulationRunRepository;
    private final MlPredictionService mlPredictionService;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public SimulationResponse runSimulation(SimulationRequest request, User currentUser) {
        Village village = villageRepository.findById(request.getVillageId())
                .orElseThrow(() -> new ResourceNotFoundException("Village not found with id: " + request.getVillageId()));

        Observation baseObs = null;
        if (request.getCustomObservation() != null) {
            ObservationRequest c = request.getCustomObservation();
            baseObs = Observation.builder()
                    .village(village)
                    .rainfallMm(c.getRainfallMm())
                    .turbidityNtu(c.getTurbidityNtu())
                    .phLevel(c.getPhLevel())
                    .eColiDetected(Boolean.TRUE.equals(c.getEColiDetected()))
                    .residualChlorinePpm(c.getResidualChlorinePpm() != null ? c.getResidualChlorinePpm() : BigDecimal.ZERO)
                    .chlorinationDone(Boolean.TRUE.equals(c.getChlorinationDone()))
                    .latrineCoveragePct(c.getLatrineCoveragePct() != null ? c.getLatrineCoveragePct() : village.getSanitationCoveragePct())
                    .openDrainageFlag(Boolean.TRUE.equals(c.getOpenDrainageFlag()))
                    .reportedDiarrheaCases(c.getReportedDiarrheaCases() != null ? c.getReportedDiarrheaCases() : 0)
                    .reportedCholeraSuspects(c.getReportedCholeraSuspects() != null ? c.getReportedCholeraSuspects() : 0)
                    .reportedTyphoidSuspects(c.getReportedTyphoidSuspects() != null ? c.getReportedTyphoidSuspects() : 0)
                    .totalGastroCases((c.getReportedDiarrheaCases() != null ? c.getReportedDiarrheaCases() : 0) +
                                      (c.getReportedCholeraSuspects() != null ? c.getReportedCholeraSuspects() : 0) +
                                      (c.getReportedTyphoidSuspects() != null ? c.getReportedTyphoidSuspects() : 0))
                    .build();
        } else {
            baseObs = observationRepository.findTopByVillageIdOrderByObservationDateDesc(village.getId())
                    .orElseGet(() -> Observation.builder()
                            .village(village)
                            .rainfallMm(new BigDecimal("65.0"))
                            .turbidityNtu(new BigDecimal("8.0"))
                            .phLevel(new BigDecimal("7.2"))
                            .eColiDetected(false)
                            .residualChlorinePpm(new BigDecimal("0.20"))
                            .chlorinationDone(true)
                            .latrineCoveragePct(village.getSanitationCoveragePct())
                            .openDrainageFlag(false)
                            .reportedDiarrheaCases(2)
                            .reportedCholeraSuspects(0)
                            .reportedTyphoidSuspects(0)
                            .totalGastroCases(2)
                            .build());
        }

        BigDecimal deltaPct = request.getRainfallDeltaPct();
        BigDecimal baseRainfall = baseObs.getRainfallMm();
        BigDecimal multiplier = BigDecimal.ONE.add(deltaPct.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP));
        BigDecimal simRainfall = baseRainfall.multiply(multiplier).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);

        // Simulated observation
        BigDecimal simTurbidity = baseObs.getTurbidityNtu();
        if (deltaPct.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal turbMultiplier = BigDecimal.ONE.add(deltaPct.multiply(new BigDecimal("0.004")));
            simTurbidity = simTurbidity.multiply(turbMultiplier).setScale(2, RoundingMode.HALF_UP);
        }

        Observation simObs = Observation.builder()
                .village(village)
                .rainfallMm(simRainfall)
                .turbidityNtu(simTurbidity)
                .phLevel(baseObs.getPhLevel())
                .eColiDetected(baseObs.getEColiDetected())
                .residualChlorinePpm(baseObs.getResidualChlorinePpm())
                .chlorinationDone(baseObs.getChlorinationDone())
                .latrineCoveragePct(baseObs.getLatrineCoveragePct())
                .openDrainageFlag(baseObs.getOpenDrainageFlag())
                .reportedDiarrheaCases(baseObs.getReportedDiarrheaCases())
                .reportedCholeraSuspects(baseObs.getReportedCholeraSuspects())
                .reportedTyphoidSuspects(baseObs.getReportedTyphoidSuspects())
                .totalGastroCases(baseObs.getTotalGastroCases())
                .build();

        Prediction basePred = mlPredictionService.generatePrediction(baseObs);
        Prediction simPred = mlPredictionService.generatePrediction(simObs);

        BigDecimal scoreDiff = simPred.getRiskScore().subtract(basePred.getRiskScore()).setScale(2, RoundingMode.HALF_UP);

        SimulationRun run = SimulationRun.builder()
                .user(currentUser)
                .village(village)
                .baseRainfallMm(baseRainfall)
                .simulatedRainfallMm(simRainfall)
                .rainfallDeltaPct(deltaPct)
                .baseRiskScore(basePred.getRiskScore())
                .baseRiskCategory(basePred.getRiskCategory())
                .simulatedRiskScore(simPred.getRiskScore())
                .simulatedRiskCategory(simPred.getRiskCategory())
                .deltaScore(scoreDiff)
                .build();

        SimulationRun savedRun = simulationRunRepository.save(run);

        return SimulationResponse.builder()
                .id(savedRun.getId())
                .villageId(village.getId())
                .villageName(village.getVillageName())
                .baseRainfallMm(baseRainfall)
                .simulatedRainfallMm(simRainfall)
                .rainfallDeltaPct(deltaPct)
                .baseRiskScore(basePred.getRiskScore())
                .baseRiskCategory(basePred.getRiskCategory())
                .simulatedRiskScore(simPred.getRiskScore())
                .simulatedRiskCategory(simPred.getRiskCategory())
                .deltaScore(scoreDiff)
                .simulationNote(String.format("Simulation scenario with %+.1f%% rainfall alteration against %s baseline.",
                        deltaPct.doubleValue(), village.getVillageName()))
                .basePrediction(mlPredictionService.mapToResponse(basePred))
                .simulatedPrediction(mlPredictionService.mapToResponse(simPred))
                .createdAt(savedRun.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<SimulationResponse> getRecentSimulations() {
        return simulationRunRepository.findTop20ByOrderByCreatedAtDesc().stream()
                .map(s -> SimulationResponse.builder()
                        .id(s.getId())
                        .villageId(s.getVillage().getId())
                        .villageName(s.getVillage().getVillageName())
                        .baseRainfallMm(s.getBaseRainfallMm())
                        .simulatedRainfallMm(s.getSimulatedRainfallMm())
                        .rainfallDeltaPct(s.getRainfallDeltaPct())
                        .baseRiskScore(s.getBaseRiskScore())
                        .baseRiskCategory(s.getBaseRiskCategory())
                        .simulatedRiskScore(s.getSimulatedRiskScore())
                        .simulatedRiskCategory(s.getSimulatedRiskCategory())
                        .deltaScore(s.getDeltaScore())
                        .createdAt(s.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
}
