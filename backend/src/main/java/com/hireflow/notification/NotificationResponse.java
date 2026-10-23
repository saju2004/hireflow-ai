package com.hireflow.notification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private UUID id;
    private String title;
    private String message;
    private NotificationType type;
    private String link;
    private boolean isRead;
    private Instant createdAt;

    public static NotificationResponse fromEntity(Notification entity) {
        return NotificationResponse.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .message(entity.getMessage())
                .type(entity.getType())
                .link(entity.getLink())
                .isRead(entity.isRead())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
