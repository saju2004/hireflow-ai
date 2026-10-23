package com.hireflow.application;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationRequest {

    @NotNull(message = "Job ID is required")
    private UUID jobId;

    private UUID resumeId;

    private String coverLetter;
}
