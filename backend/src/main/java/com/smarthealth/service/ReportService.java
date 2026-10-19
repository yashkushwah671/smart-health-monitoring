package com.smarthealth.service;

import com.smarthealth.model.Observation;
import com.smarthealth.model.Prediction;
import com.smarthealth.repository.ObservationRepository;
import com.smarthealth.repository.PredictionRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ObservationRepository observationRepository;
    private final PredictionRepository predictionRepository;

    @Transactional(readOnly = true)
    public byte[] exportObservationsToCsv(Long districtId, Long villageId, LocalDate startDate, LocalDate endDate) {
        List<Observation> list = observationRepository.findAll();

        if (villageId != null) {
            list = list.stream().filter(o -> o.getVillage().getId().equals(villageId)).toList();
        } else if (districtId != null) {
            list = list.stream().filter(o -> o.getVillage().getDistrict().getId().equals(districtId)).toList();
        }

        if (startDate != null) {
            list = list.stream().filter(o -> !o.getObservationDate().isBefore(startDate)).toList();
        }
        if (endDate != null) {
            list = list.stream().filter(o -> !o.getObservationDate().isAfter(endDate)).toList();
        }

        try (ByteArrayOutputStream out = new ByteArrayOutputStream();
             CSVPrinter csvPrinter = new CSVPrinter(new PrintWriter(new OutputStreamWriter(out, StandardCharsets.UTF_8)),
                     CSVFormat.DEFAULT.builder().setHeader(
                             "Observation_ID", "Village_Code", "Village_Name", "District", "State",
                             "Observation_Date", "Rainfall_mm", "Water_Source", "Turbidity_NTU", "pH",
                             "E_Coli_Detected", "Residual_Chlorine_ppm", "Chlorination_Done",
                             "Latrine_Coverage_Pct", "Open_Drainage", "Diarrhea_Cases", "Cholera_Suspects",
                             "Typhoid_Suspects", "Total_Gastro_Cases", "Risk_Score", "Risk_Category",
                             "Confidence_Pct", "Model_Version", "Submission_Channel", "Created_At"
                     ).build())) {

            for (Observation o : list) {
                Prediction p = predictionRepository.findByObservationId(o.getId()).orElse(null);
                csvPrinter.printRecord(
                        o.getId(),
                        o.getVillage().getVillageCode(),
                        o.getVillage().getVillageName(),
                        o.getVillage().getDistrict().getDistrictName(),
                        o.getVillage().getDistrict().getState(),
                        o.getObservationDate(),
                        o.getRainfallMm(),
                        o.getWaterSourceType(),
                        o.getTurbidityNtu(),
                        o.getPhLevel(),
                        o.getEColiDetected(),
                        o.getResidualChlorinePpm(),
                        o.getChlorinationDone(),
                        o.getLatrineCoveragePct(),
                        o.getOpenDrainageFlag(),
                        o.getReportedDiarrheaCases(),
                        o.getReportedCholeraSuspects(),
                        o.getReportedTyphoidSuspects(),
                        o.getTotalGastroCases(),
                        p != null ? p.getRiskScore() : "N/A",
                        p != null ? p.getRiskCategory() : "N/A",
                        p != null ? p.getConfidencePct() : "N/A",
                        p != null ? p.getModelVersion() : "N/A",
                        o.getSubmissionChannel(),
                        o.getCreatedAt()
                );
            }
            csvPrinter.flush();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating surveillance CSV report: " + e.getMessage(), e);
        }
    }
}
