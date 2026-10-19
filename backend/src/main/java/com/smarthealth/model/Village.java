package com.smarthealth.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "villages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Village {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "district_id", nullable = false)
    private District district;

    @Column(name = "village_name", nullable = false, length = 150)
    private String villageName;

    @Column(name = "village_code", nullable = false, unique = true, length = 50)
    private String villageCode;

    @Column(name = "sub_centre", length = 150)
    private String subCentre;

    @Column(nullable = false, precision = 10, scale = 6)
    private BigDecimal latitude;

    @Column(nullable = false, precision = 10, scale = 6)
    private BigDecimal longitude;

    @Column(name = "estimated_population", nullable = false)
    @Builder.Default
    private Integer estimatedPopulation = 500;

    @Column(name = "primary_water_source", length = 100)
    @Builder.Default
    private String primaryWaterSource = "Tube Well / Hand Pump";

    @Column(name = "sanitation_coverage_pct", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal sanitationCoveragePct = new BigDecimal("60.00");

    @Column(name = "flood_vulnerability_index", length = 20)
    @Builder.Default
    private String floodVulnerabilityIndex = "MEDIUM"; // LOW, MEDIUM, HIGH, VERY_HIGH

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "contact_asha_id")
    private User contactAsha;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (estimatedPopulation == null) estimatedPopulation = 500;
        if (primaryWaterSource == null) primaryWaterSource = "Tube Well / Hand Pump";
        if (sanitationCoveragePct == null) sanitationCoveragePct = new BigDecimal("60.00");
        if (floodVulnerabilityIndex == null) floodVulnerabilityIndex = "MEDIUM";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
