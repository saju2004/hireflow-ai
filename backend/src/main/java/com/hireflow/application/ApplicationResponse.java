package com.hireflow.application;

import com.hireflow.job.EmploymentType;
import com.hireflow.job.ExperienceLevel;
import com.hireflow.job.WorkplaceType;
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
public class ApplicationResponse {
    private UUID id;
    private UUID jobId;
    private String jobTitle;
    private String organizationName;
    private String organizationSlug;
    private String jobLocation;
    private WorkplaceType workplaceType;
    private ExperienceLevel experienceLevel;
    private EmploymentType employmentType;
    private UUID candidateProfileId;
    private String candidateName;
    private String candidateEmail;
    private String candidateHeadline;
    private String candidateLocation;
    private UUID resumeId;
    private String resumeFileName;
    private ApplicationStatus status;
    private String coverLetter;
    private String rejectionReason;
    private String internalNotes;
    private Double matchScore;
    private Instant appliedAt;
    private Instant updatedAt;

    public static ApplicationResponse fromEntity(Application app, Double matchScore, boolean includeInternalNotes) {
        return ApplicationResponse.builder()
                .id(app.getId())
                .jobId(app.getJob().getId())
                .jobTitle(app.getJob().getTitle())
                .organizationName(app.getJob().getOrganization().getName())
                .organizationSlug(app.getJob().getOrganization().getSlug())
                .jobLocation(app.getJob().getLocation())
                .workplaceType(app.getJob().getWorkplaceType())
                .experienceLevel(app.getJob().getExperienceLevel())
                .employmentType(app.getJob().getEmploymentType())
                .candidateProfileId(app.getCandidateProfile().getId())
                .candidateName(app.getCandidateProfile().getUser().getFullName())
                .candidateEmail(app.getCandidateProfile().getUser().getEmail())
                .candidateHeadline(app.getCandidateProfile().getHeadline())
                .candidateLocation(app.getCandidateProfile().getLocation())
                .resumeId(app.getResume() != null ? app.getResume().getId() : null)
                .resumeFileName(app.getResume() != null ? app.getResume().getFileName() : null)
                .status(app.getStatus())
                .coverLetter(app.getCoverLetter())
                .rejectionReason(app.getRejectionReason())
                .internalNotes(includeInternalNotes ? app.getInternalNotes() : null)
                .matchScore(matchScore)
                .appliedAt(app.getAppliedAt())
                .updatedAt(app.getUpdatedAt())
                .build();
    }
}
