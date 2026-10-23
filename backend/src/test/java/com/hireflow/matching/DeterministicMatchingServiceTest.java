package com.hireflow.matching;

import com.hireflow.job.Job;
import com.hireflow.job.JobSkill;
import com.hireflow.resume.Resume;
import com.hireflow.resume.ResumeSkill;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class DeterministicMatchingServiceTest {

    private DeterministicMatchingService matchingService;
    private SkillNormalizationService normalizationService;

    @BeforeEach
    void setUp() {
        normalizationService = new SkillNormalizationService();
        matchingService = new DeterministicMatchingService(normalizationService);
    }

    @Test
    @DisplayName("Should return 100% skill coverage when all required skills are present")
    void testPerfectSkillMatch() {
        Job job = Job.builder()
                .title("Senior Java Engineer")
                .skills(new ArrayList<>())
                .build();

        job.getSkills().add(JobSkill.builder().skillName("Java").isRequired(true).weight(1.0).build());
        job.getSkills().add(JobSkill.builder().skillName("Spring Boot").isRequired(true).weight(1.0).build());
        job.getSkills().add(JobSkill.builder().skillName("PostgreSQL").isRequired(true).weight(1.0).build());

        Resume resume = Resume.builder()
                .rawText("Expert software architect specializing in Java, Spring Boot microservices, and PostgreSQL database optimization.")
                .skills(new ArrayList<>())
                .build();

        DeterministicMatchingService.MatchComputation match = matchingService.computeMatch(job, resume);

        assertNotNull(match);
        assertEquals(100.0, match.skillCoverageScore);
        assertEquals(100.0, match.overallScore);
        assertTrue(match.missingRequiredSkillsJson.contains("[]"));
        assertTrue(match.matchedSkillsJson.contains("Java"));
        assertTrue(match.matchedSkillsJson.contains("Spring Boot"));
        assertTrue(match.matchedSkillsJson.contains("PostgreSQL"));
    }

    @Test
    @DisplayName("Should identify missing required skills and compute weighted score proportionally")
    void testPartialSkillMatch() {
        Job job = Job.builder()
                .title("Full Stack Developer")
                .skills(new ArrayList<>())
                .build();

        job.getSkills().add(JobSkill.builder().skillName("Java").isRequired(true).weight(1.0).build());
        job.getSkills().add(JobSkill.builder().skillName("React").isRequired(true).weight(1.0).build());
        job.getSkills().add(JobSkill.builder().skillName("Kubernetes").isRequired(true).weight(1.0).build());

        // Resume only has Java and React, missing Kubernetes
        Resume resume = Resume.builder()
                .rawText("Senior developer with deep proficiency in Java and modern React user interfaces.")
                .skills(new ArrayList<>())
                .build();

        DeterministicMatchingService.MatchComputation match = matchingService.computeMatch(job, resume);

        assertNotNull(match);
        assertEquals(66.7, match.skillCoverageScore);
        assertTrue(match.missingRequiredSkillsJson.contains("Kubernetes"));
    }

    @Test
    @DisplayName("Matching results must be strictly reproducible for identical inputs")
    void testReproducibility() {
        Job job = Job.builder()
                .title("DevOps Engineer")
                .skills(List.of(
                        JobSkill.builder().skillName("Docker").isRequired(true).weight(1.0).build(),
                        JobSkill.builder().skillName("Kubernetes").isRequired(true).weight(1.0).build(),
                        JobSkill.builder().skillName("AWS").isRequired(false).weight(0.5).build()
                ))
                .build();

        Resume resume = Resume.builder()
                .rawText("DevOps specialist with Docker and AWS experience.")
                .build();

        DeterministicMatchingService.MatchComputation run1 = matchingService.computeMatch(job, resume);
        DeterministicMatchingService.MatchComputation run2 = matchingService.computeMatch(job, resume);

        assertEquals(run1.overallScore, run2.overallScore);
        assertEquals(run1.skillCoverageScore, run2.skillCoverageScore);
        assertEquals(run1.matchedSkillsJson, run2.matchedSkillsJson);
        assertEquals(run1.missingRequiredSkillsJson, run2.missingRequiredSkillsJson);
    }
}
