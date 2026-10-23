package com.hireflow.matching;

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
public class MatchResultResponse {
    private UUID id;
    private UUID applicationId;
    private UUID jobId;
    private String jobTitle;
    private UUID resumeId;
    private Double overallScore;
    private Double skillCoverageScore;
    private String matchedSkills;
    private String missingRequiredSkills;
    private String evidenceSnippets;
    private String aiExplanation;
    private String algorithmVersion;
    private Instant calculatedAt;

    public static MatchResultResponse fromEntity(MatchResult match) {
        return MatchResultResponse.builder()
                .id(match.getId())
                .applicationId(match.getApplication().getId())
                .jobId(match.getJob().getId())
                .jobTitle(match.getJob().getTitle())
                .resumeId(match.getResume() != null ? match.getResume().getId() : null)
                .overallScore(match.getOverallScore())
                .skillCoverageScore(match.getSkillCoverageScore())
                .matchedSkills(match.getMatchedSkills())
                .missingRequiredSkills(match.getMissingRequiredSkills())
                .evidenceSnippets(match.getEvidenceSnippets())
                .aiExplanation(match.getAiExplanation())
                .algorithmVersion(match.getAlgorithmVersion())
                .calculatedAt(match.getCalculatedAt())
                .build();
    }
}
