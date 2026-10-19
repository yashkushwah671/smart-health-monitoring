package com.smarthealth.service;

import com.smarthealth.dto.*;
import com.smarthealth.model.SyncLog;
import com.smarthealth.model.User;
import com.smarthealth.repository.SyncLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SyncService {

    private final ObservationService observationService;
    private final SyncLogRepository syncLogRepository;

    @Transactional
    public SyncResponse syncOfflineObservations(SyncRequest syncRequest, User currentUser) {
        String clientSyncId = syncRequest.getClientSyncId() != null ?
                syncRequest.getClientSyncId() : "SYNC-" + System.currentTimeMillis();

        List<ObservationResponse> synced = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        int conflicts = 0;

        if (syncRequest.getOfflineObservations() != null) {
            for (ObservationRequest req : syncRequest.getOfflineObservations()) {
                try {
                    req.setSubmissionChannel("OFFLINE_SYNC");
                    ObservationResponse res = observationService.recordObservation(req, currentUser);
                    synced.add(res);
                } catch (Exception ex) {
                    log.error("Failed to sync offline record: {}", ex.getMessage());
                    errors.add("Error syncing record for village " + req.getVillageId() + ": " + ex.getMessage());
                    conflicts++;
                }
            }
        }

        SyncLog logEntry = SyncLog.builder()
                .clientSyncId(clientSyncId)
                .user(currentUser)
                .recordsSynced(synced.size())
                .conflictsResolved(conflicts)
                .status(errors.isEmpty() ? "SUCCESS" : "PARTIAL_SUCCESS")
                .build();

        syncLogRepository.save(logEntry);

        return SyncResponse.builder()
                .clientSyncId(clientSyncId)
                .totalReceived(syncRequest.getOfflineObservations() != null ? syncRequest.getOfflineObservations().size() : 0)
                .successfullySynced(synced.size())
                .conflictsResolved(conflicts)
                .syncedRecords(synced)
                .syncErrors(errors)
                .status(errors.isEmpty() ? "SUCCESS" : "PARTIAL_SUCCESS")
                .build();
    }
}
