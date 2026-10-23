package com.hireflow.resume;

import com.hireflow.candidate.CandidateProfile;
import com.hireflow.candidate.CandidateProfileRepository;
import com.hireflow.common.BadRequestException;
import com.hireflow.common.ResourceNotFoundException;
import com.hireflow.matching.SkillNormalizationService;
import com.hireflow.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final FileStorageService fileStorageService;
    private final ResumeTextExtractor textExtractor;
    private final SkillNormalizationService normalizationService;

    @Transactional
    public ResumeResponse uploadResume(MultipartFile file) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        CandidateProfile profile = candidateProfileRepository.findByUserId(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found for user: " + currentUserId));

        if (file.getSize() > 10 * 1024 * 1024) {
            throw new BadRequestException("File exceeds maximum allowed size of 10MB");
        }

        // Store file physically in isolated storage
        String storageKey = fileStorageService.storeFile(file, profile.getId());

        // Extract text and handle parsing
        String extractedText;
        ParsingStatus status = ParsingStatus.PARSED;
        String errorMessage = null;

        try {
            extractedText = textExtractor.extractText(file);
        } catch (Exception ex) {
            status = ParsingStatus.FAILED;
            errorMessage = ex.getMessage();
            extractedText = "";
        }

        Resume resume = Resume.builder()
                .candidateProfile(profile)
                .fileName(file.getOriginalFilename())
                .storageKey(storageKey)
                .contentType(file.getContentType() != null ? file.getContentType() : "application/octet-stream")
                .fileSize(file.getSize())
                .rawText(extractedText)
                .parsingStatus(status)
                .errorMessage(errorMessage)
                .skills(new ArrayList<>())
                .build();

        // Extract and normalize skills from parsed text
        if (status == ParsingStatus.PARSED && !extractedText.isBlank()) {
            Map<String, String> detectedSkills = normalizationService.extractSkillsWithEvidence(extractedText);
            for (Map.Entry<String, String> entry : detectedSkills.entrySet()) {
                ResumeSkill skill = ResumeSkill.builder()
                        .resume(resume)
                        .skillName(entry.getKey())
                        .normalizedName(entry.getKey())
                        .contextSnippet(entry.getValue())
                        .build();
                resume.getSkills().add(skill);
            }

            // Sync skills to profile if profile currently has none
            if (profile.getSkillsText() == null || profile.getSkillsText().isBlank()) {
                profile.setSkillsText(String.join(", ", detectedSkills.keySet()));
                candidateProfileRepository.save(profile);
            }
        }

        Resume saved = resumeRepository.save(resume);
        return ResumeResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<ResumeResponse> getMyResumes() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        CandidateProfile profile = candidateProfileRepository.findByUserId(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found: " + currentUserId));

        return resumeRepository.findByCandidateProfileIdOrderByCreatedAtDesc(profile.getId()).stream()
                .map(ResumeResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ResumeResponse getResumeById(UUID resumeId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found: " + resumeId));

        return ResumeResponse.fromEntity(resume);
    }

    @Transactional(readOnly = true)
    public Resource getResumeFileResource(UUID resumeId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found: " + resumeId));

        return fileStorageService.loadFileAsResource(resume.getStorageKey());
    }

    @Transactional
    public void deleteResume(UUID resumeId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        CandidateProfile profile = candidateProfileRepository.findByUserId(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate profile not found: " + currentUserId));

        Resume resume = resumeRepository.findByIdAndCandidateProfileId(resumeId, profile.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found or not owned by candidate: " + resumeId));

        fileStorageService.deleteFile(resume.getStorageKey());
        resumeRepository.delete(resume);
    }
}
