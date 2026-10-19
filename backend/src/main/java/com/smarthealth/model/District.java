package com.smarthealth.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "districts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class District {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String state;

    @Column(name = "district_name", nullable = false, length = 100)
    private String districtName;

    @Column(name = "district_code", nullable = false, unique = true, length = 20)
    private String districtCode;

    @Column(name = "total_population")
    private Integer totalPopulation;

    @Column(name = "primary_river_basin", length = 100)
    private String primaryRiverBasin;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
