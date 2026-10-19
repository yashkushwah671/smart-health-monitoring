package com.smarthealth.controller;

import com.smarthealth.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Reports & Export", description = "Epidemiological surveillance reporting and CSV export endpoints")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/export-csv")
    @Operation(summary = "Export complete surveillance observation and risk history as CSV")
    public ResponseEntity<byte[]> exportCsv(
            @RequestParam(required = false) Long districtId,
            @RequestParam(required = false) Long villageId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        byte[] csvBytes = reportService.exportObservationsToCsv(districtId, villageId, startDate, endDate);
        String filename = "SmartHealth_Surveillance_" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }
}
