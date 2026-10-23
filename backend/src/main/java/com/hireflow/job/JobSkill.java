package com.hireflow.job;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "job_skills")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @Column(name = "skill_name", nullable = false)
    private String skillName;

    @Column(name = "is_required", nullable = false)
    @Builder.Default
    private boolean isRequired = true;

    @Builder.Default
    private Double weight = 1.0;
}
