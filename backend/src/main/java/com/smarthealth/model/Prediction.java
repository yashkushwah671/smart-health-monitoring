package com.smarthealth.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "predictions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "observation_id", nullable = false)
    private Observation observation;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "village_id", nullable = false)
    private Village village;

    @Column(name = "risk_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal riskScore; // 0.00 to 100.00

    @Column(name = "risk_category", nullable = false, length = 20)
    private String riskCategory; // LOW, MEDIUM, HIGH

    @Column(name = "confidence_pct", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal confidencePct = new BigDecimal("85.00");

    @Column(name = "model_version", length = 50)
    @Builder.Default
    private String modelVersion = "v1.2-ensemble-rf-xgb";

    @Column(name = "model_type", length = 50)
    @Builder.Default
    private String modelType = "HYBRID_ML_EPIDEMIOLOGICAL";

    @Column(name = "rainfall_factor_pct", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal rainfallFactorPct = BigDecimal.ZERO;

    @Column(name = "water_quality_factor_pct", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal waterQualityFactorPct = BigDecimal.ZERO;

    @Column(name = "case_trend_factor_pct", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal caseTrendFactorPct = BigDecimal.ZERO;

    @Column(name = "sanitation_factor_pct", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal sanitationFactorPct = BigDecimal.ZERO;

    @Column(name = "summary_recommendation", columnDefinition = "TEXT")
    private String summaryRecommendation;

    @OneToMany(mappedBy = "prediction", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    @Builder.Default
    private List<PredictionExplanation> explanations = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
