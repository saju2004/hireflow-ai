package com.hireflow.application;

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
public class ApplicationEventResponse {
    private UUID id;
    private ApplicationStatus previousStatus;
    private ApplicationStatus newStatus;
    private ApplicationEventType eventType;
    private String actorName;
    private String notes;
    private Instant createdAt;

    public static ApplicationEventResponse fromEntity(ApplicationEvent event) {
        return ApplicationEventResponse.builder()
                .id(event.getId())
                .previousStatus(event.getPreviousStatus())
                .newStatus(event.getNewStatus())
                .eventType(event.getEventType())
                .actorName(event.getActor() != null ? event.getActor().getFullName() : "System")
                .notes(event.getNotes())
                .createdAt(event.getCreatedAt())
                .build();
    }
}
