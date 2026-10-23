package com.hireflow.job;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobResponse {
    private UUID id;
    private UUID organizationId;
    private String organizationName;
    private String organizationSlug;
    private String organizationLogoUrl;
    private String title;
    private String slug;
    private String description;
    private String responsibilities;
    private ExperienceLevel experienceLevel;
    private EmploymentType employmentType;
    private String location;
    private WorkplaceType workplaceType;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private String currency;
    private JobStatus status;
    private Instant publishedAt;
    private List<JobSkillDto> skills;
    private long applicantCount;
    private Instant createdAt;
    private Instant updatedAt;

    public static JobResponse fromEntity(Job job, long applicantCount) {
        return JobResponse.builder()
                .id(job.getId())
                .organizationId(job.getOrganization().getId())
                .organizationName(job.getOrganization().getName())
                .organizationSlug(job.getOrganization().getSlug())
                .organizationLogoUrl(job.getOrganization().getLogoUrl())
                .title(job.getTitle())
                .slug(job.getSlug())
                .description(job.getDescription())
                .responsibilities(job.getResponsibilities())
                .experienceLevel(job.getExperienceLevel())
                .employmentType(job.getEmploymentType())
                .location(job.getLocation())
                .workplaceType(job.getWorkplaceType())
                .salaryMin(job.getSalaryMin())
                .salaryMax(job.getSalaryMax())
                .currency(job.getCurrency())
                .status(job.getStatus())
                .publishedAt(job.getPublishedAt())
                .skills(job.getSkills() != null
                        ? job.getSkills().stream().map(JobSkillDto::fromEntity).collect(Collectors.toList())
                        : List.of())
                .applicantCount(applicantCount)
                .createdAt(job.getCreatedAt())
                .updatedAt(job.getUpdatedAt())
                .build();
    }
}
