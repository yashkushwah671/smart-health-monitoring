package com.smarthealth.config;

import com.smarthealth.model.*;
import com.smarthealth.repository.*;
import com.smarthealth.service.AlertService;
import com.smarthealth.service.MlPredictionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final DistrictRepository districtRepository;
    private final VillageRepository villageRepository;
    private final ObservationRepository observationRepository;
    private final PredictionRepository predictionRepository;
    private final AlertRepository alertRepository;
    private final PasswordEncoder passwordEncoder;
    private final MlPredictionService mlPredictionService;
    private final AlertService alertService;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (roleRepository.count() > 0) {
            log.info("Database already contains data. Skipping initial seeding.");
            return;
        }

        log.info("Initializing Smart Health database with Northeast India surveillance records...");

        // 1. Seed Roles
        Role adminRole = roleRepository.save(Role.builder().name(ERole.ROLE_ADMIN).description("State Administrator").build());
        Role dhoRole = roleRepository.save(Role.builder().name(ERole.ROLE_DISTRICT_OFFICER).description("District Health Officer").build());
        Role ashaRole = roleRepository.save(Role.builder().name(ERole.ROLE_ASHA_WORKER).description("ASHA / ANM Field Worker").build());

        // 2. Seed Districts
        District majuli = districtRepository.save(District.builder().state("Assam").districtName("Majuli").districtCode("AS-MJL").totalPopulation(167300).primaryRiverBasin("Brahmaputra Island Basin").build());
        District barpeta = districtRepository.save(District.builder().state("Assam").districtName("Barpeta").districtCode("AS-BRP").totalPopulation(1693000).primaryRiverBasin("Manas / Brahmaputra Basin").build());
        District dhemaji = districtRepository.save(District.builder().state("Assam").districtName("Dhemaji").districtCode("AS-DHJ").totalPopulation(686133).primaryRiverBasin("Subansiri / Brahmaputra Basin").build());
        District khasi = districtRepository.save(District.builder().state("Meghalaya").districtName("East Khasi Hills").districtCode("ML-EKH").totalPopulation(825922).primaryRiverBasin("Umngot / Wah Umkhrah Basin").build());
        District garo = districtRepository.save(District.builder().state("Meghalaya").districtName("West Garo Hills").districtCode("ML-WGH").totalPopulation(643291).primaryRiverBasin("Simsang / Jinjiram Basin").build());
        District dhalai = districtRepository.save(District.builder().state("Tripura").districtName("Dhalai").districtCode("TR-DHL").totalPopulation(378230).primaryRiverBasin("Dhalai / Manu River Basin").build());
        District papum = districtRepository.save(District.builder().state("Arunachal Pradesh").districtName("Papum Pare").districtCode("AR-PAP").totalPopulation(176573).primaryRiverBasin("Dikrong Basin").build());
        District champhai = districtRepository.save(District.builder().state("Mizoram").districtName("Champhai").districtCode("MZ-CMP").totalPopulation(125745).primaryRiverBasin("Tiau River Basin").build());

        String defaultPass = passwordEncoder.encode("password123");

        // 3. Seed Demo Users
        User adminUser = userRepository.save(User.builder().username("admin").password(defaultPass).fullName("Dr. Bhaskar Sarma").email("admin.health@assam.gov.in").phone("+91 9435012345").role(adminRole).state("Assam").subCentre("State Surveillance Unit, Guwahati").isActive(true).build());
        User dhoMajuli = userRepository.save(User.builder().username("dho_majuli").password(defaultPass).fullName("Dr. Pranjal Saikia (DHO)").email("dho.majuli@assam.gov.in").phone("+91 9435123456").role(dhoRole).state("Assam").district(majuli).subCentre("Garamur Civil Hospital HQ").isActive(true).build());
        User dhoKhasi = userRepository.save(User.builder().username("dho_khasi").password(defaultPass).fullName("Dr. Badaplin Lyngdoh (DHO)").email("dho.khasi@meghalaya.gov.in").phone("+91 9436123456").role(dhoRole).state("Meghalaya").district(khasi).subCentre("Shillong District Health Office").isActive(true).build());
        User ashaMajuli = userRepository.save(User.builder().username("asha_majuli_1").password(defaultPass).fullName("Runumi Bora (ASHA)").email("runumi.asha@majuli.nhm.in").phone("+91 9854011223").role(ashaRole).state("Assam").district(majuli).subCentre("Kamalabari Sub-Centre").isActive(true).build());
        User ashaBarpeta = userRepository.save(User.builder().username("asha_barpeta_1").password(defaultPass).fullName("Anowara Begum (ASHA)").email("anowara.asha@barpeta.nhm.in").phone("+91 9854022334").role(ashaRole).state("Assam").district(barpeta).subCentre("Howly Rural Sub-Centre").isActive(true).build());
        User ashaKhasi = userRepository.save(User.builder().username("asha_khasi_1").password(defaultPass).fullName("Phidalia Marwein (ANM)").email("phidalia.anm@khasi.nhm.in").phone("+91 9854033445").role(ashaRole).state("Meghalaya").district(khasi).subCentre("Cherrapunji / Sohra CHC").isActive(true).build());

        // 4. Seed Villages
        List<Village> villages = new ArrayList<>();
        // Majuli
        villages.add(Village.builder().district(majuli).villageName("Garamur Chariali").villageCode("AS-MJL-001").subCentre("Garamur Sub-Centre").latitude(new BigDecimal("26.963200")).longitude(new BigDecimal("94.218500")).estimatedPopulation(1850).primaryWaterSource("Tube Well / Hand Pump").sanitationCoveragePct(new BigDecimal("68.00")).floodVulnerabilityIndex("HIGH").contactAsha(ashaMajuli).build());
        villages.add(Village.builder().district(majuli).villageName("Kamalabari Ghat").villageCode("AS-MJL-002").subCentre("Kamalabari Sub-Centre").latitude(new BigDecimal("26.915000")).longitude(new BigDecimal("94.175000")).estimatedPopulation(2200).primaryWaterSource("River / Shallow Borewell").sanitationCoveragePct(new BigDecimal("52.00")).floodVulnerabilityIndex("VERY_HIGH").contactAsha(ashaMajuli).build());
        villages.add(Village.builder().district(majuli).villageName("Jengraimukh").villageCode("AS-MJL-003").subCentre("Jengraimukh Sub-Centre").latitude(new BigDecimal("27.042100")).longitude(new BigDecimal("94.331200")).estimatedPopulation(1420).primaryWaterSource("Ring Well / Stream").sanitationCoveragePct(new BigDecimal("58.00")).floodVulnerabilityIndex("HIGH").contactAsha(ashaMajuli).build());
        villages.add(Village.builder().district(majuli).villageName("Salmora Pottery Village").villageCode("AS-MJL-004").subCentre("Salmora Sub-Centre").latitude(new BigDecimal("26.882000")).longitude(new BigDecimal("94.298000")).estimatedPopulation(1150).primaryWaterSource("River / Pond Sand Filter").sanitationCoveragePct(new BigDecimal("44.00")).floodVulnerabilityIndex("VERY_HIGH").contactAsha(ashaMajuli).build());

        // Barpeta
        villages.add(Village.builder().district(barpeta).villageName("Howly North Ward").villageCode("AS-BRP-001").subCentre("Howly Sub-Centre").latitude(new BigDecimal("26.431000")).longitude(new BigDecimal("90.968000")).estimatedPopulation(2900).primaryWaterSource("Deep Tube Well").sanitationCoveragePct(new BigDecimal("75.00")).floodVulnerabilityIndex("MEDIUM").contactAsha(ashaBarpeta).build());
        villages.add(Village.builder().district(barpeta).villageName("Kalgachia Char Colony").villageCode("AS-BRP-002").subCentre("Kalgachia Sub-Centre").latitude(new BigDecimal("26.241500")).longitude(new BigDecimal("90.729000")).estimatedPopulation(3400).primaryWaterSource("River Bank Shallow Wells").sanitationCoveragePct(new BigDecimal("36.00")).floodVulnerabilityIndex("VERY_HIGH").contactAsha(ashaBarpeta).build());
        villages.add(Village.builder().district(barpeta).villageName("Sarthebari Bell Metal").villageCode("AS-BRP-003").subCentre("Sarthebari Sub-Centre").latitude(new BigDecimal("26.378000")).longitude(new BigDecimal("91.135000")).estimatedPopulation(1980).primaryWaterSource("Piped Water Supply (JJM)").sanitationCoveragePct(new BigDecimal("82.00")).floodVulnerabilityIndex("LOW").contactAsha(ashaBarpeta).build());

        // Dhemaji
        villages.add(Village.builder().district(dhemaji).villageName("Jonai Border Village").villageCode("AS-DHJ-001").subCentre("Jonai Sub-Centre").latitude(new BigDecimal("27.834000")).longitude(new BigDecimal("95.162000")).estimatedPopulation(1650).primaryWaterSource("Spring / Tube Well").sanitationCoveragePct(new BigDecimal("62.00")).floodVulnerabilityIndex("HIGH").contactAsha(ashaMajuli).build());
        villages.add(Village.builder().district(dhemaji).villageName("Silapathar Gaon").villageCode("AS-DHJ-002").subCentre("Silapathar Sub-Centre").latitude(new BigDecimal("27.591000")).longitude(new BigDecimal("94.721000")).estimatedPopulation(2100).primaryWaterSource("Shallow Hand Pump").sanitationCoveragePct(new BigDecimal("55.00")).floodVulnerabilityIndex("HIGH").contactAsha(ashaMajuli).build());

        // East Khasi Hills
        villages.add(Village.builder().district(khasi).villageName("Sohra / Cherrapunji Rim").villageCode("ML-EKH-001").subCentre("Cherrapunji CHC").latitude(new BigDecimal("25.274000")).longitude(new BigDecimal("91.732000")).estimatedPopulation(1850).primaryWaterSource("Natural Mountain Spring").sanitationCoveragePct(new BigDecimal("88.00")).floodVulnerabilityIndex("LOW").contactAsha(ashaKhasi).build());
        villages.add(Village.builder().district(khasi).villageName("Mawsynram East").villageCode("ML-EKH-002").subCentre("Mawsynram Sub-Centre").latitude(new BigDecimal("25.298000")).longitude(new BigDecimal("91.582000")).estimatedPopulation(1200).primaryWaterSource("Stream Gravity Flow").sanitationCoveragePct(new BigDecimal("84.00")).floodVulnerabilityIndex("MEDIUM").contactAsha(ashaKhasi).build());
        villages.add(Village.builder().district(khasi).villageName("Mawlynnong Eco-Village").villageCode("ML-EKH-004").subCentre("Riwai Sub-Centre").latitude(new BigDecimal("25.201700")).longitude(new BigDecimal("91.916100")).estimatedPopulation(650).primaryWaterSource("Spring Filtered Storage").sanitationCoveragePct(new BigDecimal("98.00")).floodVulnerabilityIndex("LOW").contactAsha(ashaKhasi).build());

        // West Garo Hills
        villages.add(Village.builder().district(garo).villageName("Tura Dobasipara").villageCode("ML-WGH-001").subCentre("Tura Town Sub-Centre").latitude(new BigDecimal("25.514000")).longitude(new BigDecimal("90.203000")).estimatedPopulation(2600).primaryWaterSource("Piped Gravity Spring").sanitationCoveragePct(new BigDecimal("72.00")).floodVulnerabilityIndex("MEDIUM").contactAsha(ashaKhasi).build());
        villages.add(Village.builder().district(garo).villageName("Tikrikilla Plain").villageCode("ML-WGH-002").subCentre("Tikrikilla Sub-Centre").latitude(new BigDecimal("25.923000")).longitude(new BigDecimal("90.158000")).estimatedPopulation(1950).primaryWaterSource("Shallow Ring Well").sanitationCoveragePct(new BigDecimal("49.00")).floodVulnerabilityIndex("HIGH").contactAsha(ashaKhasi).build());

        // Dhalai Tripura
        villages.add(Village.builder().district(dhalai).villageName("Ambassa Tribal Basti").villageCode("TR-DHL-001").subCentre("Ambassa Sub-Centre").latitude(new BigDecimal("23.921000")).longitude(new BigDecimal("91.854000")).estimatedPopulation(1420).primaryWaterSource("River Intake & Tube Well").sanitationCoveragePct(new BigDecimal("64.00")).floodVulnerabilityIndex("MEDIUM").contactAsha(ashaMajuli).build());
        villages.add(Village.builder().district(dhalai).villageName("Gandacherra Border").villageCode("TR-DHL-002").subCentre("Gandacherra Sub-Centre").latitude(new BigDecimal("23.483000")).longitude(new BigDecimal("91.954000")).estimatedPopulation(1780).primaryWaterSource("Lake Water / Hand Pump").sanitationCoveragePct(new BigDecimal("45.00")).floodVulnerabilityIndex("HIGH").contactAsha(ashaMajuli).build());

        // Papum Pare Arunachal Pradesh
        villages.add(Village.builder().district(papum).villageName("Doimukh Foothills").villageCode("AR-PAP-001").subCentre("Doimukh Sub-Centre").latitude(new BigDecimal("27.142000")).longitude(new BigDecimal("93.754000")).estimatedPopulation(1920).primaryWaterSource("Dikrong River / Gravity Pipe").sanitationCoveragePct(new BigDecimal("70.00")).floodVulnerabilityIndex("MEDIUM").contactAsha(ashaMajuli).build());

        // Champhai Mizoram
        villages.add(Village.builder().district(champhai).villageName("Zokhawthar Border Gate").villageCode("MZ-CMP-001").subCentre("Zokhawthar Sub-Centre").latitude(new BigDecimal("23.362000")).longitude(new BigDecimal("93.382000")).estimatedPopulation(1340).primaryWaterSource("Spring Water Reservoir").sanitationCoveragePct(new BigDecimal("85.00")).floodVulnerabilityIndex("LOW").contactAsha(ashaKhasi).build());

        List<Village> savedVillages = villageRepository.saveAll(villages);

        // 5. Seed Historical Observations and Generate Predictions + Alerts
        createSeedObservation(savedVillages.get(1), ashaMajuli, LocalDate.now().minusDays(2), new BigDecimal("165.5"), "River / Shallow Borewell", new BigDecimal("28.5"), new BigDecimal("7.8"), true, new BigDecimal("0.05"), false, new BigDecimal("52.0"), true, 18, 2, 1, "Heavy Brahmaputra flood runoff entered shallow open well. Multiple children showing acute watery diarrhea.");
        createSeedObservation(savedVillages.get(5), ashaBarpeta, LocalDate.now().minusDays(1), new BigDecimal("142.0"), "River Bank Shallow Wells", new BigDecimal("24.0"), new BigDecimal("7.9"), true, BigDecimal.ZERO, false, new BigDecimal("36.0"), true, 14, 1, 0, "Char island inundated. Drinking water source submerged by floodwaters. Bleaching powder needed urgently.");
        createSeedObservation(savedVillages.get(3), ashaMajuli, LocalDate.now().minusDays(1), new BigDecimal("95.0"), "River / Pond Sand Filter", new BigDecimal("14.2"), new BigDecimal("7.4"), true, new BigDecimal("0.10"), true, new BigDecimal("44.0"), true, 6, 0, 0, "Pond sand filter overflowing due to rain. Precautionary halogen tablets distributed.");
        createSeedObservation(savedVillages.get(11), ashaKhasi, LocalDate.now(), new BigDecimal("25.0"), "Spring Filtered Storage", new BigDecimal("2.1"), new BigDecimal("7.1"), false, new BigDecimal("0.45"), true, new BigDecimal("98.0"), false, 0, 0, 0, "Spring reservoir clear. Routine halogen levels optimal.");
        createSeedObservation(savedVillages.get(6), ashaBarpeta, LocalDate.now(), new BigDecimal("35.0"), "Piped Water Supply (JJM)", new BigDecimal("1.8"), new BigDecimal("7.2"), false, new BigDecimal("0.50"), true, new BigDecimal("82.0"), false, 1, 0, 0, "Routine JJM tap water testing normal. No case clustering detected.");
        createSeedObservation(savedVillages.get(0), ashaMajuli, LocalDate.now(), new BigDecimal("78.0"), "Tube Well / Hand Pump", new BigDecimal("9.5"), new BigDecimal("7.3"), false, new BigDecimal("0.20"), true, new BigDecimal("68.0"), false, 4, 0, 0, "Slight turbidity after storm. Chlorination performed on community pump.");
        createSeedObservation(savedVillages.get(14), ashaMajuli, LocalDate.now(), new BigDecimal("130.0"), "Lake Water / Hand Pump", new BigDecimal("22.0"), new BigDecimal("7.6"), true, new BigDecimal("0.02"), false, new BigDecimal("45.0"), true, 11, 1, 0, "Surface runoff contaminated lake intake. Cluster of acute gastroenteritis reported.");

        log.info("Smart Health initial database seeding completed successfully with {} villages.", savedVillages.size());
    }

    private void createSeedObservation(Village village, User recordedBy, LocalDate date, BigDecimal rain, String source, BigDecimal turb, BigDecimal ph, boolean ecoli, BigDecimal chlorine, boolean chlorDone, BigDecimal latrine, boolean openDrain, int diarrhea, int cholera, int typhoid, String notes) {
        Observation obs = Observation.builder()
                .village(village)
                .recordedByUser(recordedBy)
                .observationDate(date)
                .rainfallMm(rain)
                .waterSourceType(source)
                .turbidityNtu(turb)
                .phLevel(ph)
                .eColiDetected(ecoli)
                .residualChlorinePpm(chlorine)
                .chlorinationDone(chlorDone)
                .latrineCoveragePct(latrine)
                .openDrainageFlag(openDrain)
                .reportedDiarrheaCases(diarrhea)
                .reportedCholeraSuspects(cholera)
                .reportedTyphoidSuspects(typhoid)
                .totalGastroCases(diarrhea + cholera + typhoid)
                .notes(notes)
                .submissionChannel("ONLINE_WEB")
                .syncStatus("SYNCED")
                .build();

        Observation saved = observationRepository.save(obs);
        Prediction pred = mlPredictionService.generateSeedPrediction(saved);
        alertService.checkAndGenerateAlert(pred);
    }
}
