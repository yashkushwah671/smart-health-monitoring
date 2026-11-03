package com.smarthealth.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarthealth.dto.PredictionResponse;
import com.smarthealth.model.*;
import com.smarthealth.repository.PredictionRepository;
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

@Slf4j
@Service
@RequiredArgsConstructor
public class MlPredictionService {

    @Value("${smarthealth.ml.service-url:http://localhost:5000}")
    private String mlServiceUrl;

    private final RestTemplate restTemplate;
    private final PredictionRepository predictionRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public Prediction generatePrediction(Observation observation) {
        Prediction prediction = null;
        try {
            prediction = callPythonMlService(observation);
        } catch (Exception ex) {
            log.warn("Python ML microservice unreachable or failed ({}). Executing calibrated rule-based fallback.", ex.getMessage());
            prediction = evaluateEpidemiologicalFallback(observation);
        }

        return predictionRepository.save(prediction);
    }

    private Prediction callPythonMlService(Observation obs) {
        String baseUrl = mlServiceUrl != null ? mlServiceUrl.trim() : "http://localhost:5000";
        if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
            baseUrl = "https://" + baseUrl;
        }
        if (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }
        String url = baseUrl + "/predict";

        Map<String, Object> payload = new HashMap<>();
        payload.put("rainfall_mm", obs.getRainfallMm().doubleValue());
        payload.put("turbidity_ntu", obs.getTurbidityNtu().doubleValue());
        payload.put("ph_level", obs.getPhLevel().doubleValue());
        payload.put("e_coli_detected", obs.getEColiDetected());
        payload.put("residual_chlorine_ppm", obs.getResidualChlorinePpm() != null ? obs.getResidualChlorinePpm().doubleValue() : 0.0);
        payload.put("chlorination_done", obs.getChlorinationDone());
        payload.put("latrine_coverage_pct", obs.getLatrineCoveragePct() != null ? obs.getLatrineCoveragePct().doubleValue() : 65.0);
        payload.put("open_drainage_flag", obs.getOpenDrainageFlag());
        payload.put("reported_diarrhea_cases", obs.getReportedDiarrheaCases());
        payload.put("reported_cholera_suspects", obs.getReportedCholeraSuspects());
        payload.put("reported_typhoid_suspects", obs.getReportedTyphoidSuspects());
        payload.put("total_gastro_cases", obs.getTotalGastroCases());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            try {
                JsonNode root = objectMapper.readTree(response.getBody());
                
                BigDecimal riskScore = BigDecimal.valueOf(root.path("risk_score").asDouble());
                String riskCategory = root.path("risk_category").asText("LOW");
                BigDecimal confidencePct = BigDecimal.valueOf(root.path("confidence_pct").asDouble(85.0));
                String modelVersion = root.path("model_version").asText("v1.2-ensemble-rf-xgb");
                String modelType = root.path("model_type").asText("HYBRID_ML_EPIDEMIOLOGICAL");
                String summaryRec = root.path("summary_recommendation").asText();

                JsonNode subFactors = root.path("sub_factors");
                BigDecimal rainFactor = BigDecimal.valueOf(subFactors.path("rainfall_factor_pct").asDouble(0.0));
                BigDecimal waterFactor = BigDecimal.valueOf(subFactors.path("water_quality_factor_pct").asDouble(0.0));
                BigDecimal caseFactor = BigDecimal.valueOf(subFactors.path("case_trend_factor_pct").asDouble(0.0));
                BigDecimal sanitationFactor = BigDecimal.valueOf(subFactors.path("sanitation_factor_pct").asDouble(0.0));

                Prediction prediction = Prediction.builder()
                        .observation(obs)
                        .village(obs.getVillage())
                        .riskScore(riskScore)
                        .riskCategory(riskCategory)
                        .confidencePct(confidencePct)
                        .modelVersion(modelVersion)
                        .modelType(modelType)
                        .rainfallFactorPct(rainFactor)
                        .waterQualityFactorPct(waterFactor)
                        .caseTrendFactorPct(caseFactor)
                        .sanitationFactorPct(sanitationFactor)
                        .summaryRecommendation(summaryRec)
                        .explanations(new ArrayList<>())
                        .build();

                JsonNode explanationsNode = root.path("explanations");
                if (explanationsNode.isArray()) {
                    for (JsonNode exp : explanationsNode) {
                        PredictionExplanation explanation = PredictionExplanation.builder()
                                .prediction(prediction)
                                .factorKey(exp.path("factor_key").asText())
                                .factorName(exp.path("factor_name").asText())
                                .factorValue(exp.path("factor_value").asText())
                                .impactDirection(exp.path("impact_direction").asText())
                                .contributionWeight(BigDecimal.valueOf(exp.path("contribution_weight").asDouble()))
                                .explanationText(exp.path("explanation_text").asText())
                                .build();
                        prediction.getExplanations().add(explanation);
                    }
                }

                return prediction;
            } catch (Exception e) {
                log.error("Error parsing Python ML JSON response", e);
                throw new RuntimeException("ML parsing error", e);
            }
        }
        throw new RuntimeException("Non-200 response from ML microservice");
    }

    private Prediction evaluateEpidemiologicalFallback(Observation obs) {
        double rainfall = obs.getRainfallMm().doubleValue();
        double turbidity = obs.getTurbidityNtu().doubleValue();
        boolean eColi = Boolean.TRUE.equals(obs.getEColiDetected());
        double chlorine = obs.getResidualChlorinePpm() != null ? obs.getResidualChlorinePpm().doubleValue() : 0.0;
        int cases = obs.getTotalGastroCases();
        double latrineCov = obs.getLatrineCoveragePct() != null ? obs.getLatrineCoveragePct().doubleValue() : 65.0;
        boolean openDrain = Boolean.TRUE.equals(obs.getOpenDrainageFlag());

        double rainScore = Math.min(rainfall / 140.0, 1.0) * 100.0;
        double waterScore = Math.min((turbidity / 25.0) * 45.0 + (eColi ? 45.0 : 0.0) + (chlorine < 0.2 ? 10.0 : 0.0), 100.0);
        double caseScore = Math.min(cases / 12.0, 1.0) * 100.0;
        double sanitationScore = Math.min((100.0 - latrineCov) * 0.6 + (openDrain ? 40.0 : 0.0), 100.0);

        double composite = 0.35 * waterScore + 0.25 * rainScore + 0.25 * caseScore + 0.15 * sanitationScore;
        composite = Math.min(Math.max(composite, 0.0), 100.0);

        String category = "LOW";
        if (composite >= 70.0) category = "HIGH";
        else if (composite >= 35.0) category = "MEDIUM";

        Prediction prediction = Prediction.builder()
                .observation(obs)
                .village(obs.getVillage())
                .riskScore(BigDecimal.valueOf(composite).setScale(2, RoundingMode.HALF_UP))
                .riskCategory(category)
                .confidencePct(new BigDecimal("85.00"))
                .modelVersion("v1.2-baseline-epidemiological-fallback")
                .modelType("EPIDEMIOLOGICAL_WEIGHTED_BASELINE")
                .rainfallFactorPct(BigDecimal.valueOf(rainScore).setScale(1, RoundingMode.HALF_UP))
                .waterQualityFactorPct(BigDecimal.valueOf(waterScore).setScale(1, RoundingMode.HALF_UP))
                .caseTrendFactorPct(BigDecimal.valueOf(caseScore).setScale(1, RoundingMode.HALF_UP))
                .sanitationFactorPct(BigDecimal.valueOf(sanitationScore).setScale(1, RoundingMode.HALF_UP))
                .summaryRecommendation(getFallbackRecommendation(category))
                .explanations(new ArrayList<>())
                .build();

        if (rainfall >= 100.0) {
            prediction.getExplanations().add(PredictionExplanation.builder()
                    .prediction(prediction)
                    .factorKey("RAINFALL_ELEVATED")
                    .factorName("Monsoon Rain Runoff")
                    .factorValue(rainfall + " mm")
                    .impactDirection("INCREASES_RISK")
                    .contributionWeight(new BigDecimal("0.280"))
                    .explanationText("Heavy monsoon rainfall triggers contamination runoff into shallow aquifers.")
                    .build());
        }

        if (turbidity >= 10.0 || eColi) {
            prediction.getExplanations().add(PredictionExplanation.builder()
                    .prediction(prediction)
                    .factorKey("WATER_CONTAMINATION")
                    .factorName("High Turbidity / Coliform Risk")
                    .factorValue(turbidity + " NTU, E.coli: " + eColi)
                    .impactDirection("INCREASES_RISK")
                    .contributionWeight(new BigDecimal("0.350"))
                    .explanationText("Elevated water cloudiness or coliform presence exceeds safe drinking standards.")
                    .build());
        }

        return prediction;
    }

    private String getFallbackRecommendation(String riskCategory) {
        if ("HIGH".equals(riskCategory)) {
            return "URGENT: Issue community boil-water notice, dispatch PHE chlorination unit, distribute ORS/zinc packets.";
        } else if ("MEDIUM".equals(riskCategory)) {
            return "MODERATE: Inspect village water sources, distribute chlorine tablets, monitor syndromic fever/diarrhea.";
        }
        return "LOW RISK: Safe baseline water indicators. Continue standard weekly surveillance.";
    }

    public PredictionResponse mapToResponse(Prediction prediction) {
        List<PredictionResponse.ExplanationDto> explanationDtos = new ArrayList<>();
        if (prediction.getExplanations() != null) {
            for (PredictionExplanation exp : prediction.getExplanations()) {
                explanationDtos.add(PredictionResponse.ExplanationDto.builder()
                        .factorKey(exp.getFactorKey())
                        .factorName(exp.getFactorName())
                        .factorValue(exp.getFactorValue())
                        .impactDirection(exp.getImpactDirection())
                        .contributionWeight(exp.getContributionWeight())
                        .explanationText(exp.getExplanationText())
                        .build());
            }
        }

        return PredictionResponse.builder()
                .id(prediction.getId())
                .observationId(prediction.getObservation().getId())
                .villageId(prediction.getVillage().getId())
                .villageName(prediction.getVillage().getVillageName())
                .districtName(prediction.getVillage().getDistrict().getDistrictName())
                .riskScore(prediction.getRiskScore())
                .riskCategory(prediction.getRiskCategory())
                .confidencePct(prediction.getConfidencePct())
                .modelVersion(prediction.getModelVersion())
                .modelType(prediction.getModelType())
                .rainfallFactorPct(prediction.getRainfallFactorPct())
                .waterQualityFactorPct(prediction.getWaterQualityFactorPct())
                .caseTrendFactorPct(prediction.getCaseTrendFactorPct())
                .sanitationFactorPct(prediction.getSanitationFactorPct())
                .summaryRecommendation(prediction.getSummaryRecommendation())
                .explanations(explanationDtos)
                .createdAt(prediction.getCreatedAt())
                .build();
    }
}
