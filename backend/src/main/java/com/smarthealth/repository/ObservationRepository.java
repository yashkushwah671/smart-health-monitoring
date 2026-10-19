package com.smarthealth.repository;

import com.smarthealth.model.Observation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ObservationRepository extends JpaRepository<Observation, Long> {
    List<Observation> findByVillageIdOrderByObservationDateDesc(Long villageId);
    List<Observation> findByVillageDistrictIdOrderByObservationDateDesc(Long districtId);
    List<Observation> findByRecordedByUserIdOrderByObservationDateDesc(Long userId);
    List<Observation> findTop20ByOrderByCreatedAtDesc();

    @Query("SELECT o FROM Observation o WHERE o.observationDate BETWEEN :startDate AND :endDate ORDER BY o.observationDate DESC")
    List<Observation> findByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    Optional<Observation> findTopByVillageIdOrderByObservationDateDesc(Long villageId);
}
