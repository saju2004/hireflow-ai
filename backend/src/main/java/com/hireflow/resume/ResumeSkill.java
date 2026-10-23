package com.hireflow.resume;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "resume_skills")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    @Column(name = "skill_name", nullable = false)
    private String skillName;

    @Column(name = "normalized_name", nullable = false)
    private String normalizedName;

    @Column(name = "years_experience")
    private Double yearsExperience;

    @Column(name = "context_snippet", columnDefinition = "TEXT")
    private String contextSnippet;
}
