package com.smarthealth.service;

import com.smarthealth.dto.*;
import com.smarthealth.exception.BadRequestException;
import com.smarthealth.exception.ResourceNotFoundException;
import com.smarthealth.model.*;
import com.smarthealth.repository.ObservationRepository;
import com.smarthealth.repository.PredictionRepository;
import com.smarthealth.repository.VillageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ObservationService {

    private final ObservationRepository observationRepository;
    private final VillageRepository villageRepository;
    private final PredictionRepository predictionRepository;
    private final MlPredictionService mlPredictionService;
    private final AlertService alertService;

    @Transactional
    public ObservationResponse recordObservation(ObservationRequest request, User recordedBy) {
        Village village = villageRepository.findById(request.getVillageId())
                .orElseThrow(() -> new ResourceNotFoundException("Village not found with id: " + request.getVillageId()));

        Observation observation = Observation.builder()
                .village(village)
                .recordedByUser(recordedBy)
                .observationDate(request.getObservationDate() != null ? request.getObservationDate() : LocalDate.now())
                .rainfallMm(request.getRainfallMm())
                .waterSourceType(request.getWaterSourceType())
                .turbidityNtu(request.getTurbidityNtu())
                .phLevel(request.getPhLevel())
                .eColiDetected(Boolean.TRUE.equals(request.getEColiDetected()))
                .residualChlorinePpm(request.getResidualChlorinePpm() != null ? request.getResidualChlorinePpm() : BigDecimal.ZERO)
                .chlorinationDone(Boolean.TRUE.equals(request.getChlorinationDone()))
                .latrineCoveragePct(request.getLatrineCoveragePct() != null ? request.getLatrineCoveragePct() : village.getSanitationCoveragePct())
                .openDrainageFlag(Boolean.TRUE.equals(request.getOpenDrainageFlag()))
                .reportedDiarrheaCases(request.getReportedDiarrheaCases() != null ? request.getReportedDiarrheaCases() : 0)
                .reportedCholeraSuspects(request.getReportedCholeraSuspects() != null ? request.getReportedCholeraSuspects() : 0)
                .reportedTyphoidSuspects(request.getReportedTyphoidSuspects() != null ? request.getReportedTyphoidSuspects() : 0)
                .totalGastroCases((request.getReportedDiarrheaCases() != null ? request.getReportedDiarrheaCases() : 0) +
                                  (request.getReportedCholeraSuspects() != null ? request.getReportedCholeraSuspects() : 0) +
                                  (request.getReportedTyphoidSuspects() != null ? request.getReportedTyphoidSuspects() : 0))
                .notes(request.getNotes())
                .submissionChannel(request.getSubmissionChannel() != null ? request.getSubmissionChannel() : "ONLINE_WEB")
                .syncStatus("SYNCED")
                .build();

        Observation savedObs = observationRepository.save(observation);

        // Compute AI/ML Risk Prediction
        Prediction prediction = mlPredictionService.generatePrediction(savedObs);

        // Check and trigger Early Warning Alert
        Optional<Alert> alertOpt = alertService.checkAndGenerateAlert(prediction);

        return mapToResponse(savedObs, prediction, alertOpt.orElse(null));
    }

    @Transactional(readOnly = true)
    public List<ObservationResponse> getAllObservations() {
        return observationRepository.findAll().stream()
                .map(this::mapToResponseSimple)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ObservationResponse> getObservationsByVillage(Long villageId) {
        return observationRepository.findByVillageIdOrderByObservationDateDesc(villageId).stream()
                .map(this::mapToResponseSimple)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ObservationResponse> getObservationsByDistrict(Long districtId) {
        return observationRepository.findByVillageDistrictIdOrderByObservationDateDesc(districtId).stream()
                .map(this::mapToResponseSimple)
                .collect(Collectors.toList());
    }

    @Transactional
    public BulkUploadResultDto processCsvBulkUpload(MultipartFile file, User uploadedBy) {
        if (file.isEmpty()) {
            throw new BadRequestException("Uploaded CSV file is empty");
        }

        List<ObservationResponse> imported = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        int totalRows = 0;

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
             CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT.builder().setHeader().setSkipHeaderRecord(true).setIgnoreHeaderCase(true).setTrim(true).build())) {

            for (CSVRecord record : csvParser) {
                totalRows++;
                try {
                    String villageCode = record.get("village_code");
                    Village village = villageRepository.findByVillageCode(villageCode)
                            .orElseThrow(() -> new IllegalArgumentException("Unknown village_code: " + villageCode));

                    LocalDate date = record.isSet("observation_date") && !record.get("observation_date").isBlank() ?
                            LocalDate.parse(record.get("observation_date")) : LocalDate.now();

                    BigDecimal rainfall = new BigDecimal(record.get("rainfall_mm"));
                    String waterSource = record.isSet("water_source_type") ? record.get("water_source_type") : village.getPrimaryWaterSource();
                    BigDecimal turbidity = new BigDecimal(record.get("turbidity_ntu"));
                    BigDecimal ph = new BigDecimal(record.get("ph_level"));
                    boolean eColi = record.isSet("e_coli_detected") && ("true".equalsIgnoreCase(record.get("e_coli_detected")) || "1".equals(record.get("e_coli_detected")) || "positive".equalsIgnoreCase(record.get("e_coli_detected")));
                    BigDecimal chlorine = record.isSet("residual_chlorine_ppm") && !record.get("residual_chlorine_ppm").isBlank() ?
                            new BigDecimal(record.get("residual_chlorine_ppm")) : BigDecimal.ZERO;
                    boolean chlorDone = record.isSet("chlorination_done") && ("true".equalsIgnoreCase(record.get("chlorination_done")) || "1".equals(record.get("chlorination_done")));
                    BigDecimal latrineCov = record.isSet("latrine_coverage_pct") && !record.get("latrine_coverage_pct").isBlank() ?
                            new BigDecimal(record.get("latrine_coverage_pct")) : village.getSanitationCoveragePct();
                    boolean openDrain = record.isSet("open_drainage_flag") && ("true".equalsIgnoreCase(record.get("open_drainage_flag")) || "1".equals(record.get("open_drainage_flag")));
                    int diarrhea = record.isSet("reported_diarrhea_cases") && !record.get("reported_diarrhea_cases").isBlank() ?
                            Integer.parseInt(record.get("reported_diarrhea_cases")) : 0;
                    int cholera = record.isSet("reported_cholera_suspects") && !record.get("reported_cholera_suspects").isBlank() ?
                            Integer.parseInt(record.get("reported_cholera_suspects")) : 0;
                    int typhoid = record.isSet("reported_typhoid_suspects") && !record.get("reported_typhoid_suspects").isBlank() ?
                            Integer.parseInt(record.get("reported_typhoid_suspects")) : 0;
                    String notes = record.isSet("notes") ? record.get("notes") : "Bulk CSV import";

                    ObservationRequest req = ObservationRequest.builder()
                            .villageId(village.getId())
                            .observationDate(date)
                            .rainfallMm(rainfall)
                            .waterSourceType(waterSource)
                            .turbidityNtu(turbidity)
                            .phLevel(ph)
                            .eColiDetected(eColi)
                            .residualChlorinePpm(chlorine)
                            .chlorinationDone(chlorDone)
                            .latrineCoveragePct(latrineCov)
                            .openDrainageFlag(openDrain)
                            .reportedDiarrheaCases(diarrhea)
                            .reportedCholeraSuspects(cholera)
                            .reportedTyphoidSuspects(typhoid)
                            .notes(notes)
                            .submissionChannel("CSV_BULK")
                            .build();

                    ObservationResponse response = recordObservation(req, uploadedBy);
                    imported.add(response);
                } catch (Exception ex) {
                    errors.add("Row " + totalRows + ": " + ex.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse CSV file", e);
            throw new BadRequestException("Failed to parse CSV file: " + e.getMessage());
        }

        return BulkUploadResultDto.builder()
                .totalRows(totalRows)
                .successfulImports(imported.size())
                .failedRows(errors.size())
                .errorMessages(errors)
                .importedObservations(imported)
                .build();
    }

    public ObservationResponse mapToResponse(Observation obs, Prediction pred, Alert alert) {
        PredictionResponse predDto = null;
        if (pred != null) {
            predDto = mlPredictionService.mapToResponse(pred);
            if (alert != null) {
                predDto.setTriggeredAlert(alertService.mapToDto(alert));
            }
        }

        return ObservationResponse.builder()
                .id(obs.getId())
                .villageId(obs.getVillage().getId())
                .villageName(obs.getVillage().getVillageName())
                .villageCode(obs.getVillage().getVillageCode())
                .districtName(obs.getVillage().getDistrict().getDistrictName())
                .state(obs.getVillage().getDistrict().getState())
                .recordedByUserId(obs.getRecordedByUser().getId())
                .recordedByUserName(obs.getRecordedByUser().getFullName())
                .observationDate(obs.getObservationDate())
                .rainfallMm(obs.getRainfallMm())
                .waterSourceType(obs.getWaterSourceType())
                .turbidityNtu(obs.getTurbidityNtu())
                .phLevel(obs.getPhLevel())
                .eColiDetected(obs.getEColiDetected())
                .residualChlorinePpm(obs.getResidualChlorinePpm())
                .chlorinationDone(obs.getChlorinationDone())
                .latrineCoveragePct(obs.getLatrineCoveragePct())
                .openDrainageFlag(obs.getOpenDrainageFlag())
                .reportedDiarrheaCases(obs.getReportedDiarrheaCases())
                .reportedCholeraSuspects(obs.getReportedCholeraSuspects())
                .reportedTyphoidSuspects(obs.getReportedTyphoidSuspects())
                .totalGastroCases(obs.getTotalGastroCases())
                .notes(obs.getNotes())
                .submissionChannel(obs.getSubmissionChannel())
                .syncStatus(obs.getSyncStatus())
                .createdAt(obs.getCreatedAt())
                .prediction(predDto)
                .build();
    }

    public ObservationResponse mapToResponseSimple(Observation obs) {
        Prediction pred = predictionRepository.findByObservationId(obs.getId()).orElse(null);
        return mapToResponse(obs, pred, null);
    }
}
