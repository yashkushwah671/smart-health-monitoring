package com.smarthealth.repository;

import com.smarthealth.model.SyncLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SyncLogRepository extends JpaRepository<SyncLog, Long> {
    Optional<SyncLog> findByClientSyncId(String clientSyncId);
    List<SyncLog> findByUserIdOrderBySyncTimestampDesc(Long userId);
}
