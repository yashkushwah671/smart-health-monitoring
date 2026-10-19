package com.smarthealth.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "simulation_runs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SimulationRun {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "village_id", nullable = false)
    private Village village;

    @Column(name = "base_rainfall_mm", nullable = false, precision = 7, scale = 2)
    private BigDecimal baseRainfallMm;

    @Column(name = "simulated_rainfall_mm", nullable = false, precision = 7, scale = 2)
    private BigDecimal simulatedRainfallMm;

    @Column(name = "rainfall_delta_pct", nullable = false, precision = 5, scale = 2)
    private BigDecimal rainfallDeltaPct;

    @Column(name = "base_risk_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal baseRiskScore;

    @Column(name = "base_risk_category", nullable = false, length = 20)
    private String baseRiskCategory;

    @Column(name = "simulated_risk_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal simulatedRiskScore;

    @Column(name = "simulated_risk_category", nullable = false, length = 20)
    private String simulatedRiskCategory;

    @Column(name = "delta_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal deltaScore;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
