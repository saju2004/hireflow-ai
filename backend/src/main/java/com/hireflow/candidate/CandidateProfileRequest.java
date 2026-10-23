package com.hireflow.candidate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateProfileRequest {
    private String headline;
    private String summary;
    private String phone;
    private String location;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;
    private Double yearsOfExperience;
    private String skillsText;
}
