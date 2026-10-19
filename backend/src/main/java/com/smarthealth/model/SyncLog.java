package com.smarthealth.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sync_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SyncLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "client_sync_id", nullable = false, length = 100)
    private String clientSyncId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "records_synced", nullable = false)
    @Builder.Default
    private Integer recordsSynced = 0;

    @Column(name = "conflicts_resolved", nullable = false)
    @Builder.Default
    private Integer conflictsResolved = 0;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "SUCCESS";

    @Column(name = "sync_timestamp", updatable = false)
    private LocalDateTime syncTimestamp;

    @PrePersist
    protected void onCreate() {
        if (syncTimestamp == null) {
            syncTimestamp = LocalDateTime.now();
        }
    }
}
