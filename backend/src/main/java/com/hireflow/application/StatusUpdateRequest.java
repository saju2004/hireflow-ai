package com.hireflow.application;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatusUpdateRequest {

    @NotNull(message = "New application status is required")
    private ApplicationStatus status;

    private String rejectionReason;

    private String notes;
}
