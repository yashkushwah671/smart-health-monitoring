package com.smarthealth.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "observations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Observation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "village_id", nullable = false)
    private Village village;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "recorded_by_user_id", nullable = false)
    private User recordedByUser;

    @Column(name = "observation_date", nullable = false)
    private LocalDate observationDate;

    @Column(name = "rainfall_mm", nullable = false, precision = 7, scale = 2)
    @Builder.Default
    private BigDecimal rainfallMm = BigDecimal.ZERO;

    @Column(name = "water_source_type", nullable = false, length = 100)
    private String waterSourceType;

    @Column(name = "turbidity_ntu", nullable = false, precision = 6, scale = 2)
    private BigDecimal turbidityNtu;

    @Column(name = "ph_level", nullable = false, precision = 4, scale = 2)
    private BigDecimal phLevel;

    @Column(name = "e_coli_detected")
    @Builder.Default
    private Boolean eColiDetected = false;

    @Column(name = "residual_chlorine_ppm", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal residualChlorinePpm = BigDecimal.ZERO;

    @Column(name = "chlorination_done")
    @Builder.Default
    private Boolean chlorinationDone = false;

    @Column(name = "latrine_coverage_pct", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal latrineCoveragePct = new BigDecimal("65.00");

    @Column(name = "open_drainage_flag")
    @Builder.Default
    private Boolean openDrainageFlag = false;

    @Column(name = "reported_diarrhea_cases", nullable = false)
    @Builder.Default
    private Integer reportedDiarrheaCases = 0;

    @Column(name = "reported_cholera_suspects", nullable = false)
    @Builder.Default
    private Integer reportedCholeraSuspects = 0;

    @Column(name = "reported_typhoid_suspects", nullable = false)
    @Builder.Default
    private Integer reportedTyphoidSuspects = 0;

    @Column(name = "total_gastro_cases", nullable = false)
    @Builder.Default
    private Integer totalGastroCases = 0;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "submission_channel", length = 30)
    @Builder.Default
    private String submissionChannel = "ONLINE_WEB"; // ONLINE_WEB, OFFLINE_SYNC, CSV_BULK

    @Column(name = "sync_status", length = 30)
    @Builder.Default
    private String syncStatus = "SYNCED"; // PENDING, SYNCED, CONFLICT_RESOLVED

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (observationDate == null) observationDate = LocalDate.now();
        if (reportedDiarrheaCases == null) reportedDiarrheaCases = 0;
        if (reportedCholeraSuspects == null) reportedCholeraSuspects = 0;
        if (reportedTyphoidSuspects == null) reportedTyphoidSuspects = 0;
        totalGastroCases = reportedDiarrheaCases + reportedCholeraSuspects + reportedTyphoidSuspects;
        if (submissionChannel == null) submissionChannel = "ONLINE_WEB";
        if (syncStatus == null) syncStatus = "SYNCED";
    }
}
