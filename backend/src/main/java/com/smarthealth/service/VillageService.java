package com.smarthealth.service;

import com.smarthealth.exception.BadRequestException;
import com.smarthealth.exception.ResourceNotFoundException;
import com.smarthealth.model.District;
import com.smarthealth.model.User;
import com.smarthealth.model.Village;
import com.smarthealth.repository.DistrictRepository;
import com.smarthealth.repository.UserRepository;
import com.smarthealth.repository.VillageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VillageService {

    private final VillageRepository villageRepository;
    private final DistrictRepository districtRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<Village> getAllVillages() {
        return villageRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Village getVillageById(Long id) {
        return villageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Village not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Village> getVillagesByDistrict(Long districtId) {
        return villageRepository.findByDistrictId(districtId);
    }

    @Transactional(readOnly = true)
    public List<District> getAllDistricts() {
        return districtRepository.findAll();
    }

    @Transactional
    public Village createVillage(Village village, Long districtId, Long ashaUserId) {
        if (villageRepository.findByVillageCode(village.getVillageCode()).isPresent()) {
            throw new BadRequestException("Village code already exists: " + village.getVillageCode());
        }

        District district = districtRepository.findById(districtId)
                .orElseThrow(() -> new ResourceNotFoundException("District not found with id: " + districtId));
        village.setDistrict(district);

        if (ashaUserId != null) {
            User asha = userRepository.findById(ashaUserId)
                    .orElseThrow(() -> new ResourceNotFoundException("ASHA User not found with id: " + ashaUserId));
            village.setContactAsha(asha);
        }

        return villageRepository.save(village);
    }

    @Transactional
    public Village updateVillage(Long id, Village updatedData, Long districtId, Long ashaUserId) {
        Village existing = getVillageById(id);
        
        existing.setVillageName(updatedData.getVillageName());
        existing.setSubCentre(updatedData.getSubCentre());
        existing.setLatitude(updatedData.getLatitude());
        existing.setLongitude(updatedData.getLongitude());
        existing.setEstimatedPopulation(updatedData.getEstimatedPopulation());
        existing.setPrimaryWaterSource(updatedData.getPrimaryWaterSource());
        existing.setSanitationCoveragePct(updatedData.getSanitationCoveragePct());
        existing.setFloodVulnerabilityIndex(updatedData.getFloodVulnerabilityIndex());

        if (districtId != null) {
            District district = districtRepository.findById(districtId)
                    .orElseThrow(() -> new ResourceNotFoundException("District not found with id: " + districtId));
            existing.setDistrict(district);
        }

        if (ashaUserId != null) {
            User asha = userRepository.findById(ashaUserId)
                    .orElseThrow(() -> new ResourceNotFoundException("ASHA User not found with id: " + ashaUserId));
            existing.setContactAsha(asha);
        }

        return villageRepository.save(existing);
    }

    @Transactional
    public void deleteVillage(Long id) {
        if (!villageRepository.existsById(id)) {
            throw new ResourceNotFoundException("Village not found with id: " + id);
        }
        villageRepository.deleteById(id);
    }
}
