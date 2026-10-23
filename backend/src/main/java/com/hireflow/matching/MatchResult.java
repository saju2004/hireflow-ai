package com.hireflow.matching;

import com.hireflow.application.Application;
import com.hireflow.job.Job;
import com.hireflow.resume.Resume;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "match_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchResult {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false, unique = true)
    private Application application;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id")
    private Resume resume;

    @Column(name = "overall_score", nullable = false)
    @Builder.Default
    private Double overallScore = 0.0;

    @Column(name = "skill_coverage_score", nullable = false)
    @Builder.Default
    private Double skillCoverageScore = 0.0;

    @Column(name = "matched_skills", columnDefinition = "TEXT")
    private String matchedSkills;

    @Column(name = "missing_required_skills", columnDefinition = "TEXT")
    private String missingRequiredSkills;

    @Column(name = "evidence_snippets", columnDefinition = "TEXT")
    private String evidenceSnippets;

    @Column(name = "ai_explanation", columnDefinition = "TEXT")
    private String aiExplanation;

    @Column(name = "algorithm_version", nullable = false)
    @Builder.Default
    private String algorithmVersion = "v1.0.0-deterministic";

    @CreationTimestamp
    @Column(name = "calculated_at", nullable = false)
    private Instant calculatedAt;
}
