package com.smarthealth.repository;

import com.smarthealth.model.Village;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface VillageRepository extends JpaRepository<Village, Long> {
    Optional<Village> findByVillageCode(String villageCode);
    List<Village> findByDistrictId(Long districtId);
    List<Village> findByDistrictStateIgnoreCase(String state);
    List<Village> findByContactAshaId(Long ashaId);
}
