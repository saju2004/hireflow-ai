package com.hireflow.job;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobRequest {

    @NotBlank(message = "Job title is required")
    private String title;

    @NotBlank(message = "Job description is required")
    private String description;

    private String responsibilities;

    @NotNull(message = "Experience level is required")
    private ExperienceLevel experienceLevel;

    @NotNull(message = "Employment type is required")
    private EmploymentType employmentType;

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Workplace type is required")
    private WorkplaceType workplaceType;

    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private String currency;

    private List<JobSkillDto> skills;
}
