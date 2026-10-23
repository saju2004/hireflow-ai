package com.hireflow.candidate;

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
public class CandidateProfileResponse {
    private UUID id;
    private UUID userId;
    private String email;
    private String firstName;
    private String lastName;
    private String headline;
    private String summary;
    private String phone;
    private String location;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;
    private Double yearsOfExperience;
    private String skillsText;
    private Instant createdAt;
    private Instant updatedAt;

    public static CandidateProfileResponse fromEntity(CandidateProfile profile) {
        return CandidateProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .email(profile.getUser().getEmail())
                .firstName(profile.getUser().getFirstName())
                .lastName(profile.getUser().getLastName())
                .headline(profile.getHeadline())
                .summary(profile.getSummary())
                .phone(profile.getPhone())
                .location(profile.getLocation())
                .linkedinUrl(profile.getLinkedinUrl())
                .githubUrl(profile.getGithubUrl())
                .portfolioUrl(profile.getPortfolioUrl())
                .yearsOfExperience(profile.getYearsOfExperience())
                .skillsText(profile.getSkillsText())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }
}
