package com.hireflow.job;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobSkillDto {
    private UUID id;
    private String skillName;
    @Builder.Default
    private boolean isRequired = true;
    @Builder.Default
    private Double weight = 1.0;

    public static JobSkillDto fromEntity(JobSkill skill) {
        return JobSkillDto.builder()
                .id(skill.getId())
                .skillName(skill.getSkillName())
                .isRequired(skill.isRequired())
                .weight(skill.getWeight())
                .build();
    }
}
