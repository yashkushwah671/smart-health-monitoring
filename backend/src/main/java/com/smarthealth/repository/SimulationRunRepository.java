package com.smarthealth.repository;

import com.smarthealth.model.SimulationRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SimulationRunRepository extends JpaRepository<SimulationRun, Long> {
    List<SimulationRun> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<SimulationRun> findByVillageIdOrderByCreatedAtDesc(Long villageId);
    List<SimulationRun> findTop20ByOrderByCreatedAtDesc();
}
