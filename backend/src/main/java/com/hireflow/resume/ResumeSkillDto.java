package com.hireflow.resume;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeSkillDto {
    private UUID id;
    private String skillName;
    private String normalizedName;
    private Double yearsExperience;
    private String contextSnippet;

    public static ResumeSkillDto fromEntity(ResumeSkill entity) {
        return ResumeSkillDto.builder()
                .id(entity.getId())
                .skillName(entity.getSkillName())
                .normalizedName(entity.getNormalizedName())
                .yearsExperience(entity.getYearsExperience())
                .contextSnippet(entity.getContextSnippet())
                .build();
    }
}
