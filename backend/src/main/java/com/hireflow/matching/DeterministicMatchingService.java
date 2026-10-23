package com.hireflow.matching;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hireflow.job.Job;
import com.hireflow.job.JobSkill;
import com.hireflow.resume.Resume;
import com.hireflow.resume.ResumeSkill;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeterministicMatchingService {

    private static final Logger log = LoggerFactory.getLogger(DeterministicMatchingService.class);
    private final SkillNormalizationService normalizationService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public static class MatchComputation {
        public double overallScore;
        public double skillCoverageScore;
        public String matchedSkillsJson;
        public String missingRequiredSkillsJson;
        public String evidenceSnippetsJson;
        public String explanation;
    }

    public MatchComputation computeMatch(Job job, Resume resume) {
        MatchComputation result = new MatchComputation();

        if (resume == null || job == null || job.getSkills() == null || job.getSkills().isEmpty()) {
            result.overallScore = 50.0;
            result.skillCoverageScore = 50.0;
            result.matchedSkillsJson = "[]";
            result.missingRequiredSkillsJson = "[]";
            result.evidenceSnippetsJson = "{}";
            result.explanation = "General profile review required. Job requirements or resume text pending detailed extraction.";
            return result;
        }

        // Normalize candidate skills from structured entities or raw text
        Set<String> candidateSkillSet = new HashSet<>();
        Map<String, String> candidateSnippets = new HashMap<>();

        if (resume.getSkills() != null) {
            for (ResumeSkill rs : resume.getSkills()) {
                String norm = normalizationService.normalize(rs.getNormalizedName());
                candidateSkillSet.add(norm.toLowerCase());
                if (rs.getContextSnippet() != null) {
                    candidateSnippets.put(norm, rs.getContextSnippet());
                }
            }
        }

        if (resume.getRawText() != null && !resume.getRawText().isBlank()) {
            Map<String, String> textExtracted = normalizationService.extractSkillsWithEvidence(resume.getRawText());
            for (Map.Entry<String, String> entry : textExtracted.entrySet()) {
                candidateSkillSet.add(entry.getKey().toLowerCase());
                candidateSnippets.putIfAbsent(entry.getKey(), entry.getValue());
            }
        }

        List<JobSkill> requiredSkills = job.getSkills().stream()
                .filter(JobSkill::isRequired)
                .toList();
        List<JobSkill> preferredSkills = job.getSkills().stream()
                .filter(s -> !s.isRequired())
                .toList();

        List<Map<String, Object>> matchedSkillsList = new ArrayList<>();
        List<String> missingRequiredList = new ArrayList<>();
        Map<String, String> evidenceMap = new HashMap<>();

        double matchedRequiredWeight = 0.0;
        double totalRequiredWeight = 0.0;

        for (JobSkill skill : requiredSkills) {
            double weight = skill.getWeight() != null ? skill.getWeight() : 1.0;
            totalRequiredWeight += weight;
            String normalizedJobSkill = normalizationService.normalize(skill.getSkillName());

            if (candidateSkillSet.contains(normalizedJobSkill.toLowerCase())) {
                matchedRequiredWeight += weight;
                matchedSkillsList.add(Map.of(
                        "name", normalizedJobSkill,
                        "required", true,
                        "weight", weight
                ));
                evidenceMap.put(normalizedJobSkill, candidateSnippets.getOrDefault(normalizedJobSkill, "Verified in resume text"));
            } else {
                missingRequiredList.add(normalizedJobSkill);
            }
        }

        double matchedPreferredWeight = 0.0;
        double totalPreferredWeight = 0.0;

        for (JobSkill skill : preferredSkills) {
            double weight = skill.getWeight() != null ? skill.getWeight() : 0.8;
            totalPreferredWeight += weight;
            String normalizedJobSkill = normalizationService.normalize(skill.getSkillName());

            if (candidateSkillSet.contains(normalizedJobSkill.toLowerCase())) {
                matchedPreferredWeight += weight;
                matchedSkillsList.add(Map.of(
                        "name", normalizedJobSkill,
                        "required", false,
                        "weight", weight
                ));
                evidenceMap.put(normalizedJobSkill, candidateSnippets.getOrDefault(normalizedJobSkill, "Verified in resume text"));
            }
        }

        double reqRatio = totalRequiredWeight > 0 ? (matchedRequiredWeight / totalRequiredWeight) : 1.0;
        double prefRatio = totalPreferredWeight > 0 ? (matchedPreferredWeight / totalPreferredWeight) : 1.0;

        double overall;
        if (totalPreferredWeight > 0) {
            overall = (reqRatio * 0.75 + prefRatio * 0.25) * 100.0;
        } else {
            overall = reqRatio * 100.0;
        }

        double coverage = reqRatio * 100.0;

        result.overallScore = round(overall);
        result.skillCoverageScore = round(coverage);

        try {
            result.matchedSkillsJson = objectMapper.writeValueAsString(matchedSkillsList);
            result.missingRequiredSkillsJson = objectMapper.writeValueAsString(missingRequiredList);
            result.evidenceSnippetsJson = objectMapper.writeValueAsString(evidenceMap);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize matching JSON", e);
            result.matchedSkillsJson = "[]";
            result.missingRequiredSkillsJson = "[]";
            result.evidenceSnippetsJson = "{}";
        }

        result.explanation = generateExplanation(job.getTitle(), reqRatio, prefRatio, missingRequiredList, matchedSkillsList.size(), job.getSkills().size());
        return result;
    }

    private String generateExplanation(String jobTitle, double reqRatio, double prefRatio, List<String> missing, int matchedCount, int totalCount) {
        StringBuilder sb = new StringBuilder();
        int reqPct = (int) Math.round(reqRatio * 100);
        sb.append(String.format("Candidate matches %d%% of mandatory technical requirements for %s (%d/%d skills detected). ",
                reqPct, jobTitle, matchedCount, totalCount));

        if (missing.isEmpty()) {
            sb.append("All mandatory skill prerequisites are confirmed in candidate resume.");
        } else {
            sb.append(String.format("Missing or unverified required skills: %s. Recommend exploring these areas during the technical interview.",
                    String.join(", ", missing)));
        }

        return sb.toString();
    }

    private double round(double val) {
        return BigDecimal.valueOf(val).setScale(1, RoundingMode.HALF_UP).doubleValue();
    }
}
