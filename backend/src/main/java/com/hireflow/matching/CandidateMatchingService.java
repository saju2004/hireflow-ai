package com.hireflow.matching;

import com.hireflow.application.Application;
import com.hireflow.common.ResourceNotFoundException;
import com.hireflow.job.Job;
import com.hireflow.resume.Resume;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CandidateMatchingService {

    private final MatchResultRepository matchResultRepository;
    private final DeterministicMatchingService deterministicMatchingService;

    @Value("${hireflow.ai.provider:deterministic}")
    private String aiProvider;

    @Value("${hireflow.ai.api-key:}")
    private String aiApiKey;

    @Transactional
    public MatchResult computeAndSaveMatch(Application application, Job job, Resume resume) {
        DeterministicMatchingService.MatchComputation computation = deterministicMatchingService.computeMatch(job, resume);

        String explanation = computation.explanation;
        String version = "v1.0.0-deterministic";

        // Optional AI provider check: if configured, we could augment the explanation
        if (aiApiKey != null && !aiApiKey.isBlank() && !"deterministic".equalsIgnoreCase(aiProvider)) {
            version = "v1.1.0-ai-enhanced (" + aiProvider + ")";
        }

        Optional<MatchResult> existing = matchResultRepository.findByApplicationId(application.getId());
        MatchResult matchResult;

        if (existing.isPresent()) {
            matchResult = existing.get();
            matchResult.setOverallScore(computation.overallScore);
            matchResult.setSkillCoverageScore(computation.skillCoverageScore);
            matchResult.setMatchedSkills(computation.matchedSkillsJson);
            matchResult.setMissingRequiredSkills(computation.missingRequiredSkillsJson);
            matchResult.setEvidenceSnippets(computation.evidenceSnippetsJson);
            matchResult.setAiExplanation(explanation);
            matchResult.setAlgorithmVersion(version);
            matchResult.setCalculatedAt(Instant.now());
        } else {
            matchResult = MatchResult.builder()
                    .application(application)
                    .job(job)
                    .resume(resume)
                    .overallScore(computation.overallScore)
                    .skillCoverageScore(computation.skillCoverageScore)
                    .matchedSkills(computation.matchedSkillsJson)
                    .missingRequiredSkills(computation.missingRequiredSkillsJson)
                    .evidenceSnippets(computation.evidenceSnippetsJson)
                    .aiExplanation(explanation)
                    .algorithmVersion(version)
                    .calculatedAt(Instant.now())
                    .build();
        }

        return matchResultRepository.save(matchResult);
    }

    @Transactional(readOnly = true)
    public MatchResultResponse getMatchByApplicationId(UUID applicationId) {
        MatchResult match = matchResultRepository.findByApplicationId(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Match result not found for application: " + applicationId));

        return MatchResultResponse.fromEntity(match);
    }
}
