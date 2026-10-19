package com.smarthealth.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "prediction_explanations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PredictionExplanation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prediction_id", nullable = false)
    @JsonBackReference
    private Prediction prediction;

    @Column(name = "factor_key", nullable = false, length = 100)
    private String factorKey;

    @Column(name = "factor_name", nullable = false, length = 150)
    private String factorName;

    @Column(name = "factor_value", length = 100)
    private String factorValue;

    @Column(name = "impact_direction", nullable = false, length = 20)
    private String impactDirection; // INCREASES_RISK, NEUTRAL, DECREASES_RISK

    @Column(name = "contribution_weight", nullable = false, precision = 6, scale = 3)
    private BigDecimal contributionWeight;

    @Column(name = "explanation_text", nullable = false, columnDefinition = "TEXT")
    private String explanationText;
}
