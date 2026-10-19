package com.smarthealth.controller;

import com.smarthealth.model.District;
import com.smarthealth.model.Village;
import com.smarthealth.service.VillageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Villages & Districts", description = "Geospatial administrative management endpoints for Northeast India")
public class VillageController {

    private final VillageService villageService;

    @GetMapping("/villages")
    @Operation(summary = "Get all registered villages")
    public ResponseEntity<List<Village>> getAllVillages(
            @RequestParam(required = false) Long districtId) {
        if (districtId != null) {
            return ResponseEntity.ok(villageService.getVillagesByDistrict(districtId));
        }
        return ResponseEntity.ok(villageService.getAllVillages());
    }

    @GetMapping("/villages/{id}")
    @Operation(summary = "Get village details by ID")
    public ResponseEntity<Village> getVillageById(@PathVariable Long id) {
        return ResponseEntity.ok(villageService.getVillageById(id));
    }

    @PostMapping("/villages")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISTRICT_OFFICER')")
    @Operation(summary = "Create a new village record (Admin/DHO)")
    public ResponseEntity<Village> createVillage(
            @RequestBody Village village,
            @RequestParam Long districtId,
            @RequestParam(required = false) Long ashaUserId) {
        Village created = villageService.createVillage(village, districtId, ashaUserId);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/villages/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DISTRICT_OFFICER')")
    @Operation(summary = "Update village attributes (Admin/DHO)")
    public ResponseEntity<Village> updateVillage(
            @PathVariable Long id,
            @RequestBody Village village,
            @RequestParam(required = false) Long districtId,
            @RequestParam(required = false) Long ashaUserId) {
        Village updated = villageService.updateVillage(id, village, districtId, ashaUserId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/villages/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete village (Admin only)")
    public ResponseEntity<Void> deleteVillage(@PathVariable Long id) {
        villageService.deleteVillage(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/districts")
    @Operation(summary = "Get all Northeast India surveillance districts")
    public ResponseEntity<List<District>> getAllDistricts() {
        return ResponseEntity.ok(villageService.getAllDistricts());
    }
}
