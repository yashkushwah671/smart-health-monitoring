package com.smarthealth.repository;

import com.smarthealth.model.Prediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PredictionRepository extends JpaRepository<Prediction, Long> {
    Optional<Prediction> findByObservationId(Long observationId);
    List<Prediction> findByVillageIdOrderByCreatedAtDesc(Long villageId);
    List<Prediction> findByVillageDistrictIdOrderByCreatedAtDesc(Long districtId);
    List<Prediction> findTop20ByOrderByCreatedAtDesc();

    @Query("SELECT p FROM Prediction p WHERE p.id IN " +
           "(SELECT MAX(p2.id) FROM Prediction p2 GROUP BY p2.village.id)")
    List<Prediction> findLatestPredictionsForEachVillage();

    @Query("SELECT COUNT(p) FROM Prediction p WHERE p.riskCategory = :category AND p.id IN " +
           "(SELECT MAX(p2.id) FROM Prediction p2 GROUP BY p2.village.id)")
    Long countLatestByRiskCategory(@Param("category") String category);
}
