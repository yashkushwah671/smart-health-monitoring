package com.smarthealth.repository;

import com.smarthealth.model.Alert;
import com.smarthealth.model.AlertStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    Optional<Alert> findByAlertCode(String alertCode);
    Optional<Alert> findByPredictionId(Long predictionId);
    List<Alert> findByStatusOrderByCreatedAtDesc(AlertStatus status);
    List<Alert> findByVillageIdOrderByCreatedAtDesc(Long villageId);
    List<Alert> findByVillageDistrictIdOrderByCreatedAtDesc(Long districtId);
    List<Alert> findTop15ByOrderByCreatedAtDesc();

    Long countByStatus(AlertStatus status);

    @Query("SELECT COUNT(a) FROM Alert a WHERE a.status = 'NEW'")
    Long countActiveAlerts();
}
