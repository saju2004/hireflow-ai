package com.hireflow.organization;

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
public class OrganizationResponse {
    private UUID id;
    private String name;
    private String slug;
    private String domain;
    private String logoUrl;
    private OrganizationStatus status;
    private Instant createdAt;

    public static OrganizationResponse fromEntity(Organization org) {
        return OrganizationResponse.builder()
                .id(org.getId())
                .name(org.getName())
                .slug(org.getSlug())
                .domain(org.getDomain())
                .logoUrl(org.getLogoUrl())
                .status(org.getStatus())
                .createdAt(org.getCreatedAt())
                .build();
    }
}
