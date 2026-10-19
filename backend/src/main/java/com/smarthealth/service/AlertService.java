package com.smarthealth.service;

import com.smarthealth.dto.AlertDto;
import com.smarthealth.exception.ResourceNotFoundException;
import com.smarthealth.model.*;
import com.smarthealth.repository.AlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepository;

    @Transactional
    public Optional<Alert> checkAndGenerateAlert(Prediction prediction) {
        // High risk (>=70) generates HIGH_RISK_OUTBREAK_SURGE alert.
        // Medium risk (>=50) with e-coli or high rainfall generates MEDIUM_RISK_WARNING alert.
        boolean isHighRisk = "HIGH".equalsIgnoreCase(prediction.getRiskCategory());
        boolean isMediumSurge = "MEDIUM".equalsIgnoreCase(prediction.getRiskCategory()) &&
                (prediction.getRiskScore().doubleValue() >= 50.0 ||
                 Boolean.TRUE.equals(prediction.getObservation().getEColiDetected()));

        if (!isHighRisk && !isMediumSurge) {
            return Optional.empty();
        }

        // Prevent duplicate alerts for the same prediction event
        if (alertRepository.findByPredictionId(prediction.getId()).isPresent()) {
            return alertRepository.findByPredictionId(prediction.getId());
        }

        String level = isHighRisk ? "HIGH_RISK_OUTBREAK_SURGE" : "MEDIUM_RISK_WARNING";
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String code = "ALT-" + dateStr + "-" + prediction.getVillage().getId() + "-" + prediction.getId();

        String triggerReason = String.format(
                "Risk Score %.1f (%s) triggered for %s. Rainfall: %.1fmm, Turbidity: %.1f NTU, E.coli: %s, Active cases: %d.",
                prediction.getRiskScore().doubleValue(),
                prediction.getRiskCategory(),
                prediction.getVillage().getVillageName(),
                prediction.getObservation().getRainfallMm().doubleValue(),
                prediction.getObservation().getTurbidityNtu().doubleValue(),
                Boolean.TRUE.equals(prediction.getObservation().getEColiDetected()) ? "POSITIVE" : "NEGATIVE",
                prediction.getObservation().getTotalGastroCases()
        );

        String recommendedActions = prediction.getSummaryRecommendation() != null ?
                prediction.getSummaryRecommendation() :
                "Issue boil-water advisory; super-chlorinate water sources; deploy ASHA active fever surveillance.";

        Alert alert = Alert.builder()
                .prediction(prediction)
                .village(prediction.getVillage())
                .alertCode(code)
                .alertLevel(level)
                .triggerReason(triggerReason)
                .recommendedActions(recommendedActions)
                .status(AlertStatus.NEW)
                .build();

        Alert saved = alertRepository.save(alert);
        log.info("Early-Warning Alert generated: {} for village {}", saved.getAlertCode(), prediction.getVillage().getVillageName());
        return Optional.of(saved);
    }

    @Transactional(readOnly = true)
    public List<AlertDto> getAllAlerts(AlertStatus status) {
        List<Alert> alerts = (status != null) ?
                alertRepository.findByStatusOrderByCreatedAtDesc(status) :
                alertRepository.findAll();

        return alerts.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AlertDto getAlertById(Long id) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found with id: " + id));
        return mapToDto(alert);
    }

    @Transactional
    public AlertDto updateAlertStatus(Long id, AlertStatus newStatus, User reviewer, String notes) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found with id: " + id));

        alert.setStatus(newStatus);
        alert.setReviewedByUser(reviewer);
        alert.setReviewedAt(LocalDateTime.now());
        if (notes != null && !notes.isBlank()) {
            alert.setResolutionNotes(notes);
        }

        Alert updated = alertRepository.save(alert);
        return mapToDto(updated);
    }

    public AlertDto mapToDto(Alert alert) {
        return AlertDto.builder()
                .id(alert.getId())
                .predictionId(alert.getPrediction().getId())
                .villageId(alert.getVillage().getId())
                .villageName(alert.getVillage().getVillageName())
                .districtName(alert.getVillage().getDistrict().getDistrictName())
                .alertCode(alert.getAlertCode())
                .alertLevel(alert.getAlertLevel())
                .triggerReason(alert.getTriggerReason())
                .recommendedActions(alert.getRecommendedActions())
                .status(alert.getStatus().name())
                .reviewedByUserId(alert.getReviewedByUser() != null ? alert.getReviewedByUser().getId() : null)
                .reviewedByUserName(alert.getReviewedByUser() != null ? alert.getReviewedByUser().getFullName() : null)
                .reviewedAt(alert.getReviewedAt())
                .resolutionNotes(alert.getResolutionNotes())
                .createdAt(alert.getCreatedAt())
                .build();
    }
}
