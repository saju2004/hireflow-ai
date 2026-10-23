package com.hireflow.candidate;

import com.hireflow.common.ResourceNotFoundException;
import com.hireflow.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CandidateProfileService {

    private final CandidateProfileRepository candidateProfileRepository;

    @Transactional(readOnly = true)
    public CandidateProfileResponse getCurrentCandidateProfile() {
        UUID userId = SecurityUtils.getCurrentUserId();
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found for user: " + userId));

        return CandidateProfileResponse.fromEntity(profile);
    }

    @Transactional
    public CandidateProfileResponse updateCurrentCandidateProfile(CandidateProfileRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        CandidateProfile profile = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found for user: " + userId));

        if (request.getHeadline() != null) profile.setHeadline(request.getHeadline());
        if (request.getSummary() != null) profile.setSummary(request.getSummary());
        if (request.getPhone() != null) profile.setPhone(request.getPhone());
        if (request.getLocation() != null) profile.setLocation(request.getLocation());
        if (request.getLinkedinUrl() != null) profile.setLinkedinUrl(request.getLinkedinUrl());
        if (request.getGithubUrl() != null) profile.setGithubUrl(request.getGithubUrl());
        if (request.getPortfolioUrl() != null) profile.setPortfolioUrl(request.getPortfolioUrl());
        if (request.getYearsOfExperience() != null) profile.setYearsOfExperience(request.getYearsOfExperience());
        if (request.getSkillsText() != null) profile.setSkillsText(request.getSkillsText());

        CandidateProfile saved = candidateProfileRepository.save(profile);
        return CandidateProfileResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public CandidateProfileResponse getProfileById(UUID profileId) {
        CandidateProfile profile = candidateProfileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found: " + profileId));

        return CandidateProfileResponse.fromEntity(profile);
    }
}
